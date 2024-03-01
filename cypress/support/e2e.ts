/// <reference types="cypress" />
import { uuid } from '../../src/lib/crypto';

Cypress.Commands.add('getDataTest', (value: string) => {
  return cy.get(`[data-test=${value}]`);
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        username,
        password,
      },
    })
      .then(response => {
        Cypress.env('authorization', `bearer ${response.body.token}`);
        window.localStorage.setItem('umami.auth', JSON.stringify(response.body.token));
      })
      .its('status')
      .should('eq', 200);
  });
});

Cypress.Commands.add('addWebsite', (name: string, domain: string) => {
  cy.request({
    method: 'POST',
    url: '/api/websites',
    headers: {
      'Content-Type': 'application/json',
      Authorization: Cypress.env('authorization'),
    },
    body: {
      id: uuid(),
      createdBy: '41e2b680-648e-4b09-bcd7-3e2b10c06264',
      name: name,
      domain: domain,
    },
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('deleteWebsite', (websiteId: string) => {
  cy.request({
    method: 'DELETE',
    url: `/api/websites/${websiteId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: Cypress.env('authorization'),
    },
  }).then(response => {
    expect(response.status).to.eq(200);
  });
});
