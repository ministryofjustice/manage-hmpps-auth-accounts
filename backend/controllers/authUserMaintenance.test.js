const authUserMaintenanceFactory = require('./authUserMaintenance')

describe('Auth user maintenance controller', () => {
  const oauthApi = {}
  const res = { locals: {} }
  const {
    search,
    roles,
    groups,
    removeRole,
    addGroup,
    removeGroup,
    getUser,
    assignableRoles,
    assignableGroups,
    createUser,
    enableUser,
    disableUser,
    amendUser,
  } = authUserMaintenanceFactory(oauthApi)

  beforeEach(() => {
    oauthApi.getUser = jest.fn()
    oauthApi.userSearch = jest.fn()
    oauthApi.userRoles = jest.fn()
    oauthApi.userGroups = jest.fn()
    oauthApi.removeUserRole = jest.fn()
    oauthApi.addUserGroup = jest.fn()
    oauthApi.removeUserGroup = jest.fn()
    oauthApi.assignableRoles = jest.fn()
    oauthApi.assignableGroups = jest.fn()
    oauthApi.createUser = jest.fn()
    oauthApi.disableUser = jest.fn()
    oauthApi.enableUser = jest.fn()
    oauthApi.amendUser = jest.fn()
    res.json = jest.fn()
    res.status = jest.fn()
  })

  describe('search', () => {
    it('should call getUser if no @ in query', async () => {
      const response = { username: 'bob' }

      oauthApi.getUser.mockReturnValueOnce(response)

      await search({ query: { nameFilter: 'bob' } }, res)

      expect(res.json).toBeCalledWith([response])
    })

    it('should call userSearch if @ in query', async () => {
      const response = [{ username: 'bob' }, { username: 'joe' }]

      oauthApi.userSearch.mockReturnValueOnce(response)

      await search({ query: { nameFilter: 'bob@joe.com' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('no results', () => {
      beforeEach(async () => {
        oauthApi.userSearch.mockReturnValue('')
        await search({ query: { nameFilter: 'bob@joe.com' } }, res)
      })

      it('should return json error if no results', async () => {
        expect(res.json).toBeCalledWith([
          { targetName: 'user', text: 'No accounts for email address bob@joe.com found' },
        ])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await search({ query: {} }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Enter a username or email address' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 419, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.getUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await search({ query: { nameFilter: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.getUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(search({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })
  })

  describe('getUser', () => {
    it('should call getUser', async () => {
      const response = { username: 'bob' }

      oauthApi.getUser.mockReturnValueOnce(response)

      await getUser({ query: { username: 'bob' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('known issue', () => {
      const response = { status: 419, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.getUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await getUser({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.getUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(search({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })
  })

  describe('roles', () => {
    it('should call roles', async () => {
      const response = [{ roleCode: 'bob' }, { roleCode: 'joe' }]

      oauthApi.userRoles.mockReturnValueOnce(response)

      await roles({ query: { username: 'joe' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await roles({ query: {} }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Enter a username' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.userRoles.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await roles({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('groups', () => {
    it('should call groups', async () => {
      const response = [{ groupCode: 'bob' }, { groupCode: 'joe' }]

      oauthApi.userGroups.mockReturnValueOnce(response)

      await groups({ query: { username: 'joe' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await groups({ query: {} }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Enter a username' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.userGroups.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await groups({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('removeRole', () => {
    it('should call removeRole', async () => {
      const response = {}

      oauthApi.removeUserRole.mockReturnValueOnce(response)

      await removeRole({ query: { username: 'joe', role: 'maintain' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await removeRole({ query: { username: 'joe' } }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'role', text: 'Select a role to remove' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.removeUserRole.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await removeRole({ query: { username: 'joe', role: 'role' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'role', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('addGroup', () => {
    it('should call addGroup', async () => {
      const response = {}

      oauthApi.addUserGroup.mockReturnValueOnce(response)

      await addGroup({ query: { username: 'joe', group: 'maintain' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await addGroup({ query: { username: 'joe' } }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'group', text: 'Select a group' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.addUserGroup.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await addGroup({ query: { username: 'joe', group: 'group' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'group', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('removeGroup', () => {
    it('should call removeGroup', async () => {
      const response = {}

      oauthApi.removeUserGroup.mockReturnValueOnce(response)

      await removeGroup({ query: { username: 'joe', group: 'maintain' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('missing query', () => {
      beforeEach(async () => {
        await removeGroup({ query: { username: 'joe' } }, res)
      })

      it('should return 400 if missing query', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'group', text: 'Select a group to remove' }])
      })
      it('show return not found status', () => {
        expect(res.status).toBeCalledWith(400)
      })
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.removeUserGroup.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await removeGroup({ query: { username: 'joe', group: 'group' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'group', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('assignableRoles', () => {
    it('should call roles', async () => {
      const response = [{ roleCode: 'bob' }, { roleCode: 'joe' }]

      oauthApi.assignableRoles.mockReturnValueOnce(response)

      await assignableRoles({ query: { username: 'fred' } }, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.assignableRoles.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await assignableRoles({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })
  })

  describe('assignableGroups', () => {
    it('should call assignableGroups', async () => {
      const response = [{ groupCode: 'bob' }, { groupCode: 'joe' }]

      oauthApi.assignableGroups.mockReturnValueOnce(response)

      await assignableGroups({}, res)

      expect(res.json).toBeCalledWith(response)
    })

    describe('known issue', () => {
      const response = { status: 404, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      beforeEach(async () => {
        oauthApi.assignableGroups.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await assignableGroups({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'user', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(404)
      })
    })

    describe('unknown issue but client error', () => {
      const response = { status: 403, body: { error: 'Not Found' } }

      beforeEach(async () => {
        oauthApi.assignableGroups.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })
      })
      it('should pass error through if known issue occurs', async () => {
        await expect(assignableGroups({ query: { username: 'joe' } }, res)).rejects.toThrow(
          new Error('something went wrong')
        )
      })
    })
  })

  describe('createUser', () => {
    it('should call createUser', async () => {
      const response = {}
      const user = { firstName: 'joe', email: 'bob@joe.com' }

      oauthApi.createUser.mockReturnValueOnce(response)

      await createUser({ query: { username: 'bob' }, body: user }, res)

      expect(oauthApi.createUser).toBeCalledWith({}, 'bob', user)
    })

    describe('known issue', () => {
      const response = {
        status: 419,
        body: { error: 'Not Found', field: 'email', error_description: 'Some problem occurred' },
      }

      beforeEach(async () => {
        oauthApi.createUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await createUser({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'email', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.createUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(createUser({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })

    it('should map known error conditions', async () => {
      const response = {
        status: 400,
        body: { error: 'email.domain', field: 'email', error_description: 'Some problem occurred' },
      }

      oauthApi.createUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await createUser({ query: { nameFilter: 'joe' } }, res)

      expect(res.json).toBeCalledWith([
        {
          targetName: 'email',
          text: 'The email domain is not allowed.  Enter a work email address',
          error: 'email.domain',
        },
      ])
    })
  })

  describe('enableUser', () => {
    it('should call enableUser', async () => {
      const response = {}

      oauthApi.enableUser.mockReturnValueOnce(response)

      await enableUser({ query: { username: 'bob' } }, res)

      expect(oauthApi.enableUser).toBeCalledWith({}, { username: 'bob' })
    })

    describe('known issue', () => {
      const response = {
        status: 419,
        body: { error: 'Not Found', field: 'email', error_description: 'Some problem occurred' },
      }

      beforeEach(async () => {
        oauthApi.enableUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await enableUser({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'email', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.enableUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(enableUser({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })
  })

  describe('disableUser', () => {
    it('should call disableUser', async () => {
      const response = {}

      oauthApi.disableUser.mockReturnValueOnce(response)

      await disableUser({ query: { username: 'bob' } }, res)

      expect(oauthApi.disableUser).toBeCalledWith({}, { username: 'bob' })
    })

    describe('known issue', () => {
      const response = {
        status: 419,
        body: { error: 'Not Found', field: 'email', error_description: 'Some problem occurred' },
      }

      beforeEach(async () => {
        oauthApi.disableUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await disableUser({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'email', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.disableUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(disableUser({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })
  })

  describe('amendUser', () => {
    it('should call amendUser', async () => {
      const response = {}
      const user = { email: 'bob@joe.com' }

      oauthApi.amendUser.mockReturnValueOnce(response)

      await amendUser({ query: { username: 'bob' }, body: user }, res)

      expect(oauthApi.amendUser).toBeCalledWith({}, 'bob', user)
    })

    describe('known issue', () => {
      const response = {
        status: 419,
        body: { error: 'Not Found', field: 'email', error_description: 'Some problem occurred' },
      }

      beforeEach(async () => {
        oauthApi.amendUser.mockImplementation(() => {
          const error = new Error('something went wrong')
          error.response = response
          throw error
        })

        await amendUser({ query: { username: 'joe' } }, res)
      })
      it('should pass error through if known issue occurs', async () => {
        expect(res.json).toBeCalledWith([{ targetName: 'email', text: 'Some problem occurred', error: 'Not Found' }])
      })
      it('show pass through status', () => {
        expect(res.status).toBeCalledWith(419)
      })
    })

    it('should throw error through if unknown issue occurs', async () => {
      const response = { status: 500, body: { error: 'Not Found', error_description: 'Some problem occurred' } }

      const e = new Error('something went wrong')
      oauthApi.amendUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await expect(amendUser({ query: { nameFilter: 'joe' } }, res)).rejects.toThrow(e)
    })

    it('should map known error conditions', async () => {
      const response = {
        status: 400,
        body: { error: 'email.domain', field: 'email', error_description: 'Some problem occurred' },
      }

      oauthApi.amendUser.mockImplementation(() => {
        const error = new Error('something went wrong')
        error.response = response
        throw error
      })

      await amendUser({ query: { nameFilter: 'joe' } }, res)

      expect(res.json).toBeCalledWith([
        {
          targetName: 'email',
          text: 'The email domain is not allowed.  Enter a work email address',
          error: 'email.domain',
        },
      ])
    })
  })
})
