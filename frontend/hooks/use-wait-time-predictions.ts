import { useState, useEffect } from 'react'
import { waitTimePredictionApi, WaitTimePrediction, WaitTimePredictionRequest, ApiError } from '@/lib/api'

interface UseWaitTimePredictionsReturn {
  predictions: WaitTimePrediction[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseWaitTimePredictionReturn {
  prediction: WaitTimePrediction | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateWaitTimePredictionReturn {
  createPrediction: (data: WaitTimePredictionRequest) => Promise<WaitTimePrediction | null>
  loading: boolean
  error: string | null
}

export function useWaitTimePredictions(): UseWaitTimePredictionsReturn {
  const [predictions, setPredictions] = useState<WaitTimePrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await waitTimePredictionApi.getAll()
      setPredictions(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch predictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPredictions()
  }, [])

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  }
}

export function useWaitTimePrediction(id: string): UseWaitTimePredictionReturn {
  const [prediction, setPrediction] = useState<WaitTimePrediction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrediction = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await waitTimePredictionApi.getById(id)
      setPrediction(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch prediction')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPrediction()
    }
  }, [id])

  return {
    prediction,
    loading,
    error,
    refetch: fetchPrediction,
  }
}

export function useCreateWaitTimePrediction(): UseCreateWaitTimePredictionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPrediction = async (data: WaitTimePredictionRequest): Promise<WaitTimePrediction | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await waitTimePredictionApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create prediction')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createPrediction,
    loading,
    error,
  }
}

export function useWaitTimePredictionsByVisitor(visitorId: string): UseWaitTimePredictionsReturn {
  const [predictions, setPredictions] = useState<WaitTimePrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await waitTimePredictionApi.getByVisitor(visitorId)
      setPredictions(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch predictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visitorId) {
      fetchPredictions()
    }
  }, [visitorId])

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  }
}

export function useWaitTimePredictionsByBranch(branchId: string): UseWaitTimePredictionsReturn {
  const [predictions, setPredictions] = useState<WaitTimePrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await waitTimePredictionApi.getByBranch(branchId)
      setPredictions(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch predictions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (branchId) {
      fetchPredictions()
    }
  }, [branchId])

  return {
    predictions,
    loading,
    error,
    refetch: fetchPredictions,
  }
}
