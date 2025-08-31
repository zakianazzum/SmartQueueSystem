import { useState, useEffect } from 'react'
import { alertPreferenceApi, AlertPreference, AlertPreferenceRequest, ApiError } from '@/lib/api'

interface UseAlertPreferencesReturn {
  alertPreferences: AlertPreference[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseAlertPreferenceReturn {
  alertPreference: AlertPreference | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateAlertPreferenceReturn {
  createAlertPreference: (data: AlertPreferenceRequest) => Promise<AlertPreference | null>
  loading: boolean
  error: string | null
}

interface UseUpdateAlertPreferenceReturn {
  updateAlertPreference: (id: string, data: Partial<AlertPreferenceRequest>) => Promise<AlertPreference | null>
  loading: boolean
  error: string | null
}

interface UseDeleteAlertPreferenceReturn {
  deleteAlertPreference: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useAlertPreferences(visitorId?: string): UseAlertPreferencesReturn {
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlertPreferences = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!visitorId) {
        setAlertPreferences([])
        return
      }
      
      const data = await alertPreferenceApi.getByVisitorId(visitorId)
      setAlertPreferences(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch alert preferences')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlertPreferences()
  }, [visitorId])

  return {
    alertPreferences,
    loading,
    error,
    refetch: fetchAlertPreferences,
  }
}

export function useAlertPreference(id: string): UseAlertPreferenceReturn {
  const [alertPreference, setAlertPreference] = useState<AlertPreference | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAlertPreference = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await alertPreferenceApi.getById(id)
      setAlertPreference(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch alert preference')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchAlertPreference()
    }
  }, [id])

  return {
    alertPreference,
    loading,
    error,
    refetch: fetchAlertPreference,
  }
}

export function useCreateAlertPreference(): UseCreateAlertPreferenceReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createAlertPreference = async (data: AlertPreferenceRequest): Promise<AlertPreference | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await alertPreferenceApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create alert preference')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createAlertPreference,
    loading,
    error,
  }
}

export function useUpdateAlertPreference(): UseUpdateAlertPreferenceReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateAlertPreference = async (id: string, data: Partial<AlertPreferenceRequest>): Promise<AlertPreference | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await alertPreferenceApi.update(id, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update alert preference')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateAlertPreference,
    loading,
    error,
  }
}

export function useDeleteAlertPreference(): UseDeleteAlertPreferenceReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteAlertPreference = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await alertPreferenceApi.delete(id)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete alert preference')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteAlertPreference,
    loading,
    error,
  }
}
