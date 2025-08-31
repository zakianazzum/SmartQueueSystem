import { userApi, type User as ApiUser } from "./api"

export type UserRole = "visitor" | "operator" | "administrator"

export interface User {
  userId: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
  visitorId?: string
}

function convertApiUser(apiUser: ApiUser): User {
  return {
    userId: apiUser.userId,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  }
}

export async function signIn(email: string, password: string): Promise<{ user: User; visitorId?: string } | null> {
  try {
    const response = await userApi.login({ email, password })
    return {
      user: convertApiUser(response.user),
      visitorId: response.visitorId
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return null
  }
}

export async function signUp(name: string, email: string, password: string): Promise<User | null> {
  try {
    const newUserData = {
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

export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await userApi.getById(id)
    return convertApiUser(user)
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}
