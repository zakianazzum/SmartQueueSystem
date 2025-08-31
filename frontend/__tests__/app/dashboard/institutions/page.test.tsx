import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import InstitutionsPage from '@/app/dashboard/institutions/page'
import { useInstitutions } from '@/hooks/use-institutions'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
jest.mock('@/hooks/use-institutions')
jest.mock('@/hooks/use-toast')

const mockUseInstitutions = useInstitutions as jest.MockedFunction<typeof useInstitutions>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('InstitutionsPage', () => {
  const mockInstitutions = [
    {
      institutionId: '1',
      name: 'City General Hospital',
      institutionDescription: 'A general hospital serving the city',
      institutionType: {
        institutionTypeId: '1',
        institutionType: 'Hospital'
      },
      branches: [
        {
          branchId: '1',
          name: 'Main Branch',
          address: '123 Main St',
          totalCrowdCount: 25,
          capacity: 100
        }
      ]
    },
    {
      institutionId: '2',
      name: 'Downtown Bank',
      institutionDescription: 'Main banking branch',
      institutionType: {
        institutionTypeId: '2',
        institutionType: 'Bank'
      },
      branches: [
        {
          branchId: '2',
          name: 'Downtown Branch',
          address: '456 Bank St',
          totalCrowdCount: 45,
          capacity: 50
        }
      ]
    }
  ]

  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseInstitutions.mockReturnValue({
      institutions: mockInstitutions,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
    })
  })

  describe('UI Rendering', () => {
    it('renders institutions page with all required elements', () => {
      render(<InstitutionsPage />)

      // Check for main elements
      expect(screen.getByText('Institutions')).toBeInTheDocument()
      expect(screen.getByText(/View real-time crowd levels/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
      
      // Check for search and filter elements
      expect(screen.getByPlaceholderText(/search institutions/i)).toBeInTheDocument()
      expect(screen.getByText('Search & Filter')).toBeInTheDocument()
      
      // Check for institution cards
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })

    it('renders institution cards with correct information', () => {
      render(<InstitutionsPage />)

      // Check first institution
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('A general hospital serving the city')).toBeInTheDocument()
      expect(screen.getByText('Hospital')).toBeInTheDocument()
      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('123 Main St')).toBeInTheDocument()

      // Check second institution
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
      expect(screen.getByText('Main banking branch')).toBeInTheDocument()
      expect(screen.getByText('Bank')).toBeInTheDocument()
      expect(screen.getByText('Downtown Branch')).toBeInTheDocument()
      expect(screen.getByText('456 Bank St')).toBeInTheDocument()
    })

    it('shows loading state when data is loading', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: true,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('shows error state when there is an error', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: false,
        error: 'Failed to fetch institutions',
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch institutions/i)).toBeInTheDocument()
    })

    it('shows empty state when no institutions are available', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText(/no institutions found/i)).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters institutions by search term', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.type(searchInput, 'hospital')

      // Should show only hospital
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
    })

    it('filters institutions by description', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.type(searchInput, 'banking')

      // Should show only bank
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
      expect(screen.queryByText('City General Hospital')).not.toBeInTheDocument()
    })

    it('filters institutions by branch address', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.type(searchInput, 'main st')

      // Should show only hospital (has Main St address)
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
    })

    it('clears search results when search term is cleared', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.type(searchInput, 'hospital')
      
      // Clear search
      await user.clear(searchInput)

      // Should show all institutions again
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })
  })

  describe('Filter Functionality', () => {
    it('filters institutions by type', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const filterSelect = screen.getByRole('combobox')
      await user.click(filterSelect)
      
      // Select Hospital type
      const hospitalOption = screen.getByText('Hospital')
      await user.click(hospitalOption)

      // Should show only hospital
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
    })

    it('shows all institutions when "All Types" is selected', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const filterSelect = screen.getByRole('combobox')
      await user.click(filterSelect)
      
      // Select All Types
      const allTypesOption = screen.getByText('All Types')
      await user.click(allTypesOption)

      // Should show all institutions
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })
  })

  describe('Crowd Level Display', () => {
    it('displays correct crowd level badges', () => {
      render(<InstitutionsPage />)

      // Hospital has 25/100 = 25% (Low)
      expect(screen.getByText('Low')).toBeInTheDocument()
      
      // Bank has 45/50 = 90% (High)
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('displays crowd count information', () => {
      render(<InstitutionsPage />)

      // Check crowd count displays
      expect(screen.getByText(/25\/100/)).toBeInTheDocument()
      expect(screen.getByText(/45\/50/)).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('shows action buttons for each institution', () => {
      render(<InstitutionsPage />)

      // Check for action buttons
      expect(screen.getAllByRole('button', { name: /view details/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /add to favorites/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /set alert/i })).toHaveLength(2)
    })

    it('opens institution details modal when view details is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i })
      await user.click(viewDetailsButtons[0])

      // Should open modal
      expect(screen.getByText(/institution details/i)).toBeInTheDocument()
    })

    it('opens add to favorites modal when add to favorites is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const addToFavoritesButtons = screen.getAllByRole('button', { name: /add to favorites/i })
      await user.click(addToFavoritesButtons[0])

      // Should open modal
      expect(screen.getByText(/add to favorites/i)).toBeInTheDocument()
    })

    it('opens set alert modal when set alert is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const setAlertButtons = screen.getAllByRole('button', { name: /set alert/i })
      await user.click(setAlertButtons[0])

      // Should open modal
      expect(screen.getByText(/set alert/i)).toBeInTheDocument()
    })
  })

  describe('Refresh Functionality', () => {
    it('calls refetch when refresh button is clicked', async () => {
      const mockRefetch = jest.fn()
      mockUseInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        loading: false,
        error: null,
        refetch: mockRefetch,
      })

      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })

    it('shows success toast when refresh is successful', async () => {
      const mockRefetch = jest.fn()
      mockUseInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        loading: false,
        error: null,
        refetch: mockRefetch,
      })

      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Data Refreshed',
        description: 'Institution data has been updated.',
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('has proper button states and roles', () => {
      render(<InstitutionsPage />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      expect(refreshButton).toBeEnabled()

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i })
      viewDetailsButtons.forEach(button => {
        expect(button).toBeEnabled()
      })
    })

    it('maintains focus management during interactions', async () => {
      const user = userEvent.setup()
      render(<InstitutionsPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.click(searchInput)
      await user.type(searchInput, 'test')

      // Focus should be maintained on the search input
      expect(searchInput).toHaveFocus()
    })
  })

  describe('Edge Cases', () => {
    it('handles institutions with no branches', () => {
      const institutionsWithNoBranches = [
        {
          institutionId: '1',
          name: 'Empty Institution',
          institutionDescription: 'No branches',
          institutionType: {
            institutionTypeId: '1',
            institutionType: 'Hospital'
          },
          branches: []
        }
      ]

      mockUseInstitutions.mockReturnValue({
        institutions: institutionsWithNoBranches,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText('Empty Institution')).toBeInTheDocument()
      expect(screen.getByText('No branches available')).toBeInTheDocument()
    })

    it('handles institutions with missing optional fields', () => {
      const institutionsWithMissingFields = [
        {
          institutionId: '1',
          name: 'Minimal Institution',
          institutionDescription: null,
          institutionType: null,
          branches: []
        }
      ]

      mockUseInstitutions.mockReturnValue({
        institutions: institutionsWithMissingFields,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText('Minimal Institution')).toBeInTheDocument()
      expect(screen.getByText('No description available')).toBeInTheDocument()
    })

    it('handles very long institution names', () => {
      const longNameInstitution = [
        {
          institutionId: '1',
          name: 'This is a very long institution name that should be handled properly by the UI without breaking the layout or causing any visual issues',
          institutionDescription: 'Test',
          institutionType: {
            institutionTypeId: '1',
            institutionType: 'Hospital'
          },
          branches: []
        }
      ]

      mockUseInstitutions.mockReturnValue({
        institutions: longNameInstitution,
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsPage />)

      expect(screen.getByText(/this is a very long institution name/i)).toBeInTheDocument()
    })
  })
})
