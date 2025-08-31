import { signIn, signUp, getUserById } from '@/lib/auth'
import { userApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  userApi: {
    login: jest.fn(),
    create: jest.fn(),
    getById: jest.fn(),
  },
}))

const mockUserApi = userApi as jest.Mocked<typeof userApi>

describe('Auth Library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User Conversion', () => {
    it('converts API user to frontend user format through signIn', async () => {
      const mockApiResponse = {
        user: {
          userId: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor123',
      }

      mockUserApi.login.mockResolvedValue(mockApiResponse)

      const result = await signIn('test@example.com', 'password')

      expect(result).toEqual({
        user: {
          userId: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          visitorId: 'visitor123',
        },
        visitorId: 'visitor123',
      })
    })

    it('converts API user without visitorId through signUp', async () => {
      const mockApiResponse = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'operator',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockUserApi.create.mockResolvedValue(mockApiResponse)

      const result = await signUp('Test User', 'test@example.com', 'password')

      expect(result).toEqual({
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'operator',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        visitorId: undefined,
      })
    })

    it('handles different user roles', async () => {
      const visitorResponse = {
        user: {
          userId: '1',
          name: 'Visitor',
          email: 'visitor@test.com',
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor123',
      }

      const operatorResponse = {
        user: {
          userId: '2',
          name: 'Operator',
          email: 'operator@test.com',
          role: 'operator',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor456',
      }

      const adminResponse = {
        user: {
          userId: '3',
          name: 'Admin',
          email: 'admin@test.com',
          role: 'administrator',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor789',
      }

      mockUserApi.login
        .mockResolvedValueOnce(visitorResponse)
        .mockResolvedValueOnce(operatorResponse)
        .mockResolvedValueOnce(adminResponse)

      const visitorResult = await signIn('visitor@test.com', 'password')
      const operatorResult = await signIn('operator@test.com', 'password')
      const adminResult = await signIn('admin@test.com', 'password')

      expect(visitorResult?.user.role).toBe('visitor')
      expect(operatorResult?.user.role).toBe('operator')
      expect(adminResult?.user.role).toBe('administrator')
    })
  })

  describe('signIn', () => {
    it('successfully signs in user', async () => {
      const mockApiResponse = {
        user: {
          userId: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor123',
      }

      mockUserApi.login.mockResolvedValue(mockApiResponse)

      const result = await signIn('test@example.com', 'password')

      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      })

      expect(result).toEqual({
        user: {
          userId: '123',
          name: 'Test User',
          email: 'test@example.com',
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
          visitorId: 'visitor123',
        },
        visitorId: 'visitor123',
      })
    })

    it('returns null on login failure', async () => {
      mockUserApi.login.mockRejectedValue(new Error('Invalid credentials'))

      const result = await signIn('wrong@example.com', 'wrongpassword')

      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      })

      expect(result).toBeNull()
    })

    it('handles network errors', async () => {
      mockUserApi.login.mockRejectedValue(new Error('Network error'))

      const result = await signIn('test@example.com', 'password')

      expect(result).toBeNull()
    })

    it('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      mockUserApi.login.mockRejectedValue(new Error('API Error'))

      const result = await signIn('test@example.com', 'password')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Sign in error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('signUp', () => {
    it('successfully creates new user', async () => {
      const mockApiResponse = {
        userId: '123',
        name: 'New User',
        email: 'new@example.com',
        role: 'visitor',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockUserApi.create.mockResolvedValue(mockApiResponse)

      const result = await signUp('New User', 'new@example.com', 'password123')

      expect(mockUserApi.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: 'visitor',
      })

      expect(result).toEqual({
        userId: '123',
        name: 'New User',
        email: 'new@example.com',
        role: 'visitor',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        visitorId: undefined,
      })
    })

    it('returns null on registration failure', async () => {
      mockUserApi.create.mockRejectedValue(new Error('Email already exists'))

      const result = await signUp('Test User', 'existing@example.com', 'password')

      expect(mockUserApi.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password',
        role: 'visitor',
      })

      expect(result).toBeNull()
    })

    it('handles registration errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      mockUserApi.create.mockRejectedValue(new Error('Validation error'))

      const result = await signUp('Test User', 'invalid-email', 'password')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Sign up error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('getUserById', () => {
    it('successfully retrieves user by ID', async () => {
      const mockApiResponse = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockUserApi.getById.mockResolvedValue(mockApiResponse)

      const result = await getUserById('123')

      expect(mockUserApi.getById).toHaveBeenCalledWith('123')

      expect(result).toEqual({
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        visitorId: undefined,
      })
    })

    it('returns null when user not found', async () => {
      mockUserApi.getById.mockRejectedValue(new Error('User not found'))

      const result = await getUserById('nonexistent')

      expect(mockUserApi.getById).toHaveBeenCalledWith('nonexistent')
      expect(result).toBeNull()
    })

    it('handles API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      mockUserApi.getById.mockRejectedValue(new Error('API Error'))

      const result = await getUserById('123')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalledWith('Get user error:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('Error Handling', () => {
    it('handles malformed API responses', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock API returning unexpected data structure
      mockUserApi.login.mockResolvedValue({} as any)

      const result = await signIn('test@example.com', 'password')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('handles timeout errors', async () => {
      mockUserApi.login.mockRejectedValue(new Error('Request timeout'))

      const result = await signIn('test@example.com', 'password')

      expect(result).toBeNull()
    })

    it('handles server errors', async () => {
      mockUserApi.login.mockRejectedValue(new Error('Internal server error'))

      const result = await signIn('test@example.com', 'password')

      expect(result).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty email and password', async () => {
      mockUserApi.login.mockRejectedValue(new Error('Invalid input'))

      const result = await signIn('', '')

      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: '',
        password: '',
      })
      expect(result).toBeNull()
    })

    it('handles very long input strings', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com'
      const longPassword = 'a'.repeat(1000)

      mockUserApi.login.mockRejectedValue(new Error('Input too long'))

      const result = await signIn(longEmail, longPassword)

      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: longEmail,
        password: longPassword,
      })
      expect(result).toBeNull()
    })

    it('handles special characters in input', async () => {
      const specialEmail = 'test+tag@example.com'
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'

      mockUserApi.login.mockResolvedValue({
        user: {
          userId: '123',
          name: 'Test User',
          email: specialEmail,
          role: 'visitor',
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-01T00:00:00Z',
        },
        visitorId: 'visitor123',
      })

      const result = await signIn(specialEmail, specialPassword)

      expect(mockUserApi.login).toHaveBeenCalledWith({
        email: specialEmail,
        password: specialPassword,
      })
      expect(result).not.toBeNull()
    })
  })
})
