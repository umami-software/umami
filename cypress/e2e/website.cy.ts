describe('Website tests', () => {
  Cypress.session.clearAllSavedSessions();

  beforeEach(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
  });

  it('Add a website', () => {
    // add website
    cy.visit('/settings/websites');
    cy.getDataTest('button-website-add').click();
    cy.contains(/Add website/i).should('be.visible');
    cy.getDataTest('input-name').find('input').as('inputUsername').click();
    cy.getDataTest('input-name').find('input').type('Add test', { delay: 0 });
    cy.getDataTest('input-domain').find('input').click();
    cy.getDataTest('input-domain').find('input').type('addtest.com', { delay: 0 });
    cy.getDataTest('button-submit').click();
    cy.get('td[label="Name"]').should('contain.text', 'Add test');
    cy.get('td[label="Domain"]').should('contain.text', 'addtest.com');

    // clean-up data
    cy.getDataTest('link-button-edit').first().click();
    cy.contains(/Details/i).should('be.visible');
    cy.getDataTest('text-field-websiteId')
      .find('input')
      .then($input => {
        const websiteId = $input[0].value;
        cy.deleteWebsite(websiteId);
      });
    cy.visit('/settings/websites');
    cy.contains(/Add test/i).should('not.exist');
  });

  it('Edit a website', () => {
    // prep data
    cy.addWebsite('Update test', 'updatetest.com');
    cy.visit('/settings/websites');

    // edit website
    cy.getDataTest('link-button-edit').first().click();
    cy.contains(/Details/i).should('be.visible');
    cy.getDataTest('input-name').find('input').click();
    cy.getDataTest('input-name').find('input').clear();
    cy.getDataTest('input-name').find('input').type('Updated website', { delay: 0 });
    cy.getDataTest('input-domain').find('input').click();
    cy.getDataTest('input-domain').find('input').clear();
    cy.getDataTest('input-domain').find('input').type('updatedwebsite.com', { delay: 0 });
    cy.getDataTest('button-submit').click({ force: true });
    cy.getDataTest('input-name').find('input').should('have.value', 'Updated website');
    cy.getDataTest('input-domain').find('input').should('have.value', 'updatedwebsite.com');

    // verify tracking script
    cy.get('div')
      .contains(/Tracking code/i)
      .click();
    cy.get('textarea').should('contain.text', Cypress.config().baseUrl + '/script.js');

    // clean-up data
    cy.get('div')
      .contains(/Details/i)
      .click();
    cy.contains(/Details/i).should('be.visible');
    cy.getDataTest('text-field-websiteId')
      .find('input')
      .then($input => {
        const websiteId = $input[0].value;
        cy.deleteWebsite(websiteId);
      });
    cy.visit('/settings/websites');
    cy.contains(/Add test/i).should('not.exist');
  });

  it('Delete a website', () => {
    // prep data
    cy.addWebsite('Delete test', 'deletetest.com');
    cy.visit('/settings/websites');

    // delete website
    cy.getDataTest('link-button-edit').first().click();
    cy.contains(/Data/i).should('be.visible');
    cy.get('div').contains(/Data/i).click();
    cy.contains(/All website data will be deleted./i).should('be.visible');
    cy.getDataTest('button-delete').click();
    cy.contains(/Type DELETE in the box below to confirm./i).should('be.visible');
    cy.get('input[name="confirm"').type('DELETE');
    cy.get('button[type="submit"]').click();
    cy.contains(/Delete test/i).should('not.exist');
  });
});
