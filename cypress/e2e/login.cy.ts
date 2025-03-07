describe('Login tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it(
    'logs user in with correct credentials and logs user out',
    {
      defaultCommandTimeout: 10000,
    },
    () => {
      cy.getDataTest('input-username').find('input').as('inputUsername').click();
      cy.get('@inputUsername').type(Cypress.env('umami_user'), { delay: 0 });
      cy.get('@inputUsername').click();
      cy.getDataTest('input-password')
        .find('input')
        .type(Cypress.env('umami_password'), { delay: 0 });
      cy.getDataTest('button-submit').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
      cy.logout();
    },
  );

  it('login with blank inputs or incorrect credentials', () => {
    cy.getDataTest('button-submit').click();
    cy.contains(/Required/i).should('be.visible');

    cy.getDataTest('input-username').find('input').as('inputUsername');
    cy.get('@inputUsername').click();
    cy.get('@inputUsername').type(Cypress.env('umami_user'), { delay: 0 });
    cy.get('@inputUsername').click();
    cy.getDataTest('input-password').find('input').type('wrongpassword', { delay: 0 });
    cy.getDataTest('button-submit').click();
    cy.contains(/Incorrect username and\/or password./i).should('be.visible');
  });
});
