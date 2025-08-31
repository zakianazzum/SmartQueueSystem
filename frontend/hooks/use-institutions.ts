import { useState, useEffect } from 'react'
import { institutionApi, Institution, ApiError } from '@/lib/api'

interface UseInstitutionsReturn {
  institutions: Institution[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
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
      console.error('Error fetching institutions:', err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch institutions')
      }
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

interface UseInstitutionReturn {
  institution: Institution | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useInstitution(id: string): UseInstitutionReturn {
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInstitution = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await institutionApi.getById(id)
      setInstitution(data)
    } catch (err) {
      console.error('Error fetching institution:', err)
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to fetch institution')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchInstitution()
    }
  }, [id])

  return {
    institution,
    loading,
    error,
    refetch: fetchInstitution,
  }
}
