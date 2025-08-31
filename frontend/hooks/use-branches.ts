import { useState, useEffect } from 'react'
import { branchApi, Branch, ApiError } from '@/lib/api'

interface UseBranchesReturn {
  branches: Branch[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseBranchesByInstitutionReturn {
  branches: Branch[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateBranchReturn {
  createBranch: (data: {
    institutionId: string
    name: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }) => Promise<Branch | null>
  loading: boolean
  error: string | null
}

interface UseUpdateBranchReturn {
  updateBranch: (id: string, data: {
    institutionId?: string
    name?: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }) => Promise<Branch | null>
  loading: boolean
  error: string | null
}

interface UseDeleteBranchReturn {
  deleteBranch: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
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

export function useBranchesByInstitution(institutionId: string): UseBranchesByInstitutionReturn {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!institutionId) {
        setBranches([])
        return
      }
      
      const data = await branchApi.getByInstitutionId(institutionId)
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
  }, [institutionId])

  return {
    branches,
    loading,
    error,
    refetch: fetchBranches,
  }
}

export function useCreateBranch(): UseCreateBranchReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createBranch = async (data: {
    institutionId: string
    name: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }): Promise<Branch | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await branchApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create branch')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createBranch,
    loading,
    error,
  }
}

export function useUpdateBranch(): UseUpdateBranchReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateBranch = async (id: string, data: {
    institutionId?: string
    name?: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }): Promise<Branch | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await branchApi.update(id, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update branch')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateBranch,
    loading,
    error,
  }
}

export function useDeleteBranch(): UseDeleteBranchReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteBranch = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await branchApi.delete(id)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete branch')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteBranch,
    loading,
    error,
  }
}
