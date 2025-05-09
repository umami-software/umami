describe('Team API tests', () => {
  Cypress.session.clearAllSavedSessions();

  let teamId;
  let userId;

  before(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
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

  it('Creates a team.', () => {
    cy.fixture('teams').then(data => {
      const teamCreate = data.teamCreate;
      cy.request({
        method: 'POST',
        url: '/api/teams',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: teamCreate,
      }).then(response => {
        teamId = response.body[0].id;
        expect(response.status).to.eq(200);
        expect(response.body[0]).to.have.property('name', 'cypress');
        expect(response.body[1]).to.have.property('role', 'team-owner');
      });
    });
  });

  it('Gets a teams by ID.', () => {
    cy.request({
      method: 'GET',
      url: `/api/teams/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('id', teamId);
    });
  });

  it('Updates a team.', () => {
    cy.fixture('teams').then(data => {
      const teamUpdate = data.teamUpdate;
      cy.request({
        method: 'POST',
        url: `/api/teams/${teamId}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: teamUpdate,
      }).then(response => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('id', teamId);
        expect(response.body).to.have.property('name', 'cypressUpdate');
      });
    });
  });

  it('Get all users that belong to a team.', () => {
    cy.request({
      method: 'GET',
      url: `/api/teams/${teamId}/users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.data[0]).to.have.property('id');
      expect(response.body.data[0]).to.have.property('teamId');
      expect(response.body.data[0]).to.have.property('userId');
      expect(response.body.data[0]).to.have.property('user');
    });
  });

  it('Get a user belonging to a team.', () => {
    cy.request({
      method: 'GET',
      url: `/api/teams/${teamId}/users/${Cypress.env('umami_user_id')}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('teamId');
      expect(response.body).to.have.property('userId');
      expect(response.body).to.have.property('role');
    });
  });

  it('Get all websites belonging to a team.', () => {
    cy.request({
      method: 'GET',
      url: `/api/teams/${teamId}/websites`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('data');
    });
  });

  it('Add a user to a team.', () => {
    cy.request({
      method: 'POST',
      url: `/api/teams/${teamId}/users`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
      body: {
        userId,
        role: 'team-member',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userId', userId);
      expect(response.body).to.have.property('role', 'team-member');
    });
  });

  it(`Update a user's role on a team.`, () => {
    cy.request({
      method: 'POST',
      url: `/api/teams/${teamId}/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
      body: {
        role: 'team-view-only',
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('userId', userId);
      expect(response.body).to.have.property('role', 'team-view-only');
    });
  });

  it(`Remove a user from a team.`, () => {
    cy.request({
      method: 'DELETE',
      url: `/api/teams/${teamId}/users/${userId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Deletes a team.', () => {
    cy.request({
      method: 'DELETE',
      url: `/api/teams/${teamId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('ok', true);
    });
  });

  // it('Gets all teams that belong to a user.', () => {
  //   cy.request({
  //     method: 'GET',
  //     url: `/api/users/${userId}/teams`,
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: Cypress.env('authorization'),
  //     },
  //   }).then(response => {
  //     expect(response.status).to.eq(200);
  //     expect(response.body).to.have.property('data');
  //   });
  // });

  after(() => {
    cy.deleteUser(userId);
  });
});
