import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { signIn, signUp } from '@/lib/auth'

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  getUserById: jest.fn(),
}))

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>
const mockSignUp = signUp as jest.MockedFunction<typeof signUp>

// Test component to access context
const TestComponent = () => {
  const { user, loading, login, register, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{JSON.stringify(user)}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button 
        data-testid="register-btn" 
        onClick={() => register('Test User', 'test@example.com', 'password')}
      >
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  const mockUser = {
    userId: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'visitor' as const,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear localStorage before each test
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
      const storedUser = { ...mockUser, visitorId: 'visitor123' }
      localStorage.setItem('smartqueue_user', JSON.stringify(storedUser))
      
      mockSignIn.mockResolvedValue(storedUser)

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(storedUser))
      })
    })

    it('removes invalid stored user data', async () => {
      localStorage.setItem('smartqueue_user', 'invalid-json')

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
      })
    })

    it('handles API errors when validating stored user', async () => {
      const storedUser = { ...mockUser, visitorId: 'visitor123' }
      localStorage.setItem('smartqueue_user', JSON.stringify(storedUser))
      
      mockSignIn.mockRejectedValue(new Error('API Error'))

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
      })
    })
  })

  describe('Login Function', () => {
    it('successfully logs in user', async () => {
      const loginUser = { ...mockUser, visitorId: 'visitor123' }
      mockSignIn.mockResolvedValue(loginUser)

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        const expectedUser = { ...mockUser, visitorId: 'visitor123' }
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(expectedUser))
      })

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'smartqueue_user',
        JSON.stringify(loginUser)
      )
    })

    it('returns false on login failure', async () => {
      mockSignIn.mockResolvedValue(null)

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('handles login errors', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'))

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })
    })

    it('sets loading state during login', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockUser), 100)))

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'))
      })

      // Should show loading state immediately
      expect(screen.getByTestId('loading')).toHaveTextContent('true')
    })
  })

  describe('Register Function', () => {
    it('successfully registers user', async () => {
      mockSignUp.mockResolvedValue(mockUser)

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('register-btn'))
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

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      await act(async () => {
        fireEvent.click(screen.getByTestId('register-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })
  })

  describe('Logout Function', () => {
    it('clears user state and localStorage', async () => {
      const loginUser = { ...mockUser, visitorId: 'visitor123' }
      mockSignIn.mockResolvedValue(loginUser)

      await act(async () => {
        render(
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        )
      })

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false')
      })

      // Login first
      await act(async () => {
        fireEvent.click(screen.getByTestId('login-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(loginUser))
      })

      // Then logout
      await act(async () => {
        fireEvent.click(screen.getByTestId('logout-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null')
      })

      expect(localStorage.removeItem).toHaveBeenCalledWith('smartqueue_user')
    })
  })
})
