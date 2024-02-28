describe('Login test', () => {
  it(
    'logs user in with correct credentials and logs user out',
    {
      defaultCommandTimeout: 10000,
    },
    () => {
      cy.visit('/login');
      cy.dataCy('input-username').type(Cypress.env('umami_user'));
      cy.dataCy('input-password').type(Cypress.env('umami_password'));
      cy.dataCy('button-submit').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
      cy.dataCy('button-profile').click();
      cy.dataCy('item-logout').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/login');
    },
  );
});
