const express = require('express')
const { searchFactory } = require('../controllers/search')
const paginationService = require('../services/paginationService')
const contextProperties = require('../contextProperties')

const router = express.Router({ mergeParams: true })

const controller = ({ oauthApi }) => {
  const searchApi = ({
    locals: context,
    user: nameFilter,
    groupCode,
    roleCode,
    status,
    pageNumber: page,
    pageSize: size,
  }) => oauthApi.userSearch(context, { nameFilter, group: groupCode, role: roleCode, status }, page, size)

  const { index, results } = searchFactory(
    paginationService,
    oauthApi.assignableGroups,
    oauthApi.searchableRoles,
    searchApi,
    contextProperties.getPageable,
    '/search-external-users',
    '/manage-external-users',
    'Search for an external user',
  )

  router.get('/', index)
  router.get('/results', results)
  router.post('/results', results)
  return router
}

module.exports = (dependencies) => controller(dependencies)
