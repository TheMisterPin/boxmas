import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { moveItem } from '@/utils/item'

export const runtime = 'nodejs'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 },
      )
    }

    const itemId = params?.id
    const { toBoxId } = await req.json()
    if (!itemId || !toBoxId) {
      return NextResponse.json(
        { error: 'Item id and toBoxId are required' },
        { status: 400 },
      )
    }

    const result = await moveItem(auth.userId, itemId, toBoxId)
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json(
      { error: result.message },
      { status: result.code || 400 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move item' },
      { status: 500 },
    )
  }
}
