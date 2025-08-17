export type UserRole = "visitor" | "operator" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

// Mock user data for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  "visitor@test.com": {
    password: "password",
    user: { id: "1", name: "John Visitor", email: "visitor@test.com", role: "visitor" },
  },
  "operator@test.com": {
    password: "password",
    user: { id: "2", name: "Jane Operator", email: "operator@test.com", role: "operator" },
  },
  "admin@test.com": {
    password: "password",
    user: { id: "3", name: "Admin User", email: "admin@test.com", role: "admin" },
  },
}

export async function signIn(email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const userData = mockUsers[email]
  if (userData && userData.password === password) {
    return userData.user
  }
  return null
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, this would create a new user in the database
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    role: "visitor", // Default role for new users
  }

  return newUser
}
