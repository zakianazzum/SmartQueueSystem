import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { EnhancedSearchDialog } from '@/components/enhanced-search-dialog'
import { Institution, Branch } from '@/lib/api'

// Mock the hooks
jest.mock('@/hooks/use-institutions', () => ({
  useInstitutions: jest.fn()
}))

jest.mock('@/hooks/use-branches', () => ({
  useBranches: jest.fn()
}))

const mockUseInstitutions = require('@/hooks/use-institutions').useInstitutions
const mockUseBranches = require('@/hooks/use-branches').useBranches

describe('EnhancedSearchDialog', () => {
  const mockInstitutions: Institution[] = [
    {
      institutionId: '1',
      institutionTypeId: '1',
      administratorId: '1',
      name: 'City General Hospital',
      description: 'A comprehensive healthcare facility',
      address: '123 Main Street',
      contactNumber: '+1234567890',
      email: 'info@cityhospital.com',
      website: 'https://cityhospital.com',
      operatingHours: '24/7',
      services: 'Emergency, Surgery, Pediatrics',
      capacity: 500,
      totalCrowdCount: 150
    },
    {
      institutionId: '2',
      institutionTypeId: '2',
      administratorId: '2',
      name: 'Downtown Bank',
      description: 'Financial services and banking',
      address: '456 Financial District',
      contactNumber: '+1234567891',
      email: 'info@downtownbank.com',
      website: 'https://downtownbank.com',
      operatingHours: '9:00 AM - 5:00 PM',
      services: 'Banking, Loans, Investment',
      capacity: 200,
      totalCrowdCount: 75
    }
  ]

  const mockBranches: Branch[] = [
    {
      branchId: '1',
      institutionId: '1',
      name: 'Main Hospital Branch',
      branchDescription: 'Main hospital building',
      address: '123 Main St',
      serviceHours: '24/7',
      serviceDescription: 'Emergency and general care',
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 100,
      totalCrowdCount: 25
    },
    {
      branchId: '2',
      institutionId: '1',
      name: 'Emergency Branch',
      branchDescription: 'Emergency services building',
      address: '456 Emergency St',
      serviceHours: '24/7',
      serviceDescription: 'Emergency care only',
      latitude: 40.7589,
      longitude: -73.9851,
      capacity: 50,
      totalCrowdCount: 45
    },
    {
      branchId: '3',
      institutionId: '2',
      name: 'Downtown Bank Branch',
      branchDescription: 'Main banking branch',
      address: '789 Banking Ave',
      serviceHours: '9:00 AM - 5:00 PM',
      serviceDescription: 'All banking services',
      latitude: 40.7589,
      longitude: -73.9851,
      capacity: 75,
      totalCrowdCount: 30
    }
  ]

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSelect: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock implementations
    mockUseInstitutions.mockReturnValue({
      institutions: mockInstitutions,
      isLoading: false,
      error: null
    })

    mockUseBranches.mockReturnValue({
      branches: mockBranches,
      isLoading: false,
      error: null
    })
  })

  describe('Rendering', () => {
    it('renders dialog when open', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Search Institutions & Branches')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Search by name, address, or services...')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(<EnhancedSearchDialog {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Search Institutions & Branches')).not.toBeInTheDocument()
    })

    it('renders search input with correct placeholder', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute('type', 'text')
    })

    it('renders close button', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters institutions by name', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'Hospital' } })
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
        expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
      })
    })

    it('filters institutions by address', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'Main Street' } })
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
        expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
      })
    })

    it('filters institutions by services', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'Emergency' } })
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
        expect(screen.queryByText('Downtown Bank')).not.toBeInTheDocument()
      })
    })

    it('filters branches by name', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'Emergency Branch' } })
      
      await waitFor(() => {
        expect(screen.getByText('Emergency Branch')).toBeInTheDocument()
        expect(screen.getByText('City General Hospital')).toBeInTheDocument() // Parent institution
      })
    })

    it('shows no results for non-matching search', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'NonExistent' } })
      
      await waitFor(() => {
        expect(screen.getByText('No institutions or branches found.')).toBeInTheDocument()
      })
    })

    it('clears search when input is cleared', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      
      // First search
      fireEvent.change(searchInput, { target: { value: 'Hospital' } })
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      })
      
      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } })
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
        expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
      })
    })
  })

  describe('Institution Display', () => {
    it('displays institution information correctly', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      expect(screen.getByText('A comprehensive healthcare facility')).toBeInTheDocument()
      expect(screen.getByText('123 Main Street')).toBeInTheDocument()
      expect(screen.getByText('Emergency, Surgery, Pediatrics')).toBeInTheDocument()
    })

    it('displays crowd level information', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('150/500')).toBeInTheDocument() // Crowd count / capacity
    })

    it('displays operating hours', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('24/7')).toBeInTheDocument()
      expect(screen.getByText('9:00 AM - 5:00 PM')).toBeInTheDocument()
    })

    it('shows expandable branches for institutions', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButtons = screen.getAllByRole('button', { name: /expand/i })
      expect(expandButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Branch Display', () => {
    it('expands to show branches when clicked', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Main Hospital Branch')).toBeInTheDocument()
        expect(screen.getByText('Emergency Branch')).toBeInTheDocument()
      })
    })

    it('displays branch information correctly', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Main Hospital Branch')).toBeInTheDocument()
        expect(screen.getByText('Main hospital building')).toBeInTheDocument()
        expect(screen.getByText('123 Main St')).toBeInTheDocument()
        expect(screen.getByText('Emergency and general care')).toBeInTheDocument()
      })
    })

    it('displays branch crowd level', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('25/100')).toBeInTheDocument() // Branch crowd count / capacity
      })
    })

    it('collapses branches when clicked again', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      
      // Expand
      fireEvent.click(expandButton)
      await waitFor(() => {
        expect(screen.getByText('Main Hospital Branch')).toBeInTheDocument()
      })
      
      // Collapse
      fireEvent.click(expandButton)
      await waitFor(() => {
        expect(screen.queryByText('Main Hospital Branch')).not.toBeInTheDocument()
      })
    })
  })

  describe('Selection Functionality', () => {
    it('calls onSelect when institution is clicked', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const institutionButton = screen.getByRole('button', { name: /City General Hospital/i })
      fireEvent.click(institutionButton)
      
      expect(defaultProps.onSelect).toHaveBeenCalledWith({
        type: 'institution',
        data: mockInstitutions[0]
      })
    })

    it('calls onSelect when branch is clicked', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      // Expand branches first
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        const branchButton = screen.getByRole('button', { name: /Main Hospital Branch/i })
        fireEvent.click(branchButton)
      })
      
      expect(defaultProps.onSelect).toHaveBeenCalledWith({
        type: 'branch',
        data: mockBranches[0]
      })
    })

    it('calls onClose when close button is clicked', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })

    it('calls onClose when clicking outside dialog', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Loading States', () => {
    it('shows loading state for institutions', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        isLoading: true,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Loading institutions...')).toBeInTheDocument()
    })

    it('shows loading state for branches', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        isLoading: true,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Loading branches...')).toBeInTheDocument()
    })

    it('shows loading spinner', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        isLoading: true,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const loadingSpinner = screen.getByText('Loading institutions...')
      expect(loadingSpinner).toHaveClass('animate-spin')
    })
  })

  describe('Error States', () => {
    it('shows error message for institutions', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        isLoading: false,
        error: 'Failed to load institutions'
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Error loading institutions: Failed to load institutions')).toBeInTheDocument()
    })

    it('shows error message for branches', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        isLoading: false,
        error: 'Failed to load branches'
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Error loading branches: Failed to load branches')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('shows empty state when no institutions', () => {
      mockUseInstitutions.mockReturnValue({
        institutions: [],
        isLoading: false,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('No institutions found.')).toBeInTheDocument()
    })

    it('shows empty state when no branches', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        isLoading: false,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('No branches found.')).toBeInTheDocument()
    })
  })

  describe('Keyboard Navigation', () => {
    it('handles Enter key on search input', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' })
      
      // Should not trigger any action, just prevent default
      expect(defaultProps.onSelect).not.toHaveBeenCalled()
    })

    it('handles Escape key to close dialog', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' })
      
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByLabelText('Search institutions and branches')).toBeInTheDocument()
    })

    it('has proper button roles', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButtons = screen.getAllByRole('button', { name: /expand/i })
      expect(expandButtons.length).toBeGreaterThan(0)
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('supports keyboard navigation', () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      expect(searchInput).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('Performance', () => {
    it('handles large number of institutions efficiently', () => {
      const largeInstitutionList = Array.from({ length: 100 }, (_, i) => ({
        institutionId: `inst-${i}`,
        institutionTypeId: '1',
        administratorId: '1',
        name: `Institution ${i}`,
        description: `Description for institution ${i}`,
        address: `Address ${i}`,
        contactNumber: `+123456789${i}`,
        email: `info@institution${i}.com`,
        website: `https://institution${i}.com`,
        operatingHours: '24/7',
        services: 'Service A, Service B',
        capacity: 100,
        totalCrowdCount: Math.floor(Math.random() * 50)
      }))

      mockUseInstitutions.mockReturnValue({
        institutions: largeInstitutionList,
        isLoading: false,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      // Should render without performance issues
      expect(screen.getByText('Institution 0')).toBeInTheDocument()
      expect(screen.getByText('Institution 99')).toBeInTheDocument()
    })

    it('debounces search input', async () => {
      jest.useFakeTimers()
      
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      
      // Rapid typing
      fireEvent.change(searchInput, { target: { value: 'H' } })
      fireEvent.change(searchInput, { target: { value: 'Ho' } })
      fireEvent.change(searchInput, { target: { value: 'Hos' } })
      fireEvent.change(searchInput, { target: { value: 'Hosp' } })
      fireEvent.change(searchInput, { target: { value: 'Hospi' } })
      fireEvent.change(searchInput, { target: { value: 'Hospit' } })
      fireEvent.change(searchInput, { target: { value: 'Hospita' } })
      fireEvent.change(searchInput, { target: { value: 'Hospital' } })
      
      // Fast-forward timers
      jest.runAllTimers()
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      })
      
      jest.useRealTimers()
    })
  })

  describe('Edge Cases', () => {
    it('handles institutions with missing data', () => {
      const incompleteInstitution = {
        institutionId: '3',
        institutionTypeId: '1',
        administratorId: '1',
        name: 'Incomplete Institution',
        description: null,
        address: null,
        contactNumber: null,
        email: null,
        website: null,
        operatingHours: null,
        services: null,
        capacity: null,
        totalCrowdCount: null
      }

      mockUseInstitutions.mockReturnValue({
        institutions: [incompleteInstitution],
        isLoading: false,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      expect(screen.getByText('Incomplete Institution')).toBeInTheDocument()
      expect(screen.getByText('No description available')).toBeInTheDocument()
      expect(screen.getByText('No address available')).toBeInTheDocument()
    })

    it('handles branches with missing data', async () => {
      const incompleteBranch = {
        branchId: '4',
        institutionId: '1',
        name: 'Incomplete Branch',
        branchDescription: null,
        address: null,
        serviceHours: null,
        serviceDescription: null,
        latitude: null,
        longitude: null,
        capacity: null,
        totalCrowdCount: null
      }

      mockUseBranches.mockReturnValue({
        branches: [incompleteBranch],
        isLoading: false,
        error: null
      })

      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const expandButton = screen.getAllByRole('button', { name: /expand/i })[0]
      fireEvent.click(expandButton)
      
      await waitFor(() => {
        expect(screen.getByText('Incomplete Branch')).toBeInTheDocument()
        expect(screen.getByText('No description available')).toBeInTheDocument()
        expect(screen.getByText('No address available')).toBeInTheDocument()
      })
    })

    it('handles case-insensitive search', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'hospital' } }) // lowercase
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      })
    })

    it('handles special characters in search', async () => {
      render(<EnhancedSearchDialog {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('Search by name, address, or services...')
      fireEvent.change(searchInput, { target: { value: 'Main St.' } })
      
      await waitFor(() => {
        expect(screen.getByText('City General Hospital')).toBeInTheDocument()
      })
    })
  })
})
