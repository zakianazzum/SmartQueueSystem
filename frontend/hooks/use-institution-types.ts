import { useState, useEffect } from 'react'
import { institutionTypeApi, InstitutionType, ApiError } from '@/lib/api'

interface UseInstitutionTypesReturn {
  institutionTypes: InstitutionType[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInstitutionTypes(): UseInstitutionTypesReturn {
  const [institutionTypes, setInstitutionTypes] = useState<InstitutionType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitutionTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await institutionTypeApi.getAll()
      setInstitutionTypes(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch institution types')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutionTypes()
  }, [])

  return {
    institutionTypes,
    loading,
    error,
    refetch: fetchInstitutionTypes,
  }
}
