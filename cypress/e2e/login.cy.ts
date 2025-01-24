describe('Login tests', () => {
  it(
    'logs user in with correct credentials and logs user out',
    {
      defaultCommandTimeout: 10000,
    },
    () => {
      cy.visit('/login');
      cy.getDataTest('input-username').find('input').click();
      cy.getDataTest('input-username').find('input').type(Cypress.env('umami_user'), { delay: 50 });
      cy.getDataTest('input-password').find('input').click();
      cy.getDataTest('input-password')
        .find('input')
        .type(Cypress.env('umami_password'), { delay: 50 });
      cy.getDataTest('button-submit').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
      cy.getDataTest('button-profile').click();
      cy.getDataTest('item-logout').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/login');
    },
  );
});
