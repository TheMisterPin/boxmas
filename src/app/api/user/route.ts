 

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getAllUsers } from '@/utils/users';
import { User } from '@/types/models/user-model';

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  try {
    const result = await createUser(name, email, password);
    if (result.success) {
      return NextResponse.json({ user: result.data }, { status: 201 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET() {
  const users = await getAllUsers();
  try {
    if (users.success) {
      return NextResponse.json(users.data as User[], { status: 200 });
    } else {
      return NextResponse.json({ error: users.message }, { status: users.code || 400 });
    }
  }
  catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}