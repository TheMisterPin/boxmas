import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { createCollection, getCollections } from '@/utils/collection'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const auth = await getAuthFromRequest(req)
  if (!auth.valid || !auth.userId) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

  const result = await getCollections(auth.userId)
  if (result.success) return NextResponse.json(result.data, { status: 200 })
  return NextResponse.json({ error: result.message }, { status: result.code || 400 })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthFromRequest(req)
  if (!auth.valid || !auth.userId) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  const result = await createCollection(auth.userId, name)
  if (result.success) return NextResponse.json(result.data, { status: 201 })
  return NextResponse.json({ error: result.message }, { status: result.code || 400 })
}
