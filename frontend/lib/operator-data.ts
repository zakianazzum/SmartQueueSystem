export interface BranchInfo {
  id: string
  name: string
  address: string
  institutionName: string
  serviceHours: string
  services: string[]
  capacity: number
  currentStaff: number
  operatorId: string
}

export interface CrowdUpdate {
  id: string
  timestamp: string
  previousCount: number
  newCount: number
  changeType: "increase" | "decrease" | "manual"
  operatorId: string
  notes?: string
}

export const mockBranchInfo: BranchInfo = {
  id: "branch-1",
  name: "Central Bank Downtown - Main Branch",
  address: "123 Main St, Downtown",
  institutionName: "Central Bank",
  serviceHours: "9:00 AM - 5:00 PM",
  services: ["Banking", "ATM", "Loans", "Customer Service"],
  capacity: 50,
  currentStaff: 4,
  operatorId: "2",
}

export const mockCrowdUpdates: CrowdUpdate[] = [
  {
    id: "1",
    timestamp: "2024-01-15T14:30:00",
    previousCount: 12,
    newCount: 15,
    changeType: "increase",
    operatorId: "2",
    notes: "Lunch rush starting",
  },
  {
    id: "2",
    timestamp: "2024-01-15T14:15:00",
    previousCount: 15,
    newCount: 12,
    changeType: "decrease",
    operatorId: "2",
  },
  {
    id: "3",
    timestamp: "2024-01-15T14:00:00",
    previousCount: 18,
    newCount: 15,
    changeType: "decrease",
    operatorId: "2",
    notes: "Several customers served",
  },
  {
    id: "4",
    timestamp: "2024-01-15T13:45:00",
    previousCount: 20,
    newCount: 18,
    changeType: "decrease",
    operatorId: "2",
  },
  {
    id: "5",
    timestamp: "2024-01-15T13:30:00",
    previousCount: 16,
    newCount: 20,
    changeType: "increase",
    operatorId: "2",
    notes: "Peak lunch hour",
  },
]

export const mockDailyStats = {
  totalUpdates: 24,
  peakCount: 32,
  peakTime: "2:30 PM",
  averageCount: 18,
  totalCustomersServed: 156,
  averageServiceTime: 8.5,
}

export const mockHourlyData = [
  { hour: "09:00", count: 5, served: 8 },
  { hour: "10:00", count: 12, served: 15 },
  { hour: "11:00", count: 18, served: 22 },
  { hour: "12:00", count: 25, served: 18 },
  { hour: "13:00", count: 32, served: 12 },
  { hour: "14:00", count: 28, served: 16 },
  { hour: "15:00", count: 20, served: 24 },
  { hour: "16:00", count: 15, served: 20 },
  { hour: "17:00", count: 8, served: 12 },
]
