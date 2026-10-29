import { randomUUID } from 'node:crypto';
import { expect, test } from './fixtures';
import { UNKNOWN_UUID } from './helpers/constants';
import { createWebsite, deleteWebsite } from './helpers/entities';
import { PERSONAS } from './seed/dataset';

const persona = PERSONAS[0];

function errorPayload(website: string, extra: Record<string, unknown> = {}) {
  return {
    type: 'error',
    payload: {
      version: 1,
      website,
      eventId: randomUUID(),
      timestamp: Date.now(),
      name: 'TypeError',
      message: 'Cannot read properties of undefined',
      stack: 'TypeError: Cannot read properties of undefined\n    at checkout (app.js:10:5)',
      url: 'https://example.com/checkout?step=2',
      release: '1.0.0',
      environment: 'production',
      tags: { plan: 'pro' },
      ...extra,
    },
  };
}

test.describe('Errors', () => {
  test.describe.configure({ mode: 'serial' });

  let websiteId = '';
  let base = '';
  let issueId = '';
  let otherIssueId = '';
  let eventId = '';
  let range: Record<string, number> = {};

  test.beforeAll(async ({ admin, api }) => {
    websiteId = (await createWebsite(admin)).id;
    base = `/api/websites/${websiteId}/errors`;
    range = { startAt: Date.now() - 3600000, endAt: Date.now() + 3600000 };

    // A real browser user agent, so the browser is parsed for the values endpoints.
    const browser = api.with({ 'user-agent': persona.userAgent });

    // Two occurrences of one issue and one of another.
    const first = await browser.post('/api/send', errorPayload(websiteId));
    const second = await browser.post('/api/send', errorPayload(websiteId));
    const other = await browser.post(
      '/api/send',
      errorPayload(websiteId, {
        name: 'RangeError',
        message: 'Invalid array length',
        url: '/cart',
      }),
    );

    expect([first.status, second.status, other.status]).toEqual([200, 200, 200]);
    expect(second.body.issueId).toBe(first.body.issueId);
    expect(other.body.issueId).not.toBe(first.body.issueId);

    issueId = first.body.issueId;
    eventId = first.body.eventId;
    otherIssueId = other.body.issueId;
  });

  test.afterAll(async ({ admin }) => {
    if (websiteId) {
      await deleteWebsite(admin, websiteId);
    }
  });

  test('GET /api/websites/{websiteId}/errors lists issues with their occurrences', async ({
    admin,
  }) => {
    const response = await admin.get(base, { params: range });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: issueId,
          title: 'TypeError: Cannot read properties of undefined',
          status: 'unresolved',
          occurrences: 2,
        }),
        expect.objectContaining({ id: otherIssueId, occurrences: 1 }),
      ]),
    );
  });

  test('GET /api/websites/{websiteId}/errors/stats totals all occurrences', async ({ admin }) => {
    const response = await admin.get(`${base}/stats`, { params: range });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ occurrences: 3, issues: 2 });
    expect(response.body.series.reduce((sum, { occurrences }) => sum + occurrences, 0)).toBe(3);
  });

  test('GET /api/websites/{websiteId}/errors/values returns filter values', async ({ admin }) => {
    const paths = await admin.get(`${base}/values`, { params: { ...range, type: 'urlPath' } });
    const releases = await admin.get(`${base}/values`, { params: { ...range, type: 'release' } });
    const badType = await admin.get(`${base}/values`, { params: { ...range, type: 'stack' } });

    expect(paths.status).toBe(200);
    // Query strings are dropped so one page groups as one value.
    expect(paths.body).toEqual(
      expect.arrayContaining([
        { value: '/checkout', count: 2 },
        { value: '/cart', count: 1 },
      ]),
    );
    expect(releases.body).toEqual([{ value: '1.0.0', count: 3 }]);
    expect(badType.status).toBe(400);
  });

  test('GET /api/websites/{websiteId}/errors/{issueId} returns the issue with its stats', async ({
    admin,
  }) => {
    const response = await admin.get(`${base}/${issueId}`, { params: range });
    const unknown = await admin.get(`${base}/${UNKNOWN_UUID}`, { params: range });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: issueId,
      websiteId,
      status: 'unresolved',
      occurrences: 2,
      issues: 1,
      canUpdate: true,
    });
    expect(unknown.status).toBe(404);
  });

  test('GET /api/websites/{websiteId}/errors/{issueId}/events lists only that issue', async ({
    admin,
  }) => {
    const response = await admin.get(`${base}/${issueId}/events`, { params: range });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.data.map(({ id }) => id)).toContain(eventId);
    expect(response.body.data.every(({ name }) => name === 'TypeError')).toBe(true);
  });

  test('GET /api/websites/{websiteId}/errors/{issueId}/events/{eventId} returns the event detail', async ({
    admin,
  }) => {
    const response = await admin.get(`${base}/${issueId}/events/${eventId}`);
    // An event must be looked up within its own issue.
    const wrongIssue = await admin.get(`${base}/${otherIssueId}/events/${eventId}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: eventId,
      name: 'TypeError',
      urlPath: '/checkout',
      release: '1.0.0',
      tags: { plan: 'pro' },
    });
    expect(wrongIssue.status).toBe(404);
  });

  test('GET /api/websites/{websiteId}/errors/{issueId}/values is scoped to the issue', async ({
    admin,
  }) => {
    const response = await admin.get(`${base}/${issueId}/values`, {
      params: { ...range, type: 'urlPath' },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ value: '/checkout', count: 2 }]);
  });

  test('PATCH /api/websites/{websiteId}/errors/{issueId} changes the status', async ({
    admin,
    user,
  }) => {
    const path = `${base}/${issueId}`;
    const notOwner = await user.request('PATCH', path, { data: { status: 'resolved' } });
    const badStatus = await admin.request('PATCH', path, { data: { status: 'done' } });
    const resolved = await admin.request('PATCH', path, { data: { status: 'resolved' } });
    const list = await admin.get(base, { params: { ...range, status: 'resolved' } });

    expect(notOwner.status).toBe(401);
    expect(badStatus.status).toBe(400);
    expect(resolved.status).toBe(200);
    expect(resolved.body).toEqual({ ok: true });
    expect(list.body.data.map(({ id }) => id)).toEqual([issueId]);
    expect(list.body.data[0]).toMatchObject({ status: 'resolved', resolvedAt: expect.any(String) });
  });

  test('error endpoints require access to the website', async ({ user, viewer, api, admin }) => {
    const notOwner = await user.get(base, { params: range });
    const viewOnly = await viewer.get(`${base}/stats`, { params: range });
    const anonymous = await api.get(`${base}/${issueId}`, { params: range });
    const badId = await admin.get(`/api/websites/${websiteId}/errors/not-a-uuid`, {
      params: range,
    });

    expect(notOwner.status).toBe(401);
    expect(viewOnly.status).toBe(401);
    expect(anonymous.status).toBe(401);
    expect(badId.status).toBe(400);
  });
});
