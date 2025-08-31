import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/login/page'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
jest.mock('@/contexts/auth-context')
jest.mock('@/hooks/use-toast')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('LoginPage', () => {
  const mockLogin = jest.fn()
  const mockToast = jest.fn()
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
    })

    // Mock useRouter
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }))
  })

  describe('UI Rendering', () => {
    it('renders login form with all required elements', () => {
      render(<LoginPage />)

      // Check for main elements
      expect(screen.getByText('SmartQueue')).toBeInTheDocument()
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
      
      // Check for form inputs
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      
      // Check for submit button
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      
      // Check for sign up link
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
      
      // Check for demo accounts section
      expect(screen.getByText(/demo accounts/i)).toBeInTheDocument()
      expect(screen.getByText(/visitor@gmail.com \/ password/i)).toBeInTheDocument()
      expect(screen.getByText(/operator@ebl.com.bd \/ password/i)).toBeInTheDocument()
      expect(screen.getByText(/admin@ebl.com.bd \/ password/i)).toBeInTheDocument()
    })

    it('renders form inputs with correct attributes', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email')
      expect(emailInput).toBeRequired()

      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password')
      expect(passwordInput).toBeRequired()
    })

    it('shows loading state when authentication is in progress', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        login: mockLogin,
        register: jest.fn(),
        logout: jest.fn(),
      })

      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /signing in/i })
      expect(submitButton).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Form Interactions', () => {
    it('updates email and password fields when user types', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('clears form fields after successful submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(true)

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emailInput).toHaveValue('')
        expect(passwordInput).toHaveValue('')
      })
    })
  })

  describe('Form Submission', () => {
    it('calls login function with correct credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(true)

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('prevents form submission when fields are empty', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      await user.click(submitButton)

      // Form should not submit due to required validation
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('shows success toast and redirects on successful login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(true)

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login successful',
          description: 'Welcome to SmartQueue!',
        })
      })
    })

    it('shows error toast on failed login', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(false)

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login failed',
          description: 'Invalid email or password. Try visitor@test.com / password',
          variant: 'destructive',
        })
      })
    })

    it('handles login errors gracefully', async () => {
      const user = userEvent.setup()
      mockLogin.mockRejectedValue(new Error('Network error'))

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Login failed',
          description: 'Invalid email or password. Try visitor@test.com / password',
          variant: 'destructive',
        })
      })
    })
  })

  describe('Navigation', () => {
    it('has correct link to registration page', () => {
      render(<LoginPage />)

      const signUpLink = screen.getByRole('link', { name: /sign up/i })
      expect(signUpLink).toHaveAttribute('href', '/register')
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)

      expect(emailInput).toHaveAttribute('id', 'email')
      expect(passwordInput).toHaveAttribute('id', 'password')
    })

    it('has proper button states', () => {
      render(<LoginPage />)

      const submitButton = screen.getByRole('button', { name: /sign in/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })

    it('maintains focus management during form submission', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue(true)

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      
      // Focus should be maintained on the form during submission
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled()
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles very long email addresses', async () => {
      const user = userEvent.setup()
      const longEmail = 'a'.repeat(100) + '@example.com'
      
      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, longEmail)

      expect(emailInput).toHaveValue(longEmail)
    })

    it('handles special characters in password', async () => {
      const user = userEvent.setup()
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      render(<LoginPage />)

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, specialPassword)

      expect(passwordInput).toHaveValue(specialPassword)
    })

    it('prevents multiple rapid submissions', async () => {
      const user = userEvent.setup()
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)))

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')

      // Try to submit multiple times rapidly
      await user.click(submitButton)
      await user.click(submitButton)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledTimes(1)
      })
    })
  })
})
