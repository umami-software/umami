describe('Login tests', () => {
  it(
    'logs user in with correct credentials and logs user out',
    {
      defaultCommandTimeout: 10000,
    },
    () => {
      cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
      cy.dataCy('button-profile').click();
      cy.dataCy('item-logout').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/login');
    },
  );
});
