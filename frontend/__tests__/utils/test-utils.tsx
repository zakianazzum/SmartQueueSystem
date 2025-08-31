import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AuthProvider } from '@/contexts/auth-context'
import { ThemeProvider } from '@/components/theme-provider'

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock the auth functions
jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signUp: jest.fn(),
  getUserById: jest.fn(),
}))

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authProviderProps?: {
    initialUser?: any
    initialLoading?: boolean
  }
}

const AllTheProviders = ({ 
  children, 
  authProviderProps = {} 
}: { 
  children: React.ReactNode
  authProviderProps?: any
}) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider {...authProviderProps}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { authProviderProps, ...renderOptions } = options
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authProviderProps={authProviderProps}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }
