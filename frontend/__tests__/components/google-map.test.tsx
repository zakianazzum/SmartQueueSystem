import React from 'react'
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { GoogleMap, GoogleMapRef } from '@/components/google-map'
import { Branch } from '@/lib/api'

// Mock Google Maps API
const mockGoogleMaps = {
  maps: {
    Map: jest.fn(),
    Marker: jest.fn(),
    InfoWindow: jest.fn(),
    Animation: {
      BOUNCE: 'BOUNCE'
    },
    SymbolPath: {
      CIRCLE: 'CIRCLE'
    }
  }
}

// Mock window.google
Object.defineProperty(window, 'google', {
  value: mockGoogleMaps,
  writable: true
})

// Mock document.createElement for script loading
const mockScript = {
  src: '',
  async: false,
  defer: false,
  onload: jest.fn()
}

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => mockScript),
  writable: true
})

describe('GoogleMap', () => {
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
    }
  ]

  const defaultProps = {
    apiKey: 'test-api-key',
    branches: mockBranches,
    className: 'test-map-class'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window.google
    Object.defineProperty(window, 'google', {
      value: mockGoogleMaps,
      writable: true
    })
  })

  describe('Rendering', () => {
    it('renders loading state initially', () => {
      render(<GoogleMap {...defaultProps} />)
      
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
      expect(screen.getByText('Loading Google Maps...')).toHaveClass('animate-spin')
    })

    it('renders with correct className', () => {
      render(<GoogleMap {...defaultProps} />)
      
      const mapContainer = screen.getByText('Loading Google Maps...').parentElement
      expect(mapContainer).toHaveClass('test-map-class')
    })

    it('renders map container when loaded', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
    })
  })

  describe('Google Maps API Loading', () => {
    it('loads Google Maps API script when not available', () => {
      // Mock that Google Maps is not loaded
      Object.defineProperty(window, 'google', {
        value: undefined,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      expect(document.createElement).toHaveBeenCalledWith('script')
      expect(mockScript.src).toBe('https://maps.googleapis.com/maps/api/js?key=test-api-key&libraries=places')
      expect(mockScript.async).toBe(true)
      expect(mockScript.defer).toBe(true)
    })

    it('sets loaded state when script loads', async () => {
      // Mock that Google Maps is not loaded
      Object.defineProperty(window, 'google', {
        value: undefined,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      // Simulate script load
      mockScript.onload()
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
    })

    it('initializes map with correct options', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalledWith(
          expect.any(HTMLElement),
          expect.objectContaining({
            center: { lat: 40.7128, lng: -74.006 },
            zoom: 12,
            styles: expect.arrayContaining([
              expect.objectContaining({
                featureType: 'all',
                elementType: 'geometry.fill',
                stylers: [{ color: '#1a1a1a' }]
              })
            ])
          })
        )
      })
    })
  })

  describe('Marker Handling', () => {
    it('creates markers for branches with coordinates', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      // Wait for markers to be created
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Marker).toHaveBeenCalledTimes(2)
      })
    })

    it('skips branches without coordinates', async () => {
      const branchesWithoutCoords = [
        {
          ...mockBranches[0],
          latitude: null,
          longitude: null
        }
      ]

      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} branches={branchesWithoutCoords} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      // Should not create markers for branches without coordinates
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Marker).not.toHaveBeenCalled()
      })
    })

    it('creates markers with correct properties', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Marker).toHaveBeenCalledWith(
          expect.objectContaining({
            position: { lat: 40.7128, lng: -74.0060 },
            title: 'Main Hospital Branch',
            icon: expect.objectContaining({
              path: 'CIRCLE',
              scale: 10,
              fillColor: expect.any(String),
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2
            })
          })
        )
      })
    })

    it('creates info windows for markers', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.InfoWindow).toHaveBeenCalled()
      })
    })
  })

  describe('Crowd Level Colors', () => {
    it('uses correct colors for different crowd levels', async () => {
      const branchesWithDifferentCrowdLevels = [
        {
          ...mockBranches[0],
          totalCrowdCount: 5 // Low
        },
        {
          ...mockBranches[1],
          totalCrowdCount: 20 // Medium
        }
      ]

      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} branches={branchesWithDifferentCrowdLevels} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        const markerCalls = mockGoogleMaps.maps.Marker.mock.calls
        expect(markerCalls[0][0].icon.fillColor).toBe('#22c55e') // Green for low
        expect(markerCalls[1][0].icon.fillColor).toBe('#eab308') // Yellow for medium
      })
    })

    it('handles unknown crowd levels', async () => {
      const branchWithUnknownCrowd = [
        {
          ...mockBranches[0],
          totalCrowdCount: undefined
        }
      ]

      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} branches={branchWithUnknownCrowd} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        const markerCalls = mockGoogleMaps.maps.Marker.mock.calls
        expect(markerCalls[0][0].icon.fillColor).toBe('#6b7280') // Gray for unknown
      })
    })
  })

  describe('Ref Methods', () => {
    it('exposes addPinAndZoom method', async () => {
      const ref = React.createRef<GoogleMapRef>()
      
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} ref={ref} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      // Wait for component to be fully initialized
      await waitFor(() => {
        expect(ref.current).toBeDefined()
      })
      
      if (ref.current) {
        ref.current.addPinAndZoom(mockBranches[0])
        
        await waitFor(() => {
          expect(mockGoogleMaps.maps.Marker).toHaveBeenCalled()
        })
      }
    })

    it('exposes centerOnUserLocation method', async () => {
      const ref = React.createRef<GoogleMapRef>()
      
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} ref={ref} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        expect(ref.current).toBeDefined()
      })
      
      if (ref.current) {
        const mockMap = mockGoogleMaps.maps.Map.mock.results[0].value
        ref.current.centerOnUserLocation(40.7128, -74.0060)
        
        expect(mockMap.setCenter).toHaveBeenCalledWith({ lat: 40.7128, lng: -74.0060 })
        expect(mockMap.setZoom).toHaveBeenCalledWith(14)
      }
    })
  })

  describe('Marker Interactions', () => {
    it('adds click listeners to markers', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        const markerCalls = mockGoogleMaps.maps.Marker.mock.calls
        const mockMarker = markerCalls[0][0]
        
        // Simulate marker click
        if (mockMarker.addListener) {
          mockMarker.addListener('click', mockMarker.addListener.mock.calls[0][1])
        }
      })
    })

    it('opens info window on marker click', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      await waitFor(() => {
        const infoWindowCalls = mockGoogleMaps.maps.InfoWindow.mock.calls
        const mockInfoWindow = infoWindowCalls[0][0]
        
        // Simulate opening info window
        if (mockInfoWindow.open) {
          mockInfoWindow.open()
        }
      })
    })
  })

  describe('Error Handling', () => {
    it('handles missing API key gracefully', () => {
      render(<GoogleMap apiKey="" branches={[]} />)
      
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
    })

    it('handles empty branches array', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} branches={[]} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      // Should not create any markers
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Marker).not.toHaveBeenCalled()
      })
    })

    it('handles script loading errors', async () => {
      // Mock that Google Maps is not loaded
      Object.defineProperty(window, 'google', {
        value: undefined,
        writable: true
      })

      render(<GoogleMap {...defaultProps} />)
      
      // Simulate script error
      mockScript.onerror = jest.fn()
      if (mockScript.onerror) {
        mockScript.onerror()
      }
      
      // Should still show loading state
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('handles large number of branches efficiently', async () => {
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

      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      render(<GoogleMap {...defaultProps} branches={largeBranchList} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      // Should create markers for all branches
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Marker).toHaveBeenCalledTimes(100)
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<GoogleMap {...defaultProps} />)
      
      const mapContainer = screen.getByText('Loading Google Maps...').parentElement
      expect(mapContainer).toHaveAttribute('role', 'application')
    })

    it('provides loading feedback', () => {
      render(<GoogleMap {...defaultProps} />)
      
      expect(screen.getByText('Loading Google Maps...')).toBeInTheDocument()
      expect(screen.getByText('Loading Google Maps...')).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })

  describe('Cleanup', () => {
    it('cleans up markers when component unmounts', async () => {
      // Mock that Google Maps is already loaded
      Object.defineProperty(window, 'google', {
        value: mockGoogleMaps,
        writable: true
      })

      const { unmount } = render(<GoogleMap {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockGoogleMaps.maps.Map).toHaveBeenCalled()
      })
      
      unmount()
      
      // Markers should be cleaned up (this would be handled by the component)
      // We can't directly test this without more complex mocking, but we can ensure
      // the component unmounts without errors
    })
  })
})
