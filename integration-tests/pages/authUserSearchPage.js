const page = require('./page')

const user = () => cy.get('#user')
const submit = () => cy.get('button[type="submit"]')

const authUserSearchPage = () =>
  page('Search for auth user', {
    search: (text) => {
      if (text) user().type(text)
      else user().clear()
      submit().click()
    },
  })

export default {
  verifyOnPage: authUserSearchPage,
}