import { useState, useEffect } from 'react'
import { crowdDataApi, CrowdData, CrowdDataRequest, ApiError } from '@/lib/api'

interface UseCrowdDataReturn {
  crowdData: CrowdData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCrowdDataByBranchReturn {
  crowdData: CrowdData[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseLatestCrowdDataReturn {
  crowdData: CrowdData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateCrowdDataReturn {
  createCrowdData: (data: CrowdDataRequest) => Promise<CrowdData | null>
  loading: boolean
  error: string | null
}

interface UseUpdateCrowdDataReturn {
  updateCrowdData: (id: string, data: Partial<CrowdDataRequest>) => Promise<CrowdData | null>
  loading: boolean
  error: string | null
}

interface UseDeleteCrowdDataReturn {
  deleteCrowdData: (id: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useCrowdData(): UseCrowdDataReturn {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCrowdData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await crowdDataApi.getAll()
      setCrowdData(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch crowd data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrowdData()
  }, [])

  return {
    crowdData,
    loading,
    error,
    refetch: fetchCrowdData,
  }
}

export function useCrowdDataByBranch(branchId: string): UseCrowdDataByBranchReturn {
  const [crowdData, setCrowdData] = useState<CrowdData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCrowdData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!branchId) {
        setCrowdData([])
        return
      }
      
      const data = await crowdDataApi.getByBranch(branchId)
      setCrowdData(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch crowd data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrowdData()
  }, [branchId])

  return {
    crowdData,
    loading,
    error,
    refetch: fetchCrowdData,
  }
}

export function useLatestCrowdData(branchId: string): UseLatestCrowdDataReturn {
  const [crowdData, setCrowdData] = useState<CrowdData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLatestCrowdData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!branchId) {
        setCrowdData(null)
        return
      }
      
      const data = await crowdDataApi.getLatestByBranch(branchId)
      setCrowdData(data)
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 404) {
        // No crowd data found for this branch
        setCrowdData(null)
      } else {
        setError(apiError.message || 'Failed to fetch latest crowd data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLatestCrowdData()
  }, [branchId])

  return {
    crowdData,
    loading,
    error,
    refetch: fetchLatestCrowdData,
  }
}

export function useCreateCrowdData(): UseCreateCrowdDataReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCrowdData = async (data: CrowdDataRequest): Promise<CrowdData | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await crowdDataApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create crowd data')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createCrowdData,
    loading,
    error,
  }
}

export function useUpdateCrowdData(): UseUpdateCrowdDataReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateCrowdData = async (id: string, data: Partial<CrowdDataRequest>): Promise<CrowdData | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await crowdDataApi.update(id, data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to update crowd data')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateCrowdData,
    loading,
    error,
  }
}

export function useDeleteCrowdData(): UseDeleteCrowdDataReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteCrowdData = async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await crowdDataApi.delete(id)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete crowd data')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteCrowdData,
    loading,
    error,
  }
}
