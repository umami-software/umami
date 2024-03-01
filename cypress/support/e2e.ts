/// <reference types="cypress" />

Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`);
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session(
    [username, password],
    () => {
      cy.visit('/login');
      cy.dataCy('input-username').type(username);
      cy.dataCy('input-password').type(password);
      cy.dataCy('button-submit').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
    },
    {
      validate: () => {
        cy.visit('/profile');
      },
    },
  );
  cy.visit('/dashboard');
});
