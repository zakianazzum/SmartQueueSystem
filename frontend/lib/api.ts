const API_BASE_URL = "http://127.0.0.1:8000/api/v1"

// Types based on the OpenAPI schema
export interface User {
  id: number
  name: string
  email: string
  role: "visitor" | "operator" | "administrator"
  createdAt: string
  updatedAt: string
}

export interface UserCreate {
  name: string
  email: string
  role: "visitor" | "operator" | "administrator"
  password: string
}

export interface Institution {
  id: number
  name: string
  institutionTypeId: number
  administratorId: number
  institutionDescription?: string
  createdAt: string
  updatedAt: string
}

export interface InstitutionCreate {
  name: string
  institutionTypeId: number
  administratorId: number
  institutionDescription?: string
}

export interface Branch {
  id: number
  institutionId: number
  name: string
  branchDescription?: string
  address: string
  serviceHours: string
  latitude: number
  longitude: number
  capacity: number
  createdAt: string
  updatedAt: string
}

export interface BranchCreate {
  institutionId: number
  name: string
  branchDescription?: string
  address: string
  serviceHours: string
  latitude: number
  longitude: number
  capacity: number
}

export interface CrowdData {
  id: number
  branchId: number
  timestamp: string
  currentCrowdCount: number
  createdAt: string
  updatedAt: string
}

export interface CrowdDataCreate {
  branchId: number
  timestamp: string
  currentCrowdCount: number
}

export interface VisitorLog {
  id: number
  visitorName: string
  branchId: number
  checkInTime: string
  serviceStartTime?: string
  createdAt: string
  updatedAt: string
}

export interface VisitorLogCreate {
  visitorName: string
  branchId: number
  checkInTime: string
  serviceStartTime?: string
}

export interface AlertPreference {
  id: number
  visitorId: number
  branchId: number
  crowdThreshold: number
  createdAt: string
  updatedAt: string
}

export interface AlertPreferenceCreate {
  visitorId: number
  branchId: number
  crowdThreshold: number
}

export interface WaitTimePrediction {
  id: number
  visitorId: number
  branchId: number
  visitDate: string
  predictedWaitTime: number
  createdAt: string
  updatedAt: string
}

export interface WaitTimePredictionRequest {
  visitorId: number
  branchId: number
  visitDate: string
}

// API Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      throw new ApiError(response.status, `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// User Management APIs
export const userApi = {
  getAll: () => apiRequest<User[]>("/users"),
  create: (user: UserCreate) =>
    apiRequest<User>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    }),
  getById: (id: number) => apiRequest<User>(`/users/${id}`),
  update: (id: number, user: Partial<UserCreate>) =>
    apiRequest<User>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/users/${id}`, {
      method: "DELETE",
    }),
}

// Institution Management APIs
export const institutionApi = {
  getAll: () => apiRequest<Institution[]>("/institutions"),
  create: (institution: InstitutionCreate) =>
    apiRequest<Institution>("/institutions", {
      method: "POST",
      body: JSON.stringify(institution),
    }),
  getById: (id: number) => apiRequest<Institution>(`/institutions/${id}`),
  update: (id: number, institution: Partial<InstitutionCreate>) =>
    apiRequest<Institution>(`/institutions/${id}`, {
      method: "PUT",
      body: JSON.stringify(institution),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/institutions/${id}`, {
      method: "DELETE",
    }),
  getBranches: (id: number) => apiRequest<Branch[]>(`/institutions/${id}/branches`),
}

// Branch Management APIs
export const branchApi = {
  getAll: () => apiRequest<Branch[]>("/branches"),
  create: (branch: BranchCreate) =>
    apiRequest<Branch>("/branches", {
      method: "POST",
      body: JSON.stringify(branch),
    }),
  getById: (id: number) => apiRequest<Branch>(`/branches/${id}`),
  update: (id: number, branch: Partial<BranchCreate>) =>
    apiRequest<Branch>(`/branches/${id}`, {
      method: "PUT",
      body: JSON.stringify(branch),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/branches/${id}`, {
      method: "DELETE",
    }),
  getOperators: (id: number) => apiRequest<User[]>(`/branches/${id}/operators`),
}

// Crowd Data APIs
export const crowdDataApi = {
  create: (data: CrowdDataCreate) =>
    apiRequest<CrowdData>("/crowd-data", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: (page = 1, size = 50) =>
    apiRequest<{
      items: CrowdData[]
      total: number
      page: number
      size: number
    }>(`/crowd-data?page=${page}&size=${size}`),
  getByBranch: (branchId: number) => apiRequest<CrowdData[]>(`/crowd-data/branch/${branchId}`),
  getLatestByBranch: (branchId: number) => apiRequest<CrowdData>(`/crowd-data/branch/${branchId}/latest`),
  getByDateRange: (branchId: number, startDate: string, endDate: string) =>
    apiRequest<CrowdData[]>(`/crowd-data/branch/${branchId}/date-range?start_date=${startDate}&end_date=${endDate}`),
}

// Visitor Log APIs
export const visitorLogApi = {
  create: (log: VisitorLogCreate) =>
    apiRequest<VisitorLog>("/visitor-logs", {
      method: "POST",
      body: JSON.stringify(log),
    }),
  getAll: (page = 1, size = 50) =>
    apiRequest<{
      items: VisitorLog[]
      total: number
      page: number
      size: number
    }>(`/visitor-logs?page=${page}&size=${size}`),
  getByBranch: (branchId: number) => apiRequest<VisitorLog[]>(`/visitor-logs/branch/${branchId}`),
  getAverageWaitTime: (branchId: number) =>
    apiRequest<{ averageWaitTime: number }>(`/visitor-logs/branch/${branchId}/average-wait-time`),
}

// Alert Preference APIs
export const alertApi = {
  create: (alert: AlertPreferenceCreate) =>
    apiRequest<AlertPreference>("/alert-preferences", {
      method: "POST",
      body: JSON.stringify(alert),
    }),
  getByVisitor: (visitorId: number) => apiRequest<AlertPreference[]>(`/visitors/${visitorId}/alert-preferences`),
  update: (id: number, alert: Partial<AlertPreferenceCreate>) =>
    apiRequest<AlertPreference>(`/alert-preferences/${id}`, {
      method: "PUT",
      body: JSON.stringify(alert),
    }),
  delete: (id: number) =>
    apiRequest<void>(`/alert-preferences/${id}`, {
      method: "DELETE",
    }),
}

// Wait Time Prediction APIs
export const waitTimePredictionApi = {
  create: (request: WaitTimePredictionRequest) =>
    apiRequest<WaitTimePrediction>("/wait-time-predictions", {
      method: "POST",
      body: JSON.stringify(request),
    }),
  getAll: () => apiRequest<WaitTimePrediction[]>("/wait-time-predictions"),
  getByVisitor: (visitorId: number) => apiRequest<WaitTimePrediction[]>(`/wait-time-predictions/visitor/${visitorId}`),
  getByBranch: (branchId: number) => apiRequest<WaitTimePrediction[]>(`/wait-time-predictions/branch/${branchId}`),
}

// Operator Management APIs
export const operatorApi = {
  getAll: () => apiRequest<User[]>("/operators"),
  create: (data: { userId: number; branchId: number }) =>
    apiRequest<void>("/operators", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (userId: number, branchId: number, data: { userId: number; branchId: number }) =>
    apiRequest<void>(`/operators/${userId}/${branchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (userId: number, branchId: number) =>
    apiRequest<void>(`/operators/${userId}/${branchId}`, {
      method: "DELETE",
    }),
}

// Favorites APIs
export const favoritesApi = {
  getByVisitor: (visitorId: number) => apiRequest<Branch[]>(`/visitors/${visitorId}/favorites`),
  create: (data: { visitorId: number; branchId: number }) =>
    apiRequest<void>("/favorites", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (visitorId: number, branchId: number) =>
    apiRequest<void>(`/favorites/${visitorId}/${branchId}`, {
      method: "DELETE",
    }),
}
