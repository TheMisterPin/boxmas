import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export const getUserByEmail = async (email: string): Promise<BasicResponse> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    if (user) {
      return { success: true, data: user }
    } else {
      return { success: false, message: 'User not found', data: null, code: 404 }
    }
  } catch (error) {
    return { success: false, message: 'Error fetching user', error: error, data: null, code: 500 }
  }
}
export const getAllUsers = async (): Promise<BasicResponse> => {
  try {
    const users = await prisma.user.findMany()
    if (users) {
      return { success: true, data: users }
    } else {
      return { success: false, message: 'No users found', data: null, code: 404 }
    }
  } catch (error) {
    return { success: false, message: 'Error fetching users', error: error, data: null, code: 500 }
  }
}

export const checkUser = async (email: string): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return !!user
  } catch (error) {
    return false
  }
}

export const checkPassword = async (email: string, password: string): Promise<BasicResponse> => {
  const result = await getUserByEmail(email)
  if (!result.success) {
    return { success: false, message: 'User not found', data: null, code: 404 }
  }
  const user = result.data
  if (user && user.password === password) {
    return { success: true, data: user }
  }
  return { success: false, message: 'Incorrect password', data: null, code: 401 }
}
