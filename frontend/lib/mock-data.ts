export interface Institution {
  id: string
  name: string
  type: string
  address: string
  latitude: number
  longitude: number
  currentCrowdLevel: "Low" | "Medium" | "High"
  currentCrowdCount: number
  serviceHours: string
  services: string[]
  averageWaitTime: number
}

export interface CrowdData {
  timestamp: string
  crowdCount: number
  crowdLevel: "Low" | "Medium" | "High"
}

export interface Alert {
  id: string
  institutionId: string
  institutionName: string
  threshold: "Low" | "Medium"
  isActive: boolean
  createdAt: string
}

export interface Favorite {
  id: string
  institutionId: string
  institutionName: string
  createdAt: string
}

export const mockInstitutions: Institution[] = [
  {
    id: "1",
    name: "Central Bank Downtown",
    type: "Bank",
    address: "123 Main St, Downtown",
    latitude: 40.7128,
    longitude: -74.006,
    currentCrowdLevel: "Medium",
    currentCrowdCount: 15,
    serviceHours: "9:00 AM - 5:00 PM",
    services: ["Banking", "ATM", "Loans"],
    averageWaitTime: 12,
  },
  {
    id: "2",
    name: "City Park Recreation Center",
    type: "Park",
    address: "456 Park Ave, Midtown",
    latitude: 40.7589,
    longitude: -73.9851,
    currentCrowdLevel: "Low",
    currentCrowdCount: 8,
    serviceHours: "6:00 AM - 10:00 PM",
    services: ["Recreation", "Sports", "Events"],
    averageWaitTime: 5,
  },
  {
    id: "3",
    name: "Passport Office North",
    type: "Government",
    address: "789 Government Blvd, North District",
    latitude: 40.7831,
    longitude: -73.9712,
    currentCrowdLevel: "High",
    currentCrowdCount: 32,
    serviceHours: "8:00 AM - 4:00 PM",
    services: ["Passport Services", "Document Processing"],
    averageWaitTime: 45,
  },
  {
    id: "4",
    name: "Community Bank West",
    type: "Bank",
    address: "321 West St, West Side",
    latitude: 40.7505,
    longitude: -74.0134,
    currentCrowdLevel: "Low",
    currentCrowdCount: 6,
    serviceHours: "9:00 AM - 6:00 PM",
    services: ["Banking", "ATM", "Investment"],
    averageWaitTime: 8,
  },
  {
    id: "5",
    name: "Metro DMV Center",
    type: "Government",
    address: "555 Metro Ave, Central",
    latitude: 40.7282,
    longitude: -73.9942,
    currentCrowdLevel: "Medium",
    currentCrowdCount: 18,
    serviceHours: "8:00 AM - 5:00 PM",
    services: ["License Renewal", "Vehicle Registration"],
    averageWaitTime: 25,
  },
]

export const mockCrowdHistory: Record<string, CrowdData[]> = {
  "1": [
    { timestamp: "09:00", crowdCount: 5, crowdLevel: "Low" },
    { timestamp: "10:00", crowdCount: 12, crowdLevel: "Medium" },
    { timestamp: "11:00", crowdCount: 18, crowdLevel: "Medium" },
    { timestamp: "12:00", crowdCount: 25, crowdLevel: "High" },
    { timestamp: "13:00", crowdCount: 22, crowdLevel: "High" },
    { timestamp: "14:00", crowdCount: 15, crowdLevel: "Medium" },
    { timestamp: "15:00", crowdCount: 20, crowdLevel: "High" },
    { timestamp: "16:00", crowdCount: 12, crowdLevel: "Medium" },
    { timestamp: "17:00", crowdCount: 8, crowdLevel: "Low" },
  ],
}

export const mockAlerts: Alert[] = [
  {
    id: "1",
    institutionId: "1",
    institutionName: "Central Bank Downtown",
    threshold: "Low",
    isActive: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    institutionId: "3",
    institutionName: "Passport Office North",
    threshold: "Medium",
    isActive: true,
    createdAt: "2024-01-14",
  },
]

export const mockFavorites: Favorite[] = [
  {
    id: "1",
    institutionId: "1",
    institutionName: "Central Bank Downtown",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    institutionId: "2",
    institutionName: "City Park Recreation Center",
    createdAt: "2024-01-12",
  },
  {
    id: "3",
    institutionId: "4",
    institutionName: "Community Bank West",
    createdAt: "2024-01-13",
  },
]
