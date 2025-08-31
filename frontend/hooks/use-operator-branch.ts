import { useState, useEffect } from 'react'
import { userApi, Operator, ApiError } from '@/lib/api'

interface UseOperatorBranchReturn {
  operatorBranch: Operator | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useOperatorBranch(userId?: string): UseOperatorBranchReturn {
  const [operatorBranch, setOperatorBranch] = useState<Operator | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOperatorBranch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!userId) {
        setOperatorBranch(null)
        return
      }
      
      const operators = await userApi.getOperatorAssignments(userId)
      
      // An operator can only be assigned to one branch, so we take the first one
      if (operators.length > 0) {
        setOperatorBranch(operators[0])
      } else {
        setOperatorBranch(null)
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch operator branch')
      setOperatorBranch(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperatorBranch()
  }, [userId])

  return {
    operatorBranch,
    loading,
    error,
    refetch: fetchOperatorBranch,
  }
}
