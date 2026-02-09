 

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { checkPassword } from '@/utils/users';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  try {
    const result = await checkPassword(email, password);
    if (result.success) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: result.data.id, email: result.data.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        user: result.data,
        token
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}

