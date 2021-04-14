const { validateCreateGroup } = require('./groupValidation')
const { trimObjValues } = require('../utils')

const createGroupFactory = (createGroup, manageGroupUrl) => {
  const stashStateAndRedirectToIndex = (req, res, errors, group) => {
    req.flash('createGroupErrors', errors)
    req.flash('group', group)
    res.redirect(req.originalUrl)
  }

  const index = async (req, res) => {
    const flashGroup = req.flash('group')
    const group = flashGroup != null && flashGroup.length > 0 ? flashGroup[0] : ''
    const groupUrl = manageGroupUrl
    res.render('createGroup.njk', {
      groupUrl,
      ...group,
      errors: req.flash('createGroupErrors'),
    })
  }

  const post = async (req, res) => {
    const group = trimObjValues(req.body)
    group.groupCode = group.groupCode.toUpperCase()
    const errors = validateCreateGroup(group)

    if (errors.length > 0) {
      stashStateAndRedirectToIndex(req, res, errors, [group])
    } else {
      try {
        await createGroup(res.locals, group)

        res.redirect(`${manageGroupUrl}/${group.groupCode}`)
      } catch (err) {
        if (err.status === 409 && err.response && err.response.body) {
          //  group code already exists
          const emailError = [{ href: '#groupCode', text: 'Group code already exists' }]
          stashStateAndRedirectToIndex(req, res, emailError, [group])
        } else {
          throw err
        }
      }
    }
  }
  return { index, post }
}

module.exports = {
  createGroupFactory,
}
