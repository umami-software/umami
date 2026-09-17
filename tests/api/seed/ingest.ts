import type { ApiClient } from '../client';
import { CACHE_HEADER } from '../helpers/constants';
import type { Dataset, RecordPayload, SendPayload } from './dataset';

export interface IngestResult {
  replay: { sessionId: string; visitId: string };
}

const BATCH_LIMIT = 500;

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
}

async function send(api: ApiClient, event: SendPayload, cache?: string) {
  const response = await api.post('/api/send', event, {
    headers: cache ? { [CACHE_HEADER]: cache } : undefined,
  });

  if (response.status !== 200) {
    throw new Error(`POST /api/send failed (${response.status}): ${response.text}`);
  }

  if (response.body?.beep) {
    throw new Error(
      'POST /api/send classified the request as a bot. Start the server with DISABLE_BOT_CHECK=1.',
    );
  }

  if (!response.body?.cache) {
    throw new Error(`POST /api/send returned no cache token: ${response.text}`);
  }

  return response.body as { cache: string; sessionId: string; visitId: string };
}

async function record(api: ApiClient, payload: RecordPayload, cache: string) {
  const response = await api.post('/api/record', payload, { headers: { [CACHE_HEADER]: cache } });

  if (response.status !== 200 || response.body?.ok !== true) {
    throw new Error(
      `POST /api/record (${payload.type}) failed (${response.status}): ${response.text}`,
    );
  }
}

export async function ingestDataset(api: ApiClient, dataset: Dataset): Promise<IngestResult> {
  for (const visit of dataset.visits) {
    let cache: string | undefined;

    for (const event of visit.events) {
      cache = (await send(api, event, cache)).cache;
    }
  }

  for (const items of chunk(dataset.batch, BATCH_LIMIT)) {
    const response = await api.post('/api/batch', items);

    if (response.status !== 200) {
      throw new Error(`POST /api/batch failed (${response.status}): ${response.text}`);
    }

    if (response.body?.errors) {
      throw new Error(
        `POST /api/batch reported ${response.body.errors} error(s): ${JSON.stringify(
          response.body.details?.slice(0, 3),
        )}`,
      );
    }
  }

  const live = await send(api, dataset.replay.pageview);

  await record(api, dataset.replay.record, live.cache);
  await record(api, dataset.replay.heatmap, live.cache);

  for (const event of dataset.realtime) {
    await send(api, event);
  }

  return { replay: { sessionId: live.sessionId, visitId: live.visitId } };
}
