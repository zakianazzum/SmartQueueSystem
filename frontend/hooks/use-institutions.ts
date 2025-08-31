import { useState, useEffect } from 'react'
import { institutionApi, Institution, ApiError } from '@/lib/api'

interface UseInstitutionsReturn {
  institutions: Institution[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateInstitutionReturn {
  createInstitution: (data: {
    institutionTypeId?: string
    administratorId?: string
    name: string
    institutionDescription?: string
  }) => Promise<Institution | null>
  loading: boolean
  error: string | null
}

interface UseUpdateInstitutionReturn {
  updateInstitution: (id: string, data: {
    institutionTypeId?: string
    administratorId?: string
    name?: string
    institutionDescription?: string
  }) => Promise<Institution | null>
  loading: boolean
  error: string | null
}

interface UseDeleteInstitutionReturn {
  deleteInstitution: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useInstitutions(): UseInstitutionsReturn {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitutions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await institutionApi.getAll()
      setInstitutions(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch institutions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [])

  return {
    institutions,
    loading,
    error,
    refetch: fetchInstitutions,
  }
}

export function useCreateInstitution(): UseCreateInstitutionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createInstitution = async (data: {
    institutionTypeId?: string
    administratorId?: string
    name: string
    institutionDescription?: string
  }): Promise<Institution | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await institutionApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create institution')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createInstitution,
    loading,
    error,
  }
}

export function useUpdateInstitution(): UseUpdateInstitutionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateInstitution = async (id: string, data: {
    institutionTypeId?: string
    administratorId?: string
    name?: string
    institutionDescription?: string
  }): Promise<Institution | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await institutionApi.update(id, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update institution')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateInstitution,
    loading,
    error,
  }
}

export function useDeleteInstitution(): UseDeleteInstitutionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteInstitution = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await institutionApi.delete(id)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete institution')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteInstitution,
    loading,
    error,
  }
}
