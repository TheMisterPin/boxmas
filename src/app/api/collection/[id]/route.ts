import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { getBoxesByCollection } from '@/utils/box'

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await getAuthFromRequest(req)
  if (!auth.valid || !auth.userId) return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 })

  const result = await getBoxesByCollection(auth.userId, params.id)
  if (result.success) return NextResponse.json(result.data, { status: 200 })
  return NextResponse.json({ error: result.message }, { status: result.code || 400 })
}
