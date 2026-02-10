
import { NextRequest, NextResponse } from 'next/server'

import { User } from '@/types/models/user/user-model'
import { createUser, getAllUsers } from '@/utils/user'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()
  try {
    const result = await createUser(name, email, password)
    if (result.success) {
      return NextResponse.json({ user: result.data }, { status: 201 })
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user from middleware headers
    const userId = req.headers.get('x-user-id')
    const userEmail = req.headers.get('x-user-email')

    console.log(`User ${userEmail} (${userId}) fetching locations`)

    const users = await getAllUsers()
    if (users.success) {
      return NextResponse.json(users.data as User[], { status: 200 })
    } else {
      return NextResponse.json({ error: users.message }, { status: users.code || 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
