import { useState, useEffect } from 'react'
import { favoriteApi, FavoriteInstitution, ApiError } from '@/lib/api'

interface UseFavoritesReturn {
  favorites: FavoriteInstitution[]
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseFavoriteReturn {
  favorite: FavoriteInstitution | null
  loading: boolean
  error: string | null
  refetch: () => void
}

interface UseCreateFavoriteReturn {
  createFavorite: (data: { visitorId: string; branchId: string }) => Promise<FavoriteInstitution | null>
  loading: boolean
  error: string | null
}

interface UseDeleteFavoriteReturn {
  deleteFavorite: (visitorId: string, branchId: string) => Promise<boolean>
  loading: boolean
  error: string | null
}

export function useFavorites(visitorId?: string): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteInstitution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!visitorId) {
        setFavorites([])
        return
      }
      
      const data = await favoriteApi.getByVisitorId(visitorId)
      setFavorites(data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [visitorId])

  return {
    favorites,
    loading,
    error,
    refetch: fetchFavorites,
  }
}

export function useFavorite(id: string): UseFavoriteReturn {
  const [favorite, setFavorite] = useState<FavoriteInstitution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorite = async () => {
    try {
      setLoading(true)
      setError(null)
      // Note: Backend doesn't have a get by ID endpoint, so this is a placeholder
      // You might need to implement this in the backend if needed
      setError('Get by ID not implemented')
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to fetch favorite')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchFavorite()
    }
  }, [id])

  return {
    favorite,
    loading,
    error,
    refetch: fetchFavorite,
  }
}

export function useCreateFavorite(): UseCreateFavoriteReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createFavorite = async (data: { visitorId: string; branchId: string }): Promise<FavoriteInstitution | null> => {
    try {
      setLoading(true)
      setError(null)
      const result = await favoriteApi.create(data)
      return result
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to create favorite')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createFavorite,
    loading,
    error,
  }
}

export function useDeleteFavorite(): UseDeleteFavoriteReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const deleteFavorite = async (visitorId: string, branchId: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      await favoriteApi.delete(visitorId, branchId)
      return true
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || 'Failed to delete favorite')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteFavorite,
    loading,
    error,
  }
}
