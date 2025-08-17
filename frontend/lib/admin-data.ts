export interface AdminInstitution {
  id: string
  name: string
  type: string
  description: string
  adminId: string
  createdAt: string
  branches: AdminBranch[]
}

export interface AdminBranch {
  id: string
  institutionId: string
  name: string
  address: string
  latitude: number
  longitude: number
  serviceHours: string
  services: string[]
  capacity: number
  operatorId?: string
  operatorName?: string
  isActive: boolean
  currentCrowdCount: number
  currentCrowdLevel: "Low" | "Medium" | "High"
}

export interface AdminOperator {
  id: string
  name: string
  email: string
  branchId?: string
  branchName?: string
  institutionName?: string
  isActive: boolean
  lastActive: string
  totalUpdates: number
  averageResponseTime: number
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement"
}

export interface SystemStats {
  totalInstitutions: number
  totalBranches: number
  totalOperators: number
  totalVisitors: number
  activeOperators: number
  systemUptime: string
  totalCrowdUpdates: number
  averageWaitTime: number
}

export const mockAdminInstitutions: AdminInstitution[] = [
  {
    id: "1",
    name: "Central Bank",
    type: "Bank",
    description: "Major banking institution with multiple branches",
    adminId: "3",
    createdAt: "2024-01-01",
    branches: [
      {
        id: "1",
        institutionId: "1",
        name: "Downtown Branch",
        address: "123 Main St, Downtown",
        latitude: 40.7128,
        longitude: -74.006,
        serviceHours: "9:00 AM - 5:00 PM",
        services: ["Banking", "ATM", "Loans"],
        capacity: 50,
        operatorId: "2",
        operatorName: "Jane Operator",
        isActive: true,
        currentCrowdCount: 15,
        currentCrowdLevel: "Medium",
      },
      {
        id: "4",
        institutionId: "1",
        name: "West Side Branch",
        address: "321 West St, West Side",
        latitude: 40.7505,
        longitude: -74.0134,
        serviceHours: "9:00 AM - 6:00 PM",
        services: ["Banking", "ATM", "Investment"],
        capacity: 40,
        operatorId: "4",
        operatorName: "Mike Wilson",
        isActive: true,
        currentCrowdCount: 6,
        currentCrowdLevel: "Low",
      },
    ],
  },
  {
    id: "2",
    name: "City Parks Department",
    type: "Government",
    description: "Municipal parks and recreation facilities",
    adminId: "3",
    createdAt: "2024-01-05",
    branches: [
      {
        id: "2",
        institutionId: "2",
        name: "Central Park Recreation Center",
        address: "456 Park Ave, Midtown",
        latitude: 40.7589,
        longitude: -73.9851,
        serviceHours: "6:00 AM - 10:00 PM",
        services: ["Recreation", "Sports", "Events"],
        capacity: 100,
        operatorId: "5",
        operatorName: "Sarah Johnson",
        isActive: true,
        currentCrowdCount: 8,
        currentCrowdLevel: "Low",
      },
    ],
  },
  {
    id: "3",
    name: "Government Services",
    type: "Government",
    description: "Various government service offices",
    adminId: "3",
    createdAt: "2024-01-10",
    branches: [
      {
        id: "3",
        institutionId: "3",
        name: "Passport Office North",
        address: "789 Government Blvd, North District",
        latitude: 40.7831,
        longitude: -73.9712,
        serviceHours: "8:00 AM - 4:00 PM",
        services: ["Passport Services", "Document Processing"],
        capacity: 60,
        isActive: true,
        currentCrowdCount: 32,
        currentCrowdLevel: "High",
      },
      {
        id: "5",
        institutionId: "3",
        name: "DMV Center",
        address: "555 Metro Ave, Central",
        latitude: 40.7282,
        longitude: -73.9942,
        serviceHours: "8:00 AM - 5:00 PM",
        services: ["License Renewal", "Vehicle Registration"],
        capacity: 80,
        operatorId: "6",
        operatorName: "David Brown",
        isActive: true,
        currentCrowdCount: 18,
        currentCrowdLevel: "Medium",
      },
    ],
  },
]

export const mockAdminOperators: AdminOperator[] = [
  {
    id: "2",
    name: "Jane Operator",
    email: "jane@centralbank.com",
    branchId: "1",
    branchName: "Central Bank - Downtown Branch",
    institutionName: "Central Bank",
    isActive: true,
    lastActive: "2024-01-15T14:30:00",
    totalUpdates: 156,
    averageResponseTime: 2.3,
    performance: "Excellent",
  },
  {
    id: "4",
    name: "Mike Wilson",
    email: "mike@centralbank.com",
    branchId: "4",
    branchName: "Central Bank - West Side Branch",
    institutionName: "Central Bank",
    isActive: true,
    lastActive: "2024-01-15T14:25:00",
    totalUpdates: 89,
    averageResponseTime: 3.1,
    performance: "Good",
  },
  {
    id: "5",
    name: "Sarah Johnson",
    email: "sarah@cityparks.gov",
    branchId: "2",
    branchName: "Central Park Recreation Center",
    institutionName: "City Parks Department",
    isActive: true,
    lastActive: "2024-01-15T14:20:00",
    totalUpdates: 67,
    averageResponseTime: 4.2,
    performance: "Good",
  },
  {
    id: "6",
    name: "David Brown",
    email: "david@dmv.gov",
    branchId: "5",
    branchName: "DMV Center",
    institutionName: "Government Services",
    isActive: false,
    lastActive: "2024-01-15T12:45:00",
    totalUpdates: 134,
    averageResponseTime: 2.8,
    performance: "Excellent",
  },
  {
    id: "7",
    name: "Lisa Chen",
    email: "lisa@temp.com",
    isActive: true,
    lastActive: "2024-01-15T14:35:00",
    totalUpdates: 23,
    averageResponseTime: 5.1,
    performance: "Average",
  },
]

export const mockSystemStats: SystemStats = {
  totalInstitutions: 3,
  totalBranches: 5,
  totalOperators: 5,
  totalVisitors: 2847,
  activeOperators: 4,
  systemUptime: "99.8%",
  totalCrowdUpdates: 1247,
  averageWaitTime: 18.5,
}

export const mockDailyAnalytics = [
  { date: "Jan 10", institutions: 3, operators: 4, updates: 89, visitors: 234 },
  { date: "Jan 11", institutions: 3, operators: 5, updates: 112, visitors: 267 },
  { date: "Jan 12", institutions: 3, operators: 5, updates: 98, visitors: 198 },
  { date: "Jan 13", institutions: 3, operators: 4, updates: 134, visitors: 289 },
  { date: "Jan 14", institutions: 3, operators: 5, updates: 156, visitors: 312 },
  { date: "Jan 15", institutions: 3, operators: 4, updates: 143, visitors: 298 },
]
