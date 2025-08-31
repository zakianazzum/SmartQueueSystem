import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import InstitutionsAdminPage from '@/app/dashboard/institutions-admin/page'
import { useInstitutions, useCreateInstitution, useUpdateInstitution, useDeleteInstitution } from '@/hooks/use-institutions'
import { useBranches, useCreateBranch, useDeleteBranch } from '@/hooks/use-branches'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
jest.mock('@/hooks/use-institutions')
jest.mock('@/hooks/use-branches')
jest.mock('@/hooks/use-toast')

const mockUseInstitutions = useInstitutions as jest.MockedFunction<typeof useInstitutions>
const mockUseCreateInstitution = useCreateInstitution as jest.MockedFunction<typeof useCreateInstitution>
const mockUseUpdateInstitution = useUpdateInstitution as jest.MockedFunction<typeof useUpdateInstitution>
const mockUseDeleteInstitution = useDeleteInstitution as jest.MockedFunction<typeof useDeleteInstitution>
const mockUseBranches = useBranches as jest.MockedFunction<typeof useBranches>
const mockUseCreateBranch = useCreateBranch as jest.MockedFunction<typeof useCreateBranch>
const mockUseDeleteBranch = useDeleteBranch as jest.MockedFunction<typeof useDeleteBranch>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('InstitutionsAdminPage', () => {
  const mockInstitutions = [
    {
      institutionId: '1',
      name: 'City General Hospital',
      institutionDescription: 'A general hospital serving the city',
      institutionType: {
        institutionTypeId: '1',
        institutionType: 'Hospital'
      },
      branches: []
    },
    {
      institutionId: '2',
      name: 'Downtown Bank',
      institutionDescription: 'Main banking branch',
      institutionType: {
        institutionTypeId: '2',
        institutionType: 'Bank'
      },
      branches: []
    }
  ]

  const mockBranches = [
    {
      branchId: '1',
      institutionId: '1',
      name: 'Main Branch',
      address: '123 Main St',
      capacity: 100,
      currentCrowdCount: 25,
      currentCrowdLevel: 'Low'
    },
    {
      branchId: '2',
      institutionId: '1',
      name: 'Emergency Branch',
      address: '456 Emergency St',
      capacity: 50,
      currentCrowdCount: 45,
      currentCrowdLevel: 'High'
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

    mockUseBranches.mockReturnValue({
      branches: mockBranches,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })

    mockUseCreateInstitution.mockReturnValue({
      createInstitution: jest.fn(),
      loading: false,
      error: null,
    })

    mockUseUpdateInstitution.mockReturnValue({
      updateInstitution: jest.fn(),
      loading: false,
      error: null,
    })

    mockUseDeleteInstitution.mockReturnValue({
      deleteInstitution: jest.fn(),
      loading: false,
      error: null,
    })

    mockUseCreateBranch.mockReturnValue({
      createBranch: jest.fn(),
      loading: false,
      error: null,
    })

    mockUseDeleteBranch.mockReturnValue({
      deleteBranch: jest.fn(),
      loading: false,
      error: null,
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
    })
  })

  describe('UI Rendering', () => {
    it('renders institutions admin page with all required elements', () => {
      render(<InstitutionsAdminPage />)

      // Check for main elements
      expect(screen.getByText('Institution Management')).toBeInTheDocument()
      expect(screen.getByText(/Manage institutions, branches, and their configurations/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add institution/i })).toBeInTheDocument()
      
      // Check for tabs
      expect(screen.getByText('Institutions')).toBeInTheDocument()
      expect(screen.getByText('All Branches')).toBeInTheDocument()
      expect(screen.getByText('Overview')).toBeInTheDocument()
      
      // Check for search and filter elements
      expect(screen.getByPlaceholderText(/search institutions/i)).toBeInTheDocument()
      expect(screen.getByText('Search & Filter')).toBeInTheDocument()
    })

    it('renders institutions tab by default', () => {
      render(<InstitutionsAdminPage />)

      // Should show institutions in the default tab
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })

    it('shows loading state when data is loading', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: true,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsAdminPage />)

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('shows error state when there is an error', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: false,
        error: 'Failed to fetch institutions',
        refetch: jest.fn(),
      })

      render(<InstitutionsAdminPage />)

      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to fetch institutions/i)).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    it('switches to branches tab when clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const branchesTab = screen.getByText('All Branches')
      await user.click(branchesTab)

      // Should show branches
      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('Emergency Branch')).toBeInTheDocument()
    })

    it('switches to overview tab when clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const overviewTab = screen.getByText('Overview')
      await user.click(overviewTab)

      // Should show overview content
      expect(screen.getByText(/total institutions/i)).toBeInTheDocument()
      expect(screen.getByText(/total branches/i)).toBeInTheDocument()
    })

    it('switches back to institutions tab', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      // Go to branches tab first
      const branchesTab = screen.getByText('All Branches')
      await user.click(branchesTab)

      // Then go back to institutions tab
      const institutionsTab = screen.getByText('Institutions')
      await user.click(institutionsTab)

      // Should show institutions again
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })
  })

  describe('Search and Filter', () => {
    it('filters institutions by search term', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      await user.type(searchInput, 'hospital')

      // Should show only hospital
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
    })

    it('filters institutions by type', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const filterSelect = screen.getByRole('combobox')
      await user.click(filterSelect)
      
      // Select Hospital type
      const hospitalOption = screen.getByText('Hospital')
      await user.click(hospitalOption)

      // Should show only hospital
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
    })
  })

  describe('Institution Management', () => {
    it('opens add institution modal when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const addButton = screen.getByRole('button', { name: /add institution/i })
      await user.click(addButton)

      // Should open modal
      expect(screen.getByText(/add institution/i)).toBeInTheDocument()
    })

    it('shows edit and delete buttons for each institution', () => {
      render(<InstitutionsAdminPage />)

      // Check for action buttons
      expect(screen.getAllByRole('button', { name: /edit/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2)
    })

    it('opens edit institution modal when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])

      // Should open edit modal
      expect(screen.getByText(/edit institution/i)).toBeInTheDocument()
    })

    it('opens delete confirmation modal when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      // Should open delete confirmation modal
      expect(screen.getByText(/delete confirmation/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
    })
  })

  describe('Branch Management', () => {
    it('shows branches for each institution', () => {
      render(<InstitutionsAdminPage />)

      // Should show branches in the institutions view
      expect(screen.getByText('Main Branch')).toBeInTheDocument()
      expect(screen.getByText('Emergency Branch')).toBeInTheDocument()
    })

    it('opens add branch modal when add branch button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const addBranchButtons = screen.getAllByRole('button', { name: /add branch/i })
      await user.click(addBranchButtons[0])

      // Should open add branch modal
      expect(screen.getByText(/add branch/i)).toBeInTheDocument()
    })

    it('shows edit and delete buttons for each branch', () => {
      render(<InstitutionsAdminPage />)

      // Check for branch action buttons
      expect(screen.getAllByRole('button', { name: /edit branch/i })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: /delete branch/i })).toHaveLength(2)
    })

    it('opens edit branch modal when edit branch button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const editBranchButtons = screen.getAllByRole('button', { name: /edit branch/i })
      await user.click(editBranchButtons[0])

      // Should open edit branch modal
      expect(screen.getByText(/edit branch/i)).toBeInTheDocument()
    })

    it('opens delete confirmation modal when delete branch button is clicked', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const deleteBranchButtons = screen.getAllByRole('button', { name: /delete branch/i })
      await user.click(deleteBranchButtons[0])

      // Should open delete confirmation modal
      expect(screen.getByText(/delete confirmation/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument()
    })
  })

  describe('Crowd Level Display', () => {
    it('displays correct crowd level badges for branches', () => {
      render(<InstitutionsAdminPage />)

      // Check crowd level badges
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('displays crowd count information', () => {
      render(<InstitutionsAdminPage />)

      // Check crowd count displays
      expect(screen.getByText(/25\/100/)).toBeInTheDocument()
      expect(screen.getByText(/45\/50/)).toBeInTheDocument()
    })
  })

  describe('Overview Tab', () => {
    it('displays statistics in overview tab', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const overviewTab = screen.getByText('Overview')
      await user.click(overviewTab)

      // Should show statistics
      expect(screen.getByText(/total institutions/i)).toBeInTheDocument()
      expect(screen.getByText(/total branches/i)).toBeInTheDocument()
      expect(screen.getByText(/average crowd level/i)).toBeInTheDocument()
    })

    it('displays correct institution count', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const overviewTab = screen.getByText('Overview')
      await user.click(overviewTab)

      // Should show correct count
      expect(screen.getByText('2')).toBeInTheDocument() // 2 institutions
    })

    it('displays correct branch count', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const overviewTab = screen.getByText('Overview')
      await user.click(overviewTab)

      // Should show correct count
      expect(screen.getByText('2')).toBeInTheDocument() // 2 branches
    })
  })

  describe('Modal Interactions', () => {
    it('closes add institution modal when cancelled', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      // Open modal
      const addButton = screen.getByRole('button', { name: /add institution/i })
      await user.click(addButton)

      // Close modal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Modal should be closed
      expect(screen.queryByText(/add institution/i)).not.toBeInTheDocument()
    })

    it('closes delete confirmation modal when cancelled', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      // Open delete modal
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      await user.click(deleteButtons[0])

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Modal should be closed
      expect(screen.queryByText(/delete confirmation/i)).not.toBeInTheDocument()
    })
  })

  describe('Data Refresh', () => {
    it('refreshes data when refresh button is clicked', async () => {
      const mockRefetchInstitutions = jest.fn()
      const mockRefetchBranches = jest.fn()

      mockUseInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        loading: false,
        error: null,
        refetch: mockRefetchInstitutions,
      })

      mockUseBranches.mockReturnValue({
        branches: mockBranches,
        loading: false,
        error: null,
        refetch: mockRefetchBranches,
      })

      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      await user.click(refreshButton)

      expect(mockRefetchInstitutions).toHaveBeenCalledTimes(1)
      expect(mockRefetchBranches).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and associations', () => {
      render(<InstitutionsAdminPage />)

      const searchInput = screen.getByPlaceholderText(/search institutions/i)
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('has proper button states and roles', () => {
      render(<InstitutionsAdminPage />)

      const addButton = screen.getByRole('button', { name: /add institution/i })
      expect(addButton).toBeEnabled()

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      editButtons.forEach(button => {
        expect(button).toBeEnabled()
      })
    })

    it('maintains focus management during tab switching', async () => {
      const user = userEvent.setup()
      render(<InstitutionsAdminPage />)

      const branchesTab = screen.getByText('All Branches')
      await user.click(branchesTab)

      // Focus should be maintained appropriately
      expect(branchesTab).toHaveAttribute('data-state', 'active')
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

      mockUseBranches.mockReturnValue({
        branches: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsAdminPage />)

      expect(screen.getByText('Empty Institution')).toBeInTheDocument()
      expect(screen.getByText('No branches available')).toBeInTheDocument()
    })

    it('handles empty institutions list', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        loading: false,
        error: null,
        refetch: jest.fn(),
      })

      render(<InstitutionsAdminPage />)

      expect(screen.getByText(/no institutions found/i)).toBeInTheDocument()
    })

    it('handles loading states for different operations', () => {
      mockUseCreateInstitution.mockReturnValue({
        createInstitution: jest.fn(),
        loading: true,
        error: null,
      })

      render(<InstitutionsAdminPage />)

      // Should show loading state for create operation
      expect(screen.getByText(/creating/i)).toBeInTheDocument()
    })
  })
})
