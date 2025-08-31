import { userApi, type User as ApiUser, type UserCreate } from "./api"

export type UserRole = "visitor" | "operator" | "administrator"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

function convertApiUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role === "administrator" ? "administrator" : apiUser.role,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  }
}

export async function signIn(email: string, password: string): Promise<User | null> {
  try {
    // For now, we'll get all users and find matching email/password
    const users = await userApi.getAll()
    const user = users.find((u) => u.email === email)

    if (user) {
      // In a real app, password verification would be done on the server
      return convertApiUser(user)
    }
    return null
  } catch (error) {
    console.error("Sign in error:", error)
    return null
  }
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  try {
    const newUserData: UserCreate = {
      name,
      email,
      password,
      role: "visitor", // Default role for new users
    }

    const createdUser = await userApi.create(newUserData)
    return convertApiUser(createdUser)
  } catch (error) {
    console.error("Sign up error:", error)
    return null
  }
}

export async function getUserById(id: number): Promise<User | null> {
  try {
    const user = await userApi.getById(id)
    return convertApiUser(user)
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}
