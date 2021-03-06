const MenuPage = require('../pages/menuPage')

context('Login functionality', () => {
  before(() => {
    cy.clearCookies()
  })

  beforeEach(() => {
    cy.task('reset')
  })

  it('Root (/) redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Login page redirects to the auth login page if not logged in', () => {
    cy.task('stubLoginPage')
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Page redirects to the auth login page if not logged in', () => {
    cy.task('stubLogin', {})
    cy.visit('/login')
    cy.url().should('include', 'authorize')
    cy.get('h1').should('contain.text', 'Sign in')
  })

  it('Logout takes user to login page', () => {
    cy.task('stubLogin', {})
    cy.login()
    MenuPage.verifyOnPage()

    // can't do a visit here as cypress requires only one domain
    cy.request('/auth/logout').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.task('stubLogin', {})
    cy.login()
    MenuPage.verifyOnPage()
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.task('stubLogin', {})
    cy.login()
    const menuPage = MenuPage.verifyOnPage()
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubUserMe', { name: 'Bobby Brown' })
    cy.login()

    menuPage.headerUsername().contains('B. Brown')
  })

  it('Log in as ordinary user receives unauthorised', () => {
    cy.task('stubLogin', { username: 'joe', roles: [{}] })
    cy.login()
    const menuPage = MenuPage.verifyOnPage()
    menuPage.noAdminFunctionsMessage().contains('There are no admin functions associated with your account.')
  })

  it('Log in as access roles user', () => {
    cy.task('stubLogin', { roles: [{ roleCode: 'MAINTAIN_ACCESS_ROLES' }] })
    cy.login()
    MenuPage.verifyOnPage()
  })

  it('Log in and check header of user', () => {
    cy.task('stubLogin', { roles: [{ roleCode: 'MAINTAIN_ACCESS_ROLES' }] })
    cy.login()
    const menuPage = MenuPage.verifyOnPage()
    menuPage.headerUsername().contains('J. Stuart')
    menuPage.headerCaseload().contains('Moorland')
  })
})
