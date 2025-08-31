import { useState, useEffect } from 'react'
import { branchApi, Branch, ApiError } from '@/lib/api'

interface UseBranchesReturn {
  branches: Branch[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseBranchReturn {
  branch: Branch | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useBranches(): UseBranchesReturn {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchApi.getAll()
      setBranches(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch branches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches,
  }
}

export function useBranch(id: string): UseBranchReturn {
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await branchApi.getById(id)
      setBranch(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch branch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchBranch()
    }
  }, [id])

  return {
    branch,
    loading,
    error,
    refetch: fetchBranch,
  }
}
