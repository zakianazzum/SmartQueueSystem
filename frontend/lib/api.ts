// API service for Smart Queue System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Types for API responses
export interface InstitutionType {
  institutionTypeId: string
  institutionType: string
}

export interface Administrator {
  userId: string
  user: {
    userId: string
    name: string
    email: string
    role: string
    createdAt: string
    updatedAt: string
  }
}

export interface Branch {
  branchId: string
  institutionId: string
  name: string
  branchDescription?: string
  address?: string
  serviceHours?: string
  serviceDescription?: string
  latitude?: number
  longitude?: number
  capacity?: number
  totalCrowdCount?: number
}

export interface Institution {
  institutionId: string
  institutionTypeId?: string
  administratorId?: string
  name: string
  institutionDescription?: string
  institutionType?: InstitutionType
  administrator?: Administrator
  branches: Branch[]
}

export interface User {
  userId: string
  name: string
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Operator {
  userId: string
  branchId: string
  user: User
  branch?: {
    branchId: string
    name: string
    address?: string
    serviceHours?: string
  }
}

export interface Visitor {
  userId: string
  user: User
}

export interface FavoriteInstitution {
  favoriteInstitutionId: string
  visitorId: string
  branchId: string
  createdAt: string
  branch?: {
    branchId: string
    name: string
    address?: string
    serviceHours?: string
  }
}

export interface AlertPreference {
  alertId: string
  visitorId: string
  branchId: string
  crowdThreshold: number
  createdAt: string
  branch?: {
    branchId: string
    name: string
    address?: string
    serviceHours?: string
  }
}

export interface AlertPreferenceRequest {
  visitorId: string
  branchId: string
  crowdThreshold: number
}

// Generic API error handler
class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.detail || `HTTP ${response.status}`)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return {} as T
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error')
  }
}

// Institution APIs
export const institutionApi = {
  // Get all institutions
  getAll: (): Promise<Institution[]> => 
    apiRequest<Institution[]>('/institutions'),

  // Get institution by ID
  getById: (id: string): Promise<Institution> => 
    apiRequest<Institution>(`/institutions/${id}`),

  // Create institution
  create: (data: {
    institutionTypeId?: string
    administratorId?: string
    name: string
    institutionDescription?: string
  }): Promise<Institution> => 
    apiRequest<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update institution
  update: (id: string, data: {
    institutionTypeId?: string
    administratorId?: string
    name?: string
    institutionDescription?: string
  }): Promise<Institution> => 
    apiRequest<Institution>(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete institution
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/institutions/${id}`, {
      method: 'DELETE',
    }),
}

// Institution Type APIs
export const institutionTypeApi = {
  // Get all institution types
  getAll: (): Promise<InstitutionType[]> => 
    apiRequest<InstitutionType[]>('/institution-types'),

  // Get institution type by ID
  getById: (id: string): Promise<InstitutionType> => 
    apiRequest<InstitutionType>(`/institution-types/${id}`),

  // Create institution type
  create: (data: { institutionType: string }): Promise<InstitutionType> => 
    apiRequest<InstitutionType>('/institution-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update institution type
  update: (id: string, data: { institutionType: string }): Promise<InstitutionType> => 
    apiRequest<InstitutionType>(`/institution-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete institution type
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/institution-types/${id}`, {
      method: 'DELETE',
    }),
}

// Branch APIs
export const branchApi = {
  // Get all branches
  getAll: (): Promise<Branch[]> => 
    apiRequest<Branch[]>('/branches'),

  // Get branch by ID
  getById: (id: string): Promise<Branch> => 
    apiRequest<Branch>(`/branches/${id}`),

  // Get branches by institution ID
  getByInstitutionId: (institutionId: string): Promise<Branch[]> => 
    apiRequest<Branch[]>(`/institutions/${institutionId}/branches`),

  // Create branch
  create: (data: {
    institutionId: string
    name: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }): Promise<Branch> => 
    apiRequest<Branch>('/branches', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update branch
  update: (id: string, data: {
    institutionId?: string
    name?: string
    branchDescription?: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
    capacity?: number
  }): Promise<Branch> => 
    apiRequest<Branch>(`/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete branch
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/branches/${id}`, {
      method: 'DELETE',
    }),
}

// Operator interfaces
export interface Operator {
  userId: string
  branchId: string
  user: User
  branch?: {
    branchId: string
    name: string
    address?: string
    serviceHours?: string
    capacity?: number
  }
}

// User APIs
export const userApi = {
  // Get all users
  getAll: (): Promise<User[]> =>
    apiRequest<User[]>('/users'),

  // Get user by ID
  getById: (id: string): Promise<User> =>
    apiRequest<User>(`/users/${id}`),

  // Login user
  login: (data: {
    email: string
    password: string
  }): Promise<{
    user: User
    visitorId?: string
    message: string
  }> =>
    apiRequest<{
      user: User
      visitorId?: string
      message: string
    }>('/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Create user
  create: (data: {
    name: string
    email: string
    role: string
    password: string
  }): Promise<User> =>
    apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get operator assignments by user ID
  getOperatorAssignments: (userId: string): Promise<Operator[]> =>
    apiRequest<Operator[]>(`/users/${userId}/operator-assignments`),

  // Update user
  update: (id: string, data: {
    name?: string
    email?: string
    role?: string
    password?: string
  }): Promise<User> => 
    apiRequest<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete user
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    }),
}

// Operator APIs
export const operatorApi = {
  // Get all operators
  getAll: (): Promise<Operator[]> => 
    apiRequest<Operator[]>('/operators'),

  // Get operators by branch ID
  getByBranchId: (branchId: string): Promise<Operator[]> => 
    apiRequest<Operator[]>(`/branches/${branchId}/operators`),

  // Get operator assignments by user ID
  getByUserId: (userId: string): Promise<Operator[]> => 
    apiRequest<Operator[]>(`/users/${userId}/operator-assignments`),

  // Create operator assignment
  create: (data: {
    userId: string
    branchId: string
  }): Promise<Operator> => 
    apiRequest<Operator>('/operators', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update operator assignment
  update: (userId: string, branchId: string, data: {
    branchId?: string
  }): Promise<Operator> => 
    apiRequest<Operator>(`/operators/${userId}/${branchId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete operator assignment
  delete: (userId: string, branchId: string): Promise<void> => 
    apiRequest<void>(`/operators/${userId}/${branchId}`, {
      method: 'DELETE',
    }),
}

// Visitor APIs
export const visitorApi = {
  // Get all visitors
  getAll: (): Promise<Visitor[]> => 
    apiRequest<Visitor[]>('/visitors'),

  // Get visitor by user ID
  getById: (userId: string): Promise<Visitor> => 
    apiRequest<Visitor>(`/visitors/${userId}`),

  // Create visitor
  create: (data: { userId: string }): Promise<Visitor> => 
    apiRequest<Visitor>('/visitors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}

// Favorite APIs
export const favoriteApi = {
  // Get favorites by visitor ID
  getByVisitorId: (visitorId: string): Promise<FavoriteInstitution[]> => 
    apiRequest<FavoriteInstitution[]>(`/visitors/${visitorId}/favorites`),

  // Create favorite
  create: (data: {
    visitorId: string
    branchId: string
  }): Promise<FavoriteInstitution> => 
    apiRequest<FavoriteInstitution>('/favorites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delete favorite
  delete: (visitorId: string, branchId: string): Promise<void> => 
    apiRequest<void>(`/favorites/${visitorId}/${branchId}`, {
      method: 'DELETE',
    }),
}

// Alert Preference APIs
export const alertPreferenceApi = {
  // Get alert preferences by visitor ID
  getByVisitorId: (visitorId: string): Promise<AlertPreference[]> => 
    apiRequest<AlertPreference[]>(`/visitors/${visitorId}/alert-preferences`),

  // Create alert preference
  create: (data: {
    visitorId: string
    branchId: string
    crowdThreshold: number
  }): Promise<AlertPreference> => 
    apiRequest<AlertPreference>('/alert-preferences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update alert preference
  update: (alertId: string, data: {
    branchId?: string
    crowdThreshold?: number
  }): Promise<AlertPreference> => 
    apiRequest<AlertPreference>(`/alert-preferences/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete alert preference
  delete: (alertId: string): Promise<void> => 
    apiRequest<void>(`/alert-preferences/${alertId}`, {
      method: 'DELETE',
    }),
}

// Wait Time Prediction interfaces
export interface WaitTimePrediction {
  waitTimePredictionId: string
  visitorId: string
  branchId: string
  visitDate: string
  predictedWaitTime: number
  actualWaitTime: number
  accuracy: number
  predictedAt: string
}

export interface WaitTimePredictionRequest {
  visitorId: string
  branchId: string
  visitDate: string
}

// Wait Time Prediction APIs
export const waitTimePredictionApi = {
  // Get all wait time predictions
  getAll: (): Promise<WaitTimePrediction[]> => 
    apiRequest<WaitTimePrediction[]>('/wait-time-predictions'),

  // Get wait time prediction by ID
  getById: (id: string): Promise<WaitTimePrediction> => 
    apiRequest<WaitTimePrediction>(`/wait-time-predictions/${id}`),

  // Create wait time prediction
  create: (data: WaitTimePredictionRequest): Promise<WaitTimePrediction> => 
    apiRequest<WaitTimePrediction>('/wait-time-predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get predictions by visitor
  getByVisitor: (visitorId: string): Promise<WaitTimePrediction[]> => 
    apiRequest<WaitTimePrediction[]>(`/wait-time-predictions/visitor/${visitorId}`),

  // Get predictions by branch
  getByBranch: (branchId: string): Promise<WaitTimePrediction[]> => 
    apiRequest<WaitTimePrediction[]>(`/wait-time-predictions/branch/${branchId}`),

  // Update wait time prediction
  update: (id: string, data: {
    visitorId?: string
    branchId?: string
    visitDate?: string
    predictedWaitTime?: number
    actualWaitTime?: number
    accuracy?: number
  }): Promise<WaitTimePrediction> => 
    apiRequest<WaitTimePrediction>(`/wait-time-predictions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete wait time prediction
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/wait-time-predictions/${id}`, {
      method: 'DELETE',
    }),
}

// Crowd Data interfaces
export interface CrowdData {
  crowdDataId: string
  branchId: string
  timestamp: string
  currentCrowdCount: number
  branch?: {
    branchId: string
    name: string
    address?: string
    serviceHours?: string
    serviceDescription?: string
    latitude?: number
    longitude?: number
  }
}

export interface CrowdDataRequest {
  branchId: string
  timestamp: string
  currentCrowdCount: number
}

// Crowd Data APIs
export const crowdDataApi = {
  // Get all crowd data
  getAll: (): Promise<CrowdData[]> => 
    apiRequest<CrowdData[]>('/crowd-data'),

  // Get crowd data by ID
  getById: (id: string): Promise<CrowdData> => 
    apiRequest<CrowdData>(`/crowd-data/${id}`),

  // Create crowd data
  create: (data: CrowdDataRequest): Promise<CrowdData> => 
    apiRequest<CrowdData>('/crowd-data', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get crowd data by branch
  getByBranch: (branchId: string): Promise<CrowdData[]> => 
    apiRequest<CrowdData[]>(`/crowd-data/branch/${branchId}`),

  // Get latest crowd data by branch
  getLatestByBranch: (branchId: string): Promise<CrowdData> => 
    apiRequest<CrowdData>(`/crowd-data/branch/${branchId}/latest`),

  // Get crowd data by date range
  getByDateRange: (branchId: string, startDate: string, endDate: string): Promise<CrowdData[]> => 
    apiRequest<CrowdData[]>(`/crowd-data/branch/${branchId}/date-range?start_date=${startDate}&end_date=${endDate}`),

  // Update crowd data
  update: (id: string, data: Partial<CrowdDataRequest>): Promise<CrowdData> => 
    apiRequest<CrowdData>(`/crowd-data/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete crowd data
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/crowd-data/${id}`, {
      method: 'DELETE',
    }),
}

// Visitor Log interfaces
export interface VisitorLog {
  visitorLogId: string
  visitorName: string
  branchId: string
  checkInTime: string
  serviceStartTime: string
  waitTimeInMinutes: number
}

export interface VisitorLogRequest {
  visitorName: string
  branchId: string
  checkInTime: string
  serviceStartTime?: string
  waitTimeInMinutes?: number
}

// Visitor Log APIs
export const visitorLogApi = {
  // Get all visitor logs
  getAll: (): Promise<VisitorLog[]> => 
    apiRequest<VisitorLog[]>('/visitor-logs'),

  // Get visitor log by ID
  getById: (id: string): Promise<VisitorLog> => 
    apiRequest<VisitorLog>(`/visitor-logs/${id}`),

  // Create visitor log
  create: (data: VisitorLogRequest): Promise<VisitorLog> => 
    apiRequest<VisitorLog>('/visitor-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Get visitor logs by branch
  getByBranch: (branchId: string): Promise<VisitorLog[]> => 
    apiRequest<VisitorLog[]>(`/visitor-logs/branch/${branchId}`),

  // Get visitor logs by branch for last 30 days
  getByBranchLast30Days: (branchId: string): Promise<VisitorLog[]> => 
    apiRequest<VisitorLog[]>(`/visitor-logs/branch/${branchId}/last-30-days`),

  // Get average wait time by branch
  getAverageWaitTimeByBranch: (branchId: string): Promise<{ branchId: string; averageWaitTime: number }> => 
    apiRequest<{ branchId: string; averageWaitTime: number }>(`/visitor-logs/branch/${branchId}/average-wait-time`),

  // Update visitor log
  update: (id: string, data: Partial<VisitorLogRequest>): Promise<VisitorLog> => 
    apiRequest<VisitorLog>(`/visitor-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete visitor log
  delete: (id: string): Promise<void> => 
    apiRequest<void>(`/visitor-logs/${id}`, {
      method: 'DELETE',
    }),
}

export { ApiError }
