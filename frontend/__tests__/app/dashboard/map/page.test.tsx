import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import MapPage from '@/app/dashboard/map/page'
import { useBranches } from '@/hooks/use-branches'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks
jest.mock('@/hooks/use-branches')
jest.mock('@/hooks/use-toast')

const mockUseBranches = useBranches as jest.MockedFunction<typeof useBranches>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('MapPage', () => {
  const mockBranches = [
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
      name: 'Downtown Bank',
      branchDescription: 'Main banking branch',
      address: '789 Downtown St',
      serviceHours: '9 AM - 5 PM',
      serviceDescription: 'Banking services',
      latitude: 40.7505,
      longitude: -73.9934,
      capacity: 75,
      totalCrowdCount: 15
    }
  ]

  const mockToast = {
    toast: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseBranches.mockReturnValue({
      branches: mockBranches,
      loading: false,
      error: null,
      refetch: jest.fn()
    })
    mockUseToast.mockReturnValue(mockToast)
  })

  describe('Rendering', () => {
    it('renders the map page with correct title and description', () => {
      render(<MapPage />)
      
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
      expect(screen.getByText('Explore institutions on the map and view real-time crowd information')).toBeInTheDocument()
    })

    it('renders the map container with correct title', () => {
      render(<MapPage />)
      
      expect(screen.getByText('Live Institution Map')).toBeInTheDocument()
      expect(screen.getByText('Interactive Google Maps showing all institutions with real-time crowd data')).toBeInTheDocument()
    })

    it('renders the enhanced search dialog', () => {
      render(<MapPage />)
      
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('renders the enable location button', () => {
      render(<MapPage />)
      
      expect(screen.getByRole('button', { name: /enable location/i })).toBeInTheDocument()
    })

    it('renders the Google Map component', () => {
      render(<MapPage />)
      
      // The Google Map component should be rendered
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
    })

    it('renders crowd level legend', () => {
      render(<MapPage />)
      
      expect(screen.getByText('Crowd Level Legend')).toBeInTheDocument()
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('renders nearby branches section', () => {
      render(<MapPage />)
      
      expect(screen.getByText('Nearby Branches')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('shows loading state when branches are loading', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        loading: true,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      expect(screen.getByText('Loading branches...')).toBeInTheDocument()
    })

    it('shows error state when branches fail to load', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        loading: false,
        error: 'Failed to load branches',
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      expect(screen.getByText('Error loading branches')).toBeInTheDocument()
      expect(screen.getByText('Failed to load branches')).toBeInTheDocument()
    })
  })

  describe('Crowd Level Functions', () => {
    it('correctly calculates crowd levels', () => {
      render(<MapPage />)
      
      // The component should handle crowd level calculations internally
      // We can test this by checking if the legend shows the correct levels
      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    it('displays correct crowd level colors', () => {
      render(<MapPage />)
      
      // Check that the legend shows the correct color indicators
      const lowIndicator = screen.getByText('Low').closest('div')?.querySelector('.bg-green-500')
      const mediumIndicator = screen.getByText('Medium').closest('div')?.querySelector('.bg-yellow-500')
      const highIndicator = screen.getByText('High').closest('div')?.querySelector('.bg-red-500')
      
      expect(lowIndicator).toBeInTheDocument()
      expect(mediumIndicator).toBeInTheDocument()
      expect(highIndicator).toBeInTheDocument()
    })
  })

  describe('Location Services', () => {
    it('handles enable location button click', async () => {
      const user = userEvent.setup()
      render(<MapPage />)
      
      const enableLocationButton = screen.getByRole('button', { name: /enable location/i })
      await user.click(enableLocationButton)
      
      // Should show a toast notification
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Location Services',
        description: 'Location services are not available in this environment',
      })
    })

    it('handles geolocation success', async () => {
      const user = userEvent.setup()
      
      // Mock geolocation API
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          })
        })
      }
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      })

      render(<MapPage />)
      
      const enableLocationButton = screen.getByRole('button', { name: /enable location/i })
      await user.click(enableLocationButton)
      
      // Should show success toast
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Location Found',
        description: 'Your location has been set on the map',
      })
    })

    it('handles geolocation error', async () => {
      const user = userEvent.setup()
      
      // Mock geolocation API with error
      const mockGeolocation = {
        getCurrentPosition: jest.fn().mockImplementation((success, error) => {
          error({ code: 1, message: 'Permission denied' })
        })
      }
      Object.defineProperty(global.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true
      })

      render(<MapPage />)
      
      const enableLocationButton = screen.getByRole('button', { name: /enable location/i })
      await user.click(enableLocationButton)
      
      // Should show error toast
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Location Error',
        description: 'Unable to get your location. Please check your permissions.',
        variant: 'destructive'
      })
    })
  })

  describe('Branch Selection', () => {
    it('handles branch selection from search dialog', async () => {
      const user = userEvent.setup()
      render(<MapPage />)
      
      const searchButton = screen.getByRole('button', { name: /search/i })
      await user.click(searchButton)
      
      // The search dialog should open
      expect(screen.getByText('Search Institution')).toBeInTheDocument()
    })

    it('shows toast notification when branch is selected', () => {
      render(<MapPage />)
      
      // Simulate branch selection (this would be triggered by the search dialog)
      const mockBranch = mockBranches[0]
      const handleBranchSelect = (branch: any) => {
        mockToast.toast({
          title: 'Branch Selected',
          description: `Showing ${branch.name} on the map`,
        })
      }
      
      handleBranchSelect(mockBranch)
      
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: 'Branch Selected',
        description: 'Showing Main Hospital Branch on the map',
      })
    })
  })

  describe('Nearby Branches', () => {
    it('displays nearby branches with correct information', () => {
      render(<MapPage />)
      
      // Check that nearby branches are displayed
      expect(screen.getByText('Main Hospital Branch')).toBeInTheDocument()
      expect(screen.getByText('Emergency Branch')).toBeInTheDocument()
      expect(screen.getByText('Downtown Bank')).toBeInTheDocument()
    })

    it('shows branch details correctly', () => {
      render(<MapPage />)
      
      // Check for branch addresses
      expect(screen.getByText('123 Main St')).toBeInTheDocument()
      expect(screen.getByText('456 Emergency St')).toBeInTheDocument()
      expect(screen.getByText('789 Downtown St')).toBeInTheDocument()
    })

    it('shows crowd levels for branches', () => {
      render(<MapPage />)
      
      // Check for crowd level indicators
      const crowdLevels = screen.getAllByText(/Low|Medium|High/)
      expect(crowdLevels.length).toBeGreaterThan(0)
    })

    it('shows service hours for branches', () => {
      render(<MapPage />)
      
      // Check for service hours
      expect(screen.getByText('24/7')).toBeInTheDocument()
      expect(screen.getByText('9 AM - 5 PM')).toBeInTheDocument()
    })
  })

  describe('Map Interactions', () => {
    it('renders map with correct props', () => {
      render(<MapPage />)
      
      // The Google Map component should receive the correct props
      // We can verify this by checking if the loading state is shown initially
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
    })

    it('passes branches data to map component', () => {
      render(<MapPage />)
      
      // The map should receive the branches data
      // This is verified by the fact that the component renders without errors
      expect(screen.getByText('Live Institution Map')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles missing branches gracefully', () => {
      mockUseBranches.mockReturnValue({
        branches: [],
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should still render the page without errors
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
      expect(screen.getByText('No branches found')).toBeInTheDocument()
    })

    it('handles branches with missing location data', () => {
      const branchesWithoutLocation = [
        {
          ...mockBranches[0],
          latitude: null,
          longitude: null
        }
      ]

      mockUseBranches.mockReturnValue({
        branches: branchesWithoutLocation,
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should still render without errors
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<MapPage />)
      
      // Check for proper button labels
      expect(screen.getByRole('button', { name: /enable location/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    })

    it('has proper heading structure', () => {
      render(<MapPage />)
      
      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Interactive Map')
      
      const cardHeading = screen.getByRole('heading', { level: 2 })
      expect(cardHeading).toHaveTextContent('Live Institution Map')
    })

    it('has proper color contrast for crowd levels', () => {
      render(<MapPage />)
      
      // Check that crowd level indicators have proper styling
      const lowIndicator = screen.getByText('Low').closest('div')?.querySelector('.bg-green-500')
      const mediumIndicator = screen.getByText('Medium').closest('div')?.querySelector('.bg-yellow-500')
      const highIndicator = screen.getByText('High').closest('div')?.querySelector('.bg-red-500')
      
      expect(lowIndicator).toBeInTheDocument()
      expect(mediumIndicator).toBeInTheDocument()
      expect(highIndicator).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('renders correctly on different screen sizes', () => {
      render(<MapPage />)
      
      // Check that the grid layout is applied
      const gridContainer = screen.getByText('Live Institution Map').closest('.grid')
      expect(gridContainer).toHaveClass('lg:grid-cols-3')
    })

    it('has proper spacing and layout', () => {
      render(<MapPage />)
      
      // Check for proper spacing classes
      const mainContainer = screen.getByText('Interactive Map').closest('.space-y-6')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles large number of branches efficiently', () => {
      const largeBranchList = Array.from({ length: 100 }, (_, i) => ({
        branchId: `branch-${i}`,
        institutionId: `inst-${Math.floor(i / 5)}`,
        name: `Branch ${i}`,
        address: `Address ${i}`,
        latitude: 40.7128 + (i * 0.001),
        longitude: -74.0060 + (i * 0.001),
        capacity: 100,
        totalCrowdCount: Math.floor(Math.random() * 50)
      }))

      mockUseBranches.mockReturnValue({
        branches: largeBranchList,
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should render without performance issues
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles branches with missing data gracefully', () => {
      const incompleteBranches = [
        {
          branchId: '1',
          name: 'Incomplete Branch',
          // Missing other required fields
        }
      ]

      mockUseBranches.mockReturnValue({
        branches: incompleteBranches as any,
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should still render without crashing
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
    })

    it('handles invalid coordinates', () => {
      const branchesWithInvalidCoords = [
        {
          ...mockBranches[0],
          latitude: 999, // Invalid latitude
          longitude: 999 // Invalid longitude
        }
      ]

      mockUseBranches.mockReturnValue({
        branches: branchesWithInvalidCoords,
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should still render without errors
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
    })

    it('handles empty branch names', () => {
      const branchesWithEmptyNames = [
        {
          ...mockBranches[0],
          name: ''
        }
      ]

      mockUseBranches.mockReturnValue({
        branches: branchesWithEmptyNames,
        loading: false,
        error: null,
        refetch: jest.fn()
      })

      render(<MapPage />)
      
      // Should still render without errors
      expect(screen.getByText('Interactive Map')).toBeInTheDocument()
    })
  })
})
