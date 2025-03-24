describe('Website tests', () => {
  Cypress.session.clearAllSavedSessions();

  beforeEach(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
  });

  //let userId;

  it('creates a user.', () => {
    cy.fixture('users').then(data => {
      const userPost = data.userPost;
      cy.request({
        method: 'POST',
        url: '/api/users',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Cypress.env('authorization'),
        },
        body: userPost,
      }).then(response => {
        //userId = response.body.id;
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('username', 'cypress1');
        expect(response.body).to.have.property('role', 'User');
      });
    });
  });
});
