describe('Sessions sorting UI tests', () => {
  Cypress.session.clearAllSavedSessions();

  let websiteId;

  before(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
    cy.request({
      method: 'POST',
      url: '/api/websites',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Cypress.env('authorization'),
      },
      body: { name: 'Sort Test Site', domain: 'sorttest.com' },
    }).then(response => {
      websiteId = response.body.id;
      expect(response.status).to.eq(200);
    });
  });

  beforeEach(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
    cy.visit(`/websites/${websiteId}/sessions`);
  });

  it('Renders sortable column headers for visits, views, and last seen.', () => {
    cy.getDataTest('sort-visits').should('exist').and('be.visible');
    cy.getDataTest('sort-views').should('exist').and('be.visible');
    cy.getDataTest('sort-createdAt').should('exist').and('be.visible');
  });

  it('Clicking visits header adds orderBy and sortDescending to URL.', () => {
    cy.getDataTest('sort-visits').click();
    cy.url().should('include', 'orderBy=visits');
    cy.url().should('include', 'sortDescending=true');
  });

  it('Clicking visits header twice toggles to ascending sort.', () => {
    cy.getDataTest('sort-visits').click();
    cy.url().should('include', 'sortDescending=true');

    cy.getDataTest('sort-visits').click();
    cy.url().should('include', 'orderBy=visits');
    cy.url().should('include', 'sortDescending=false');
  });

  it('Clicking visits header three times clears sort params.', () => {
    cy.getDataTest('sort-visits').click();
    cy.getDataTest('sort-visits').click();
    cy.getDataTest('sort-visits').click();

    cy.url().should('not.include', 'orderBy');
    cy.url().should('not.include', 'sortDescending');
  });

  it('Clicking a different column switches sort target.', () => {
    cy.getDataTest('sort-visits').click();
    cy.url().should('include', 'orderBy=visits');

    cy.getDataTest('sort-views').click();
    cy.url().should('include', 'orderBy=views');
    cy.url().should('include', 'sortDescending=true');
  });

  it('Resets to page 1 when sort changes.', () => {
    cy.getDataTest('sort-visits').click();
    cy.url().should('include', 'page=1');
  });

  after(() => {
    cy.deleteWebsite(websiteId);
  });
});
