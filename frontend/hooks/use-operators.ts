import { useState, useEffect } from 'react'
import { operatorApi, Operator, ApiError } from '@/lib/api'

interface UseOperatorsReturn {
  operators: Operator[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateOperatorReturn {
  createOperator: (data: {
    userId: string
    branchId: string
  }) => Promise<Operator | null>
  loading: boolean
  error: string | null
}

interface UseUpdateOperatorReturn {
  updateOperator: (userId: string, branchId: string, data: {
    branchId?: string
  }) => Promise<Operator | null>
  loading: boolean
  error: string | null
}

interface UseDeleteOperatorReturn {
  deleteOperator: (userId: string, branchId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useOperators(): UseOperatorsReturn {
  const [operators, setOperators] = useState<Operator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOperators = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await operatorApi.getAll()
      setOperators(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch operators')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperators()
  }, [])

  return {
    operators,
    loading,
    error,
    refetch: fetchOperators,
  }
}

export function useCreateOperator(): UseCreateOperatorReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOperator = async (data: {
    userId: string
    branchId: string
  }): Promise<Operator | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operatorApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create operator')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createOperator,
    loading,
    error,
  }
}

export function useUpdateOperator(): UseUpdateOperatorReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateOperator = async (userId: string, branchId: string, data: {
    branchId?: string
  }): Promise<Operator | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await operatorApi.update(userId, branchId, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update operator')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateOperator,
    loading,
    error,
  }
}

export function useDeleteOperator(): UseDeleteOperatorReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteOperator = async (userId: string, branchId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await operatorApi.delete(userId, branchId)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete operator')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteOperator,
    loading,
    error,
  }
}
