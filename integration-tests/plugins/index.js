const auth = require('../mockApis/auth')
const prisonApi = require('../mockApis/prison')
const tokenverification = require('../mockApis/tokenverification')

const { resetStubs } = require('../mockApis/wiremock')

module.exports = (on) => {
  on('task', {
    reset: resetStubs,
    resetAndStubTokenVerification: async () => {
      await resetStubs()
      return tokenverification.stubVerifyToken(true)
    },
    getLoginUrl: auth.getLoginUrl,
    stubLogin: ({ username = 'ITAG_USER', roles = [{ roleCode: 'MAINTAIN_ACCESS_ROLES' }] }) =>
      Promise.all([
        auth.stubLogin(username, roles),
        prisonApi.stubUserMe(),
        prisonApi.stubUserCaseloads(),
        tokenverification.stubVerifyToken(true),
      ]),
    stubVerifyToken: (active = true) => tokenverification.stubVerifyToken(active),
    stubLoginPage: auth.redirect,
    stubAuthSearch: auth.stubAuthSearch,
    verifyAuthSearch: auth.verifyAuthSearch,
    stubAuthGetUsername: auth.stubAuthGetUsername,
    stubAuthGetUserWithEmail: auth.stubAuthGetUserWithEmail,
    stubAuthEmailSearch: auth.stubAuthEmailSearch,
    stubAuthUserGroups: auth.stubAuthUserGroups,
    stubAuthUserRoles: auth.stubAuthUserRoles,
    stubAuthAddRoles: auth.stubAuthAddRoles,
    stubAuthRemoveRole: auth.stubAuthRemoveRole,
    stubAuthAssignableRoles: auth.stubAuthAssignableRoles,
    stubAuthAssignableGroups: auth.stubAuthAssignableGroups,
    stubAuthAssignableGroupDetails: auth.stubAuthAssignableGroupDetails,
    stubAuthCreateChildGroup: auth.stubAuthCreateChildGroup,
    stubAuthDeleteChildGroup: auth.stubAuthDeleteChildGroup,
    stubAuthSearchableRoles: auth.stubAuthSearchableRoles,
    stubAuthChangeGroupName: auth.stubAuthChangeGroupName,
    stubAuthChangeChildGroupName: auth.stubAuthChangeChildGroupName,
    stubDpsGetRoles: prisonApi.stubGetRoles,
    stubDpsGetAdminRoles: prisonApi.stubGetRolesIncludingAdminRoles,
    stubDpsSearch: prisonApi.stubDpsSearch,
    stubDpsUserDetails: prisonApi.stubUserDetails,
    stubDpsUserGetRoles: prisonApi.stubUserGetRoles,
    verifyDpsSearch: prisonApi.verifyDpsSearch,
    verifyAddRoles: auth.verifyAddRoles,
    verifyRemoveRole: auth.verifyRemoveRole,
  })
}
