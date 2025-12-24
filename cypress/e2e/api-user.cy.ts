describe('User API tests', () => {
  Cypress.session.clearAllSavedSessions();

  before(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
  });

  let userId;

  it('Creates a user.', () => {
    cy.fixture('users').then(data => {
      const userCreate = data.userCreate;
      cy.request({
        method: 'POST',
        url: '/api/users',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: userCreate,
      }).then(response => {
        userId = response.body.id;
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('username', 'cypress1');
        expect(response.body).to.have.property('role', 'user');
      });
    });
  });

  it('Returns all users. Admin access is required.', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin/users',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data[0]).to.have.property('id');
      expect(response.body.data[0]).to.have.property('username');
      expect(response.body.data[0]).to.have.property('password');
      expect(response.body.data[0]).to.have.property('role');
    });
  });

  it('Updates a user.', () => {
    cy.fixture('users').then(data => {
      const userUpdate = data.userUpdate;
      cy.request({
        method: 'POST',
        url: `/api/users/${userId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: userUpdate,
      }).then(response => {
        userId = response.body.id;
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', userId);
        expect(response.body).to.have.property('username', 'cypress1');
        expect(response.body).to.have.property('role', 'view-only');
      });
    });
  });

  it('Gets a user by ID.', () => {
    cy.request({
      method: 'GET',
      url: `/api/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', userId);
      expect(response.body).to.have.property('username', 'cypress1');
      expect(response.body).to.have.property('role', 'view-only');
    });
  });

  it('Deletes a user.', () => {
    cy.request({
      method: 'DELETE',
      url: `/api/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('ok', true);
    });
  });

  it('Gets all websites that belong to a user.', () => {
    cy.request({
      method: 'GET',
      url: `/api/users/${userId}/websites`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Gets all teams that belong to a user.', () => {
    cy.request({
      method: 'GET',
      url: `/api/users/${userId}/teams`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });
});
