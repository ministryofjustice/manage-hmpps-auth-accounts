const page = require('./page')

const userPage = (user) =>
  page(user, {
    userRows: () => cy.get('[data-qa="user-details"] tbody tr'),
    roleRows: () => cy.get('[data-qa="user-roles"] tbody tr'),
    addRole: () => cy.get('[data-qa="add-role-button"]'),
    removeRole: (role) => cy.get(`[data-qa="remove-button-${role}"]`),
    searchResultsBreadcrumb: () => cy.get('a[href*="results"]'),
  })

export default {
  verifyOnPage: userPage,
}