import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { signIn, signUp, getUserById } from '@/lib/auth'

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  getUserById: jest.fn(),
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockSignUp = signUp as jest.MockedFunction<typeof signUp>
const mockGetUserById = getUserById as jest.MockedFunction<typeof getUserById>

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, login, register, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register-btn" onClick={() => register('Test User', 'test@example.com', 'password')}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('starts with null user and loading true', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      expect(screen.getByTestId('user')).toHaveTextContent('null')
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })

    it('loads user from localStorage on mount', async () => {
      const mockUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        visitorId: 'visitor123'
      }

      localStorage.setItem('smartqueue_user', JSON.stringify(mockUser))
      mockGetUserById.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
      })

      expect(mockGetUserById).toHaveBeenCalledWith('123')
    })

    it('removes invalid stored user data', async () => {
      localStorage.setItem('smartqueue_user', 'invalid-json')
      mockGetUserById.mockResolvedValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
    })

    it('handles API errors when validating stored user', async () => {
      localStorage.setItem('smartqueue_user', JSON.stringify({ userId: '123' }))
      mockGetUserById.mockRejectedValue(new Error('API Error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
    })
  })

  describe('Login Function', () => {
    it('successfully logs in user', async () => {
      const mockUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      const mockLoginResult = {
        user: mockUser,
        visitorId: 'visitor123'
      }

      mockSignIn.mockResolvedValue(mockLoginResult)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByTestId('login-btn')
      loginButton.click()

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password')
      })

      await waitFor(() => {
        const expectedUser = { ...mockUser, visitorId: 'visitor123' }
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(expectedUser))
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'smartqueue_user',
        JSON.stringify({ ...mockUser, visitorId: 'visitor123' })
      )
    })

    it('returns false on login failure', async () => {
      mockSignIn.mockResolvedValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByTestId('login-btn')
      loginButton.click()

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('handles login errors', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByTestId('login-btn')
      loginButton.click()

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })
    })

    it('sets loading state during login', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(null), 100)))

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const loginButton = screen.getByTestId('login-btn')
      loginButton.click()

      // Should show loading state immediately
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })
  })

  describe('Register Function', () => {
    it('successfully registers user', async () => {
      const mockUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      mockSignUp.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const registerButton = screen.getByTestId('register-btn')
      registerButton.click()

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('Test User', 'test@example.com', 'password')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'smartqueue_user',
        JSON.stringify(mockUser)
      )
    })

    it('returns false on registration failure', async () => {
      mockSignUp.mockResolvedValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      const registerButton = screen.getByTestId('register-btn')
      registerButton.click()

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('Test User', 'test@example.com', 'password')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Logout Function', () => {
    it('clears user state and localStorage', async () => {
      const mockUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      // Set initial user
      localStorage.setItem('smartqueue_user', JSON.stringify(mockUser))
      mockGetUserById.mockResolvedValue(mockUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser))
      })

      const logoutButton = screen.getByTestId('logout-btn')
      logoutButton.click()

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
    })
  })

  describe('Error Handling', () => {
    it('throws error when useAuth is used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases', () => {
    it('handles malformed localStorage data gracefully', async () => {
      localStorage.setItem('smartqueue_user', '{"userId": "123", "name": "Test"}') // Missing required fields
      mockGetUserById.mockResolvedValue(null)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })
    })

    it('preserves visitorId from stored data when validating user', async () => {
      const storedUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        visitorId: 'stored-visitor-id'
      }

      const apiUser = {
        userId: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'visitor' as const,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      }

      localStorage.setItem('smartqueue_user', JSON.stringify(storedUser))
      mockGetUserById.mockResolvedValue(apiUser)

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(storedUser))
      })
    })
  })
})
