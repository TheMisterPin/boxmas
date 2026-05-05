import { NextRequest, NextResponse } from 'next/server'

import { getAuthFromRequest } from '@/utils/auth'
import { createItem, searchItems } from '@/utils/item'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 },
      )
    }

    const { name, description, collectionId, boxId, addedAt } =
      await req.json()
    if (!name || !boxId) {
      return NextResponse.json(
        { error: 'Name and boxId are required' },
        { status: 400 },
      )
    }

    const result = await createItem(auth.userId, {
      name,
      description,
      collectionId,
      boxId,
      addedAt,
    })
    if (result.success) {
      return NextResponse.json(result.data, { status: 201 })
    }

    return NextResponse.json(
      { error: result.message },
      { status: result.code || 400 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create item',
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req)
    if (!auth.valid || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: 401 },
      )
    }

    const name = req.nextUrl.searchParams.get('name') || undefined
    const result = await searchItems(auth.userId, name)
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 })
    }

    return NextResponse.json(
      { error: result.message },
      { status: result.code || 400 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch items',
      },
      { status: 500 },
    )
  }
}
