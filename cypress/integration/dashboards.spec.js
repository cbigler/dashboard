/// <reference types="Cypress" />

const DEFAULT_EMAIL = 'ryan+gausinternational@density.io';
const DEFAULT_PASSWORD = 'password goes here';

Cypress.Commands.add("login", (email=DEFAULT_EMAIL, password=DEFAULT_PASSWORD) => {
  cy.visit('/');

  cy.get('[data-label=login-email]').type(email);
  cy.get('[data-label=login-password]').type(password);
  cy.get('[data-label=login-submit]').click();
});

describe('Dashboards', () => {
  before(() => {
    delete window.localStorage.sessionToken;
    cy.login();
  });
  it('creates and deletes a dashboard', () => {
    cy.url().should('include', '/#/dashboards')

    // CREATE DASHBOARD

    // Open dropdown, click "add dashboard"
    cy.get('[data-label=dashboard-dropdown]').click();
    cy.get('[data-label=dashboard-add]').click();

    // Type new dashbaord name into dialog and submit it
    cy.get(`[data-label=dialog-inputbox]`).type('My dashboard');
    cy.get(`[data-label=dialog-submit]`).click();

    // Assert a toast was shown confirming the operation was successful
    cy.get(`[data-label=toast-default`).should('exist');

    // Note: this relates to https://densityio.atlassian.net/browse/AN-274 which is in progress,
    // once that issue is fixed this can be removed
    cy.visit('/');

    // DELETE DASHBOARD

    // Open dropdown, click on the newly created dashboard
    cy.get('[data-label=dashboard-dropdown]').click();
    cy.get('[data-label=dashboard-list] div').contains('My dashboard').parent().click();
    cy.get('[data-label=dashboard-edit]').click();

    // Click delete and confirm the deletion
    cy.get('[data-label=dashboard-delete]').click();
    cy.get('[data-label=dialog-submit]').click();

    // Assert a toast was shown confirming the operation was successful
    cy.get(`[data-label=toast-default`).should('exist');
  });
});
