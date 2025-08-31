import { renderHook, waitFor } from '@testing-library/react'
import { useInstitutions, useCreateInstitution, useUpdateInstitution, useDeleteInstitution } from '@/hooks/use-institutions'
import { institutionApi } from '@/lib/api'

// Mock the API
jest.mock('@/lib/api', () => ({
  institutionApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockInstitutionApi = institutionApi as jest.Mocked<typeof institutionApi>

describe('useInstitutions', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useInstitutions', () => {
    it('fetches institutions successfully', async () => {
      mockInstitutionApi.getAll.mockResolvedValue(mockInstitutions)

      const { result } = renderHook(() => useInstitutions())

      // Initial state should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.institutions).toEqual([])
      expect(result.current.error).toBe(null)

      // Wait for the data to be fetched
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toEqual(mockInstitutions)
      expect(result.current.error).toBe(null)
      expect(mockInstitutionApi.getAll).toHaveBeenCalledTimes(1)
    })

    it('handles fetch error', async () => {
      const errorMessage = 'Failed to fetch institutions'
      mockInstitutionApi.getAll.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })

    it('refetches data when refetch is called', async () => {
      mockInstitutionApi.getAll.mockResolvedValue(mockInstitutions)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Call refetch
      result.current.refetch()

      // Should call the API again
      expect(mockInstitutionApi.getAll).toHaveBeenCalledTimes(2)
    })

    it('handles empty response', async () => {
      mockInstitutionApi.getAll.mockResolvedValue([])

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toEqual([])
      expect(result.current.error).toBe(null)
    })
  })

  describe('useCreateInstitution', () => {
    it('creates institution successfully', async () => {
      const newInstitution = {
        institutionTypeId: '1',
        administratorId: '1',
        name: 'New Hospital',
        institutionDescription: 'A new hospital'
      }

      const createdInstitution = {
        institutionId: '3',
        ...newInstitution,
        institutionType: {
          institutionTypeId: '1',
          institutionType: 'Hospital'
        },
        branches: []
      }

      mockInstitutionApi.create.mockResolvedValue(createdInstitution)

      const { result } = renderHook(() => useCreateInstitution())

      const createResult = await result.current.createInstitution(newInstitution)

      expect(createResult).toEqual(createdInstitution)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockInstitutionApi.create).toHaveBeenCalledWith(newInstitution)
    })

    it('handles creation error', async () => {
      const newInstitution = {
        name: 'New Hospital',
        institutionDescription: 'A new hospital'
      }

      const errorMessage = 'Failed to create institution'
      mockInstitutionApi.create.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useCreateInstitution())

      const createResult = await result.current.createInstitution(newInstitution)

      expect(createResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during creation', async () => {
      const newInstitution = {
        name: 'New Hospital',
        institutionDescription: 'A new hospital'
      }

      // Mock a delayed response
      mockInstitutionApi.create.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockInstitutions[0]), 100))
      )

      const { result } = renderHook(() => useCreateInstitution())

      const createPromise = result.current.createInstitution(newInstitution)

      // Should be loading immediately after calling create
      expect(result.current.loading).toBe(true)

      await createPromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('useUpdateInstitution', () => {
    it('updates institution successfully', async () => {
      const updateData = {
        name: 'Updated Hospital',
        institutionDescription: 'Updated description'
      }

      const updatedInstitution = {
        institutionId: '1',
        ...updateData,
        institutionType: {
          institutionTypeId: '1',
          institutionType: 'Hospital'
        },
        branches: []
      }

      mockInstitutionApi.update.mockResolvedValue(updatedInstitution)

      const { result } = renderHook(() => useUpdateInstitution())

      const updateResult = await result.current.updateInstitution('1', updateData)

      expect(updateResult).toEqual(updatedInstitution)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockInstitutionApi.update).toHaveBeenCalledWith('1', updateData)
    })

    it('handles update error', async () => {
      const updateData = {
        name: 'Updated Hospital'
      }

      const errorMessage = 'Failed to update institution'
      mockInstitutionApi.update.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useUpdateInstitution())

      const updateResult = await result.current.updateInstitution('1', updateData)

      expect(updateResult).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during update', async () => {
      const updateData = {
        name: 'Updated Hospital'
      }

      // Mock a delayed response
      mockInstitutionApi.update.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockInstitutions[0]), 100))
      )

      const { result } = renderHook(() => useUpdateInstitution())

      const updatePromise = result.current.updateInstitution('1', updateData)

      // Should be loading immediately after calling update
      expect(result.current.loading).toBe(true)

      await updatePromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('useDeleteInstitution', () => {
    it('deletes institution successfully', async () => {
      mockInstitutionApi.delete.mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteInstitution())

      const deleteResult = await result.current.deleteInstitution('1')

      expect(deleteResult).toBe(true)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
      expect(mockInstitutionApi.delete).toHaveBeenCalledWith('1')
    })

    it('handles deletion error', async () => {
      const errorMessage = 'Failed to delete institution'
      mockInstitutionApi.delete.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useDeleteInstitution())

      const deleteResult = await result.current.deleteInstitution('1')

      expect(deleteResult).toBe(false)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it('sets loading state during deletion', async () => {
      // Mock a delayed response
      mockInstitutionApi.delete.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      )

      const { result } = renderHook(() => useDeleteInstitution())

      const deletePromise = result.current.deleteInstitution('1')

      // Should be loading immediately after calling delete
      expect(result.current.loading).toBe(true)

      await deletePromise

      expect(result.current.loading).toBe(false)
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockInstitutionApi.getAll.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })

    it('handles API errors with custom messages', async () => {
      const apiError = new Error('API Error')
      apiError.message = 'Custom API error message'
      mockInstitutionApi.getAll.mockRejectedValue(apiError)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe('Custom API error message')
    })

    it('handles malformed API responses', async () => {
      // Mock API returning unexpected data
      mockInstitutionApi.getAll.mockResolvedValue(null as any)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toEqual([])
    })
  })

  describe('Edge Cases', () => {
    it('handles very large institution lists', async () => {
      const largeInstitutionList = Array.from({ length: 1000 }, (_, i) => ({
        institutionId: `institution-${i}`,
        name: `Institution ${i}`,
        institutionDescription: `Description for institution ${i}`,
        institutionType: {
          institutionTypeId: '1',
          institutionType: 'Hospital'
        },
        branches: []
      }))

      mockInstitutionApi.getAll.mockResolvedValue(largeInstitutionList)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toHaveLength(1000)
      expect(result.current.institutions[0].name).toBe('Institution 0')
      expect(result.current.institutions[999].name).toBe('Institution 999')
    })

    it('handles institutions with missing optional fields', async () => {
      const institutionsWithMissingFields = [
        {
          institutionId: '1',
          name: 'Minimal Institution',
          institutionDescription: null,
          institutionType: null,
          branches: []
        }
      ]

      mockInstitutionApi.getAll.mockResolvedValue(institutionsWithMissingFields)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.institutions).toEqual(institutionsWithMissingFields)
      expect(result.current.institutions[0].institutionDescription).toBe(null)
      expect(result.current.institutions[0].institutionType).toBe(null)
    })

    it('handles rapid successive calls', async () => {
      mockInstitutionApi.getAll.mockResolvedValue(mockInstitutions)

      const { result } = renderHook(() => useInstitutions())

      // Call refetch multiple times rapidly
      result.current.refetch()
      result.current.refetch()
      result.current.refetch()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Should have called the API multiple times
      expect(mockInstitutionApi.getAll).toHaveBeenCalledTimes(4) // Initial + 3 refetch calls
    })
  })

  describe('Data Integrity', () => {
    it('preserves institution data structure', async () => {
      mockInstitutionApi.getAll.mockResolvedValue(mockInstitutions)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const institution = result.current.institutions[0]
      expect(institution).toHaveProperty('institutionId')
      expect(institution).toHaveProperty('name')
      expect(institution).toHaveProperty('institutionDescription')
      expect(institution).toHaveProperty('institutionType')
      expect(institution).toHaveProperty('branches')
      expect(Array.isArray(institution.branches)).toBe(true)
    })

    it('handles institutions with complex nested data', async () => {
      const complexInstitution = [
        {
          institutionId: '1',
          name: 'Complex Hospital',
          institutionDescription: 'A complex hospital',
          institutionType: {
            institutionTypeId: '1',
            institutionType: 'Hospital'
          },
          branches: [
            {
              branchId: '1',
              name: 'Main Branch',
              address: '123 Main St',
              capacity: 100,
              totalCrowdCount: 25
            }
          ]
        }
      ]

      mockInstitutionApi.getAll.mockResolvedValue(complexInstitution)

      const { result } = renderHook(() => useInstitutions())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const institution = result.current.institutions[0]
      expect(institution.branches).toHaveLength(1)
      expect(institution.branches[0].name).toBe('Main Branch')
      expect(institution.branches[0].capacity).toBe(100)
    })
  })
})
