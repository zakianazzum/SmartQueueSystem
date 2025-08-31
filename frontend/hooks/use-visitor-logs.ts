import { useState, useEffect } from 'react'
import { visitorLogApi, VisitorLog, VisitorLogRequest, ApiError } from '@/lib/api'

interface UseVisitorLogsReturn {
  visitorLogs: VisitorLog[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseVisitorLogsByBranchReturn {
  visitorLogs: VisitorLog[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateVisitorLogReturn {
  createVisitorLog: (data: VisitorLogRequest) => Promise<VisitorLog | null>
  loading: boolean
  error: string | null
}

interface UseUpdateVisitorLogReturn {
  updateVisitorLog: (id: string, data: Partial<VisitorLogRequest>) => Promise<VisitorLog | null>
  loading: boolean
  error: string | null
}

interface UseDeleteVisitorLogReturn {
  deleteVisitorLog: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useVisitorLogs(): UseVisitorLogsReturn {
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVisitorLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await visitorLogApi.getAll()
      setVisitorLogs(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch visitor logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitorLogs()
  }, [])

  return {
    visitorLogs,
    loading,
    error,
    refetch: fetchVisitorLogs,
  }
}

export function useVisitorLogsByBranch(branchId: string): UseVisitorLogsByBranchReturn {
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVisitorLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!branchId) {
        setVisitorLogs([])
        return
      }
      
      const data = await visitorLogApi.getByBranch(branchId)
      setVisitorLogs(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch visitor logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVisitorLogs()
  }, [branchId])

  return {
    visitorLogs,
    loading,
    error,
    refetch: fetchVisitorLogs,
  }
}

export function useCreateVisitorLog(): UseCreateVisitorLogReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createVisitorLog = async (data: VisitorLogRequest): Promise<VisitorLog | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await visitorLogApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create visitor log')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createVisitorLog,
    loading,
    error,
  }
}

export function useUpdateVisitorLog(): UseUpdateVisitorLogReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateVisitorLog = async (id: string, data: Partial<VisitorLogRequest>): Promise<VisitorLog | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await visitorLogApi.update(id, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update visitor log')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateVisitorLog,
    loading,
    error,
  }
}

export function useDeleteVisitorLog(): UseDeleteVisitorLogReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteVisitorLog = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await visitorLogApi.delete(id)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete visitor log')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteVisitorLog,
    loading,
    error,
  }
}
