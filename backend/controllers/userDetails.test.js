const { userDetailsFactory } = require('./userDetails')

describe('user detail factory', () => {
  const getUserRolesAndGroupsApi = jest.fn()
  const removeRoleApi = jest.fn()
  const removeGroupApi = jest.fn()
  const enableUserApi = jest.fn()
  const disableUserApi = jest.fn()
  const logError = jest.fn()
  const userDetails = userDetailsFactory(
    getUserRolesAndGroupsApi,
    removeRoleApi,
    removeGroupApi,
    enableUserApi,
    disableUserApi,
    '/maintain-external-users',
    '/manage-external-users',
    'Maintain external users',
    true,
    logError
  )

  it('should call userDetail render', async () => {
    const req = { params: { username: 'joe' }, flash: jest.fn() }
    getUserRolesAndGroupsApi.mockResolvedValue([
      {
        username: 'BOB',
        firstName: 'Billy',
        lastName: 'Bob',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
    ])
    const render = jest.fn()
    await userDetails.index(req, { render })
    expect(render).toBeCalledWith('userDetails.njk', {
      maintainTitle: 'Maintain external users',
      maintainUrl: '/maintain-external-users',
      staff: {
        firstName: 'Billy',
        lastName: 'Bob',
        name: 'Billy Bob',
        username: 'BOB',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      staffUrl: '/manage-external-users/joe',
      roles: [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      groups: [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
      hasMaintainAuthUsers: false,
      showEnableDisable: true,
      showExtraUserDetails: true,
      showGroups: true,
      errors: undefined,
    })
  })

  it('should pass through hasMaintainAuthUsers to userDetail render', async () => {
    const req = { params: { username: 'joe' }, flash: jest.fn() }
    getUserRolesAndGroupsApi.mockResolvedValue([
      {
        username: 'BOB',
        firstName: 'Billy',
        lastName: 'Bob',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
    ])
    const render = jest.fn()
    await userDetails.index(req, { render, locals: { user: { maintainAuthUsers: true } } })
    expect(render).toBeCalledWith('userDetails.njk', {
      maintainTitle: 'Maintain external users',
      maintainUrl: '/maintain-external-users',
      staff: {
        firstName: 'Billy',
        lastName: 'Bob',
        name: 'Billy Bob',
        username: 'BOB',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      staffUrl: '/manage-external-users/joe',
      roles: [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      groups: [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
      hasMaintainAuthUsers: true,
      showEnableDisable: true,
      showExtraUserDetails: true,
      showGroups: true,
      errors: undefined,
    })
  })

  it('should pass through show fields if not set', async () => {
    const req = { params: { username: 'joe' }, flash: jest.fn() }
    const dpsUserDetails = userDetailsFactory(
      getUserRolesAndGroupsApi,
      removeRoleApi,
      undefined,
      undefined,
      undefined,
      '/maintain-external-users',
      '/manage-external-users',
      'Maintain external users',
      false,
      logError
    )
    getUserRolesAndGroupsApi.mockResolvedValue([
      {
        username: 'BOB',
        firstName: 'Billy',
        lastName: 'Bob',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
    ])
    const render = jest.fn()
    await dpsUserDetails.index(req, { render })
    expect(render).toBeCalledWith('userDetails.njk', {
      maintainTitle: 'Maintain external users',
      maintainUrl: '/maintain-external-users',
      staff: {
        firstName: 'Billy',
        lastName: 'Bob',
        name: 'Billy Bob',
        username: 'BOB',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      staffUrl: '/manage-external-users/joe',
      roles: [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      groups: [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
      hasMaintainAuthUsers: false,
      showEnableDisable: false,
      showExtraUserDetails: false,
      showGroups: false,
      errors: undefined,
    })
  })

  it('should call getUserRolesAndGroupsApi with maintain admin flag set to false', async () => {
    const req = { params: { username: 'joe' }, flash: jest.fn() }
    getUserRolesAndGroupsApi.mockResolvedValue([
      {
        username: 'BOB',
        firstName: 'Billy',
        lastName: 'Bob',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
    ])
    const locals = { user: { maintainAuthUsers: true } }
    await userDetails.index(req, { render: jest.fn(), locals })
    expect(getUserRolesAndGroupsApi).toBeCalledWith(locals, 'joe', false)
  })

  it('should call getUserRolesAndGroupsApi with maintain admin flag set to true', async () => {
    const req = { params: { username: 'joe' }, flash: jest.fn() }
    getUserRolesAndGroupsApi.mockResolvedValue([
      {
        username: 'BOB',
        firstName: 'Billy',
        lastName: 'Bob',
        email: 'bob@digital.justice.gov.uk',
        enabled: true,
        verified: true,
        lastLoggedIn: '2020-11-23T11:13:08.387065',
      },
      [{ roleName: 'roleName1', roleCode: 'roleCode1' }],
      [{ groupName: 'groupName2', groupCode: 'groupCode2' }],
    ])
    const locals = { user: { maintainAccessAdmin: true } }
    await userDetails.index(req, { render: jest.fn(), locals })
    expect(getUserRolesAndGroupsApi).toBeCalledWith(locals, 'joe', true)
  })

  describe('remove role', () => {
    it('should remove role and redirect', async () => {
      const req = { params: { username: 'joe', role: 'role1' } }

      const redirect = jest.fn()
      const locals = jest.fn()
      await userDetails.removeRole(req, { redirect, locals })
      expect(redirect).toBeCalledWith('/manage-external-users/joe')
      expect(removeRoleApi).toBeCalledWith(locals, 'joe', 'role1')
    })

    it('should call error on failure', async () => {
      const render = jest.fn()
      removeRoleApi.mockRejectedValue(new Error('This failed'))
      await userDetails.removeRole({ params: { username: 'joe', role: 'role19' } }, { render })
      expect(render).toBeCalledWith('error.njk', { url: '/manage-external-users/joe' })
    })

    it('should ignore if user does not have role', async () => {
      const redirect = jest.fn()
      const error = new Error('This failed')
      // @ts-ignore
      error.status = 400
      removeRoleApi.mockRejectedValue(error)
      await userDetails.removeRole(
        {
          params: { username: 'joe', role: 'role99' },
          originalUrl: '/some-location',
        },
        { redirect }
      )
      expect(redirect).toBeCalledWith('/some-location')
    })
  })

  describe('remove group', () => {
    it('should remove group and redirect', async () => {
      const req = { params: { username: 'joe', group: 'group1' } }

      const redirect = jest.fn()
      const locals = jest.fn()
      await userDetails.removeGroup(req, { redirect, locals })
      expect(redirect).toBeCalledWith('/manage-external-users/joe')
      expect(removeGroupApi).toBeCalledWith(locals, 'joe', 'group1')
    })

    it('should call error on failure', async () => {
      const render = jest.fn()
      removeGroupApi.mockRejectedValue(new Error('This failed'))
      await userDetails.removeGroup({ params: { username: 'joe', role: 'group19' } }, { render })
      expect(render).toBeCalledWith('error.njk', { url: '/manage-external-users/joe' })
    })

    it('should ignore if user does not have group', async () => {
      const redirect = jest.fn()
      const error = new Error('This failed')
      // @ts-ignore
      error.status = 400
      removeGroupApi.mockRejectedValue(error)
      await userDetails.removeRole(
        {
          params: { username: 'joe', role: 'group99' },
          originalUrl: '/some-location',
        },
        { redirect }
      )
      expect(redirect).toBeCalledWith('/some-location')
    })
  })

  describe('enable user', () => {
    it('should enable user and redirect', async () => {
      const req = { params: { username: 'joe' } }

      const redirect = jest.fn()
      const locals = jest.fn()
      await userDetails.enableUser(req, { redirect, locals })
      expect(redirect).toBeCalledWith('/manage-external-users/joe')
      expect(enableUserApi).toBeCalledWith(locals, 'joe')
    })

    it('should call error on failure', async () => {
      const render = jest.fn()
      enableUserApi.mockRejectedValue(new Error('This failed'))
      await userDetails.enableUser({ params: { username: 'joe' } }, { render })
      expect(render).toBeCalledWith('error.njk', { url: '/manage-external-users/joe' })
    })
  })

  describe('disable user', () => {
    it('should disable user and redirect', async () => {
      const req = { params: { username: 'joe' } }

      const redirect = jest.fn()
      const locals = jest.fn()
      await userDetails.disableUser(req, { redirect, locals })
      expect(redirect).toBeCalledWith('/manage-external-users/joe')
      expect(disableUserApi).toBeCalledWith(locals, 'joe')
    })

    it('should call error on failure', async () => {
      const render = jest.fn()
      removeGroupApi.mockRejectedValue(new Error('This failed'))
      await userDetails.disableUser({ params: { username: 'joe' } }, { render })
      expect(render).toBeCalledWith('error.njk', { url: '/manage-external-users/joe' })
    })
  })
})
