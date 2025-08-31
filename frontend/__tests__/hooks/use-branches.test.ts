import { renderHook, waitFor } from '@testing-library/react'
import { useBranches, useBranchesByInstitution, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/use-branches'
import { branchApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  branchApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getByInstitutionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockBranchApi = branchApi as jest.Mocked<typeof branchApi>

describe('useBranches', () => {
  const mockBranches = [
    {
      branchId: '1',
      institutionId: '1',
      name: 'Main Branch',
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useBranches', () => {
    it('fetches all branches successfully', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranches())

      // Initial state should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(null)

      // Wait for the data to be fetched
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual(mockBranches)
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.getAll).toHaveBeenCalledTimes(1)
    })

    it('handles fetch error', async () => {
      const errorMessage = 'Failed to fetch branches'
      mockBranchApi.getAll.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })

    it('refetches data when refetch is called', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Call refetch
      result.current.refetch()

      // Should call the API again
      expect(mockBranchApi.getAll).toHaveBeenCalledTimes(2)
    })

    it('handles empty response', async () => {
      mockBranchApi.getAll.mockResolvedValue([])

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(null)
    })
  })

  describe('useBranchesByInstitution', () => {
    it('fetches branches by institution ID successfully', async () => {
      const institutionId = '1'
      mockBranchApi.getByInstitutionId.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranchesByInstitution(institutionId))

      // Initial state should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(null)

      // Wait for the data to be fetched
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual(mockBranches)
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.getByInstitutionId).toHaveBeenCalledWith(institutionId)
    })

    it('handles empty institution ID', async () => {
      const { result } = renderHook(() => useBranchesByInstitution(''))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.getByInstitutionId).not.toHaveBeenCalled()
    })

    it('refetches when institution ID changes', async () => {
      mockBranchApi.getByInstitutionId.mockResolvedValue(mockBranches)

      const { result, rerender } = renderHook(
        ({ institutionId }) => useBranchesByInstitution(institutionId),
        { initialProps: { institutionId: '1' } }
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change institution ID
      rerender({ institutionId: '2' })

      // Should fetch for new institution ID
      await waitFor(() => {
        expect(mockBranchApi.getByInstitutionId).toHaveBeenCalledWith('2')
      })
    })

    it('handles fetch error for specific institution', async () => {
      const institutionId = '1'
      const errorMessage = 'Failed to fetch branches for institution'
      mockBranchApi.getByInstitutionId.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useBranchesByInstitution(institutionId))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('useCreateBranch', () => {
    it('creates branch successfully', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        branchDescription: 'A new branch',
        address: '789 New St',
        serviceHours: '9 AM - 5 PM',
        capacity: 75
      }

      const createdBranch = {
        branchId: '3',
        ...newBranch,
        serviceDescription: null,
        latitude: null,
        longitude: null,
        totalCrowdCount: 0
      }

      mockBranchApi.create.mockResolvedValue(createdBranch)

      const { result } = renderHook(() => useCreateBranch())

      const createResult = await result.current.createBranch(newBranch)

      expect(createResult).toEqual(createdBranch)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.create).toHaveBeenCalledWith(newBranch)
    })

    it('handles creation error', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        address: '789 New St'
      }

      const errorMessage = 'Failed to create branch'
      mockBranchApi.create.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreateBranch())

      const createResult = await result.current.createBranch(newBranch)

      expect(createResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during creation', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        address: '789 New St'
      }

      // Mock a delayed response
      mockBranchApi.create.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBranches[0]), 100))
      )

      const { result } = renderHook(() => useCreateBranch())

      const createPromise = result.current.createBranch(newBranch)

      // Should be loading immediately after calling create
      expect(result.current.loading).toBe(true)

      await createPromise

      expect(result.current.loading).toBe(false)
    })

    it('handles missing required fields', async () => {
      const incompleteBranch = {
        name: 'Incomplete Branch'
        // Missing institutionId
      }

      const errorMessage = 'Institution ID is required'
      mockBranchApi.create.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreateBranch())

      const createResult = await result.current.createBranch(incompleteBranch as any)

      expect(createResult).toBe(null)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe('useUpdateBranch', () => {
    it('updates branch successfully', async () => {
      const updateData = {
        name: 'Updated Branch',
        address: 'Updated Address',
        capacity: 150
      }

      const updatedBranch = {
        ...mockBranches[0],
        ...updateData
      }

      mockBranchApi.update.mockResolvedValue(updatedBranch)

      const { result } = renderHook(() => useUpdateBranch())

      const updateResult = await result.current.updateBranch('1', updateData)

      expect(updateResult).toEqual(updatedBranch)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.update).toHaveBeenCalledWith('1', updateData)
    })

    it('handles update error', async () => {
      const updateData = {
        name: 'Updated Branch'
      }

      const errorMessage = 'Failed to update branch'
      mockBranchApi.update.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUpdateBranch())

      const updateResult = await result.current.updateBranch('1', updateData)

      expect(updateResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during update', async () => {
      const updateData = {
        name: 'Updated Branch'
      }

      // Mock a delayed response
      mockBranchApi.update.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockBranches[0]), 100))
      )

      const { result } = renderHook(() => useUpdateBranch())

      const updatePromise = result.current.updateBranch('1', updateData)

      // Should be loading immediately after calling update
      expect(result.current.loading).toBe(true)

      await updatePromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('useDeleteBranch', () => {
    it('deletes branch successfully', async () => {
      mockBranchApi.delete.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteBranch())

      const deleteResult = await result.current.deleteBranch('1')

      expect(deleteResult).toBe(true)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockBranchApi.delete).toHaveBeenCalledWith('1')
    })

    it('handles deletion error', async () => {
      const errorMessage = 'Failed to delete branch'
      mockBranchApi.delete.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDeleteBranch())

      const deleteResult = await result.current.deleteBranch('1')

      expect(deleteResult).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during deletion', async () => {
      // Mock a delayed response
      mockBranchApi.delete.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      )

      const { result } = renderHook(() => useDeleteBranch())

      const deletePromise = result.current.deleteBranch('1')

      // Should be loading immediately after calling delete
      expect(result.current.loading).toBe(true)

      await deletePromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockBranchApi.getAll.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })

    it('handles API errors with custom messages', async () => {
      const apiError = new Error('API Error')
      apiError.message = 'Custom API error message'
      mockBranchApi.getAll.mockRejectedValue(apiError)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Custom API error message')
    })

    it('handles malformed API responses', async () => {
      // Mock API returning unexpected data
      mockBranchApi.getAll.mockResolvedValue(null as any)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles very large branch lists', async () => {
      const largeBranchList = Array.from({ length: 1000 }, (_, i) => ({
        branchId: `branch-${i}`,
        institutionId: '1',
        name: `Branch ${i}`,
        address: `Address ${i}`,
        capacity: 100,
        totalCrowdCount: 25
      }))

      mockBranchApi.getAll.mockResolvedValue(largeBranchList)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toHaveLength(1000)
      expect(result.current.branches[0].name).toBe('Branch 0')
      expect(result.current.branches[999].name).toBe('Branch 999')
    })

    it('handles branches with missing optional fields', async () => {
      const branchesWithMissingFields = [
        {
          branchId: '1',
          institutionId: '1',
          name: 'Minimal Branch',
          branchDescription: null,
          address: null,
          serviceHours: null,
          serviceDescription: null,
          latitude: null,
          longitude: null,
          capacity: null,
          totalCrowdCount: 0
        }
      ]

      mockBranchApi.getAll.mockResolvedValue(branchesWithMissingFields)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual(branchesWithMissingFields)
      expect(result.current.branches[0].branchDescription).toBe(null)
      expect(result.current.branches[0].address).toBe(null)
    })

    it('handles rapid successive calls', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranches())

      // Call refetch multiple times rapidly
      result.current.refetch()
      result.current.refetch()
      result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have called the API multiple times
      expect(mockBranchApi.getAll).toHaveBeenCalledTimes(4) // Initial + 3 refetch calls
    })

    it('handles invalid institution IDs', async () => {
      const invalidInstitutionId = 'invalid-id'
      mockBranchApi.getByInstitutionId.mockRejectedValue(new Error('Institution not found'))

      const { result } = renderHook(() => useBranchesByInstitution(invalidInstitutionId))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe('Institution not found')
    })
  })

  describe('Data Integrity', () => {
    it('preserves branch data structure', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const branch = result.current.branches[0]
      expect(branch).toHaveProperty('branchId')
      expect(branch).toHaveProperty('institutionId')
      expect(branch).toHaveProperty('name')
      expect(branch).toHaveProperty('address')
      expect(branch).toHaveProperty('capacity')
      expect(branch).toHaveProperty('totalCrowdCount')
    })

    it('handles branches with complex location data', async () => {
      const branchWithLocation = [
        {
          branchId: '1',
          institutionId: '1',
          name: 'Location Branch',
          address: '123 Location St',
          latitude: 40.7128,
          longitude: -74.0060,
          capacity: 100,
          totalCrowdCount: 25
        }
      ]

      mockBranchApi.getAll.mockResolvedValue(branchWithLocation)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const branch = result.current.branches[0]
      expect(branch.latitude).toBe(40.7128)
      expect(branch.longitude).toBe(-74.0060)
    })

    it('handles branches with special characters in names', async () => {
      const branchWithSpecialChars = [
        {
          branchId: '1',
          institutionId: '1',
          name: 'Branch & Co. (Downtown)',
          address: '123 Main St, Suite #100',
          capacity: 100,
          totalCrowdCount: 25
        }
      ]

      mockBranchApi.getAll.mockResolvedValue(branchWithSpecialChars)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const branch = result.current.branches[0]
      expect(branch.name).toBe('Branch & Co. (Downtown)')
      expect(branch.address).toBe('123 Main St, Suite #100')
    })
  })

  describe('Performance', () => {
    it('handles concurrent operations efficiently', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)
      mockBranchApi.create.mockResolvedValue(mockBranches[0])
      mockBranchApi.update.mockResolvedValue(mockBranches[0])
      mockBranchApi.delete.mockResolvedValue(undefined)

      const { result: branchesResult } = renderHook(() => useBranches())
      const { result: createResult } = renderHook(() => useCreateBranch())
      const { result: updateResult } = renderHook(() => useUpdateBranch())
      const { result: deleteResult } = renderHook(() => useDeleteBranch())

      // Perform concurrent operations
      const promises = [
        branchesResult.current.refetch(),
        createResult.current.createBranch({ institutionId: '1', name: 'Test' }),
        updateResult.current.updateBranch('1', { name: 'Updated' }),
        deleteResult.current.deleteBranch('1')
      ]

      await Promise.all(promises)

      // All operations should complete successfully
      expect(mockBranchApi.getAll).toHaveBeenCalled()
      expect(mockBranchApi.create).toHaveBeenCalled()
      expect(mockBranchApi.update).toHaveBeenCalled()
      expect(mockBranchApi.delete).toHaveBeenCalled()
    })
  })
})
