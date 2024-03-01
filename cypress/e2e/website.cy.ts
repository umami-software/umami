describe('Website tests', () => {
  beforeEach(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
    cy.get('a[href="/settings"]').click();
    cy.url().should('include', '/settings/websites');
  });

  it.skip('Add a website', () => {
    cy.dataCy('button-website-add').click();
    cy.contains(/Add website/i).should('be.visible');
    cy.dataCy('input-name').click().type('Test Website', {
      delay: 100,
    });
    cy.dataCy('input-domain').click().type('testwebsite.com');
    cy.dataCy('button-submit').click();
    cy.get('td[label="Name"]').should('contain.text', 'Test Website');
    cy.get('td[label="Domain"]').should('contain.text', 'testwebsite.com');
  });

  it('Test tracking script content', () => {
    cy.dataCy('link-button-edit').first().click();
    cy.contains(/Tracking code/i).should('be.visible');
    cy.get('div')
      .contains(/Tracking code/i)
      .click();
    cy.get('textarea').should('contain.text', Cypress.config().baseUrl + '/script2.js');
  });

  it('Test tracking script content', () => {
    cy.dataCy('link-button-edit').first().click();
    cy.contains(/Tracking code/i).should('be.visible');
    cy.get('div')
      .contains(/Tracking code/i)
      .click();
    cy.get('textarea').should('contain.text', Cypress.config().baseUrl + '/script.js');
  });
});
