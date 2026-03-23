describe('Sessions sorting API tests', () => {
  Cypress.session.clearAllSavedSessions();

  let websiteId;

  before(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
    cy.fixture('websites').then(data => {
      cy.request({
        method: 'POST',
        url: '/api/websites',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: data.websiteCreate,
      }).then(response => {
        websiteId = response.body.id;
        expect(response.status).to.eq(200);
      });
    });
  });

  it('Returns sessions with default sort (no sort params).', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body).to.have.property('count');
      expect(response.body).to.have.property('page');
      expect(response.body).to.have.property('pageSize');
    });
  });

  it('Accepts orderBy=visits with sortDescending=true.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'visits',
        sortDescending: 'true',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body).to.have.property('orderBy');
    });
  });

  it('Accepts orderBy=views with sortDescending=false.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'views',
        sortDescending: 'false',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Accepts orderBy=createdAt.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'createdAt',
        sortDescending: 'true',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Accepts orderBy=firstAt.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'firstAt',
        sortDescending: 'false',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Falls back gracefully with invalid orderBy value.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'invalid_column',
        sortDescending: 'true',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Works with sorting combined with search.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'views',
        sortDescending: 'true',
        search: 'Chrome',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Works with sorting combined with pagination.', () => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;

    cy.request({
      method: 'GET',
      url: `/api/websites/${websiteId}/sessions`,
      headers: {
        Authorization: Cypress.env('authorization'),
      },
      qs: {
        startAt: oneDayAgo,
        endAt: now,
        orderBy: 'visits',
        sortDescending: 'true',
        page: 1,
        pageSize: 5,
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
      expect(response.body).to.have.property('page', 1);
      expect(response.body).to.have.property('pageSize', 5);
    });
  });

  after(() => {
    cy.deleteWebsite(websiteId);
  });
});
