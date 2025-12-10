describe('User tests', () => {
  Cypress.session.clearAllSavedSessions();

  beforeEach(() => {
    cy.login(Cypress.env('umami_user'), Cypress.env('umami_password'));
    cy.visit('/settings/users');
  });

  it('Add a User', () => {
    // add user
    cy.contains(/Create user/i).should('be.visible');
    cy.getDataTest('button-create-user').click();
    cy.getDataTest('input-username').find('input').as('inputName').click();
    cy.get('@inputName').type('Test-user', { delay: 0 });
    cy.getDataTest('input-password').find('input').as('inputPassword').click();
    cy.get('@inputPassword').type('testPasswordCypress', { delay: 0 });
    cy.getDataTest('dropdown-role').click();
    cy.getDataTest('dropdown-item-user').click();
    cy.getDataTest('button-submit').click();
    cy.get('td[label="Username"]').should('contain.text', 'Test-user');
    cy.get('td[label="Role"]').should('contain.text', 'User');
  });

  it('Edit a User role and password', () => {
    // edit user
    cy.get('table tbody tr')
      .contains('td', /Test-user/i)
      .parent()
      .within(() => {
        cy.getDataTest('link-button-edit').click(); // Clicks the button inside the row
      });
    cy.getDataTest('input-password').find('input').as('inputPassword').click();
    cy.get('@inputPassword').type('newPassword', { delay: 0 });
    cy.getDataTest('dropdown-role').click();
    cy.getDataTest('dropdown-item-viewOnly').click();
    cy.getDataTest('button-submit').click();

    cy.visit('/settings/users');
    cy.get('table tbody tr')
      .contains('td', /Test-user/i)
      .parent()
      .should('contain.text', 'View only');

    cy.logout();
    cy.url().should('eq', Cypress.config().baseUrl + '/login');
    cy.getDataTest('input-username').find('input').as('inputUsername').click();
    cy.get('@inputUsername').type('Test-user', { delay: 0 });
    cy.get('@inputUsername').click();
    cy.getDataTest('input-password').find('input').type('newPassword', { delay: 0 });
    cy.getDataTest('button-submit').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/dashboard');
  });

  it('Delete a user', () => {
    // delete user
    cy.get('table tbody tr')
      .contains('td', /Test-user/i)
      .parent()
      .within(() => {
        cy.getDataTest('button-delete').click(); // Clicks the button inside the row
      });
    cy.contains(/Are you sure you want to delete Test-user?/i).should('be.visible');
    cy.getDataTest('button-confirm').click();
  });
});
