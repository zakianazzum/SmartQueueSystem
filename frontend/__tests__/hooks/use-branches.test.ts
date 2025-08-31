import { renderHook, act, waitFor } from '@testing-library/react'
import { useBranches, useBranchesByInstitution, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/use-branches'
import { Branch } from '@/lib/api'

// Mock the API functions
jest.mock('@/lib/api', () => ({
  branchApi: {
    getAll: jest.fn(),
    getByInstitutionId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockBranchApi = require('@/lib/api').branchApi

describe('useBranches', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useBranches', () => {
    it('fetches branches successfully', async () => {
      mockBranchApi.getAll.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual(mockBranches)
      expect(result.current.error).toBe(null)
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
      await act(async () => {
        result.current.refetch()
      })

      // Should call the API again
      expect(mockBranchApi.getAll).toHaveBeenCalledTimes(2)
    })
  })

  describe('useBranchesByInstitution', () => {
    it('fetches branches by institution ID successfully', async () => {
      const institutionId = '1'
      mockBranchApi.getByInstitutionId.mockResolvedValue(mockBranches)

      const { result } = renderHook(() => useBranchesByInstitution(institutionId))

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
  })

  describe('useCreateBranch', () => {
    it('creates branch successfully', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        branchDescription: 'New branch description',
        address: '789 New St',
        serviceHours: '9-5',
        serviceDescription: 'New services',
        latitude: 40.7589,
        longitude: -73.9851,
        capacity: 75
      }

      const createdBranch = {
        branchId: '3',
        ...newBranch,
        totalCrowdCount: 0
      }

      mockBranchApi.create.mockResolvedValue(createdBranch)

      const { result } = renderHook(() => useCreateBranch())

      const createResult = await act(async () => {
        return await result.current.createBranch(newBranch)
      })

      expect(createResult).toEqual(createdBranch)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles creation error', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        branchDescription: 'New branch description',
        address: '789 New St',
        serviceHours: '9-5',
        serviceDescription: 'New services',
        latitude: 40.7589,
        longitude: -73.9851,
        capacity: 75
      }

      const errorMessage = 'Failed to create branch'
      mockBranchApi.create.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreateBranch())

      const createResult = await act(async () => {
        return await result.current.createBranch(newBranch)
      })

      expect(createResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during creation', async () => {
      const newBranch = {
        institutionId: '1',
        name: 'New Branch',
        branchDescription: 'New branch description',
        address: '789 New St',
        serviceHours: '9-5',
        serviceDescription: 'New services',
        latitude: 40.7589,
        longitude: -73.9851,
        capacity: 75
      }

      mockBranchApi.create.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockBranches[0]), 100)))

      const { result } = renderHook(() => useCreateBranch())

      const createPromise = act(async () => {
        return await result.current.createBranch(newBranch)
      })

      // Should be loading immediately after calling create
      expect(result.current.loading).toBe(true)

      await createPromise
    })
  })

  describe('useUpdateBranch', () => {
    it('updates branch successfully', async () => {
      const updatedBranch = {
        ...mockBranches[0],
        name: 'Updated Branch Name',
        capacity: 150
      }

      mockBranchApi.update.mockResolvedValue(updatedBranch)

      const { result } = renderHook(() => useUpdateBranch())

      const updateResult = await act(async () => {
        return await result.current.updateBranch('1', {
          name: 'Updated Branch Name',
          capacity: 150
        })
      })

      expect(updateResult).toEqual(updatedBranch)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles update error', async () => {
      const errorMessage = 'Failed to update branch'
      mockBranchApi.update.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUpdateBranch())

      const updateResult = await act(async () => {
        return await result.current.updateBranch('1', { name: 'Updated Name' })
      })

      expect(updateResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during update', async () => {
      mockBranchApi.update.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockBranches[0]), 100)))

      const { result } = renderHook(() => useUpdateBranch())

      const updatePromise = act(async () => {
        return await result.current.updateBranch('1', { name: 'Updated Name' })
      })

      // Should be loading immediately after calling update
      expect(result.current.loading).toBe(true)

      await updatePromise
    })
  })

  describe('useDeleteBranch', () => {
    it('deletes branch successfully', async () => {
      mockBranchApi.delete.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteBranch())

      const deleteResult = await act(async () => {
        return await result.current.deleteBranch('1')
      })

      expect(deleteResult).toBe(true)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles deletion error', async () => {
      const errorMessage = 'Failed to delete branch'
      mockBranchApi.delete.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDeleteBranch())

      const deleteResult = await act(async () => {
        return await result.current.deleteBranch('1')
      })

      expect(deleteResult).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during deletion', async () => {
      mockBranchApi.delete.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(undefined), 100)))

      const { result } = renderHook(() => useDeleteBranch())

      const deletePromise = act(async () => {
        return await result.current.deleteBranch('1')
      })

      // Should be loading immediately after calling delete
      expect(result.current.loading).toBe(true)

      await deletePromise
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

    it('handles malformed API responses', async () => {
      mockBranchApi.getAll.mockResolvedValue(null)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles empty branches array', async () => {
      mockBranchApi.getAll.mockResolvedValue([])

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual([])
      expect(result.current.error).toBe(null)
    })

    it('handles branches with missing optional fields', async () => {
      const incompleteBranches = [
        {
          branchId: '1',
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
      ]

      mockBranchApi.getAll.mockResolvedValue(incompleteBranches)

      const { result } = renderHook(() => useBranches())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.branches).toEqual(incompleteBranches)
    })
  })
})
