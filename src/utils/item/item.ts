import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types'

export async function createItem(
  userId: string,
  data: {
    name: string;
    description?: string | null;
    collectionId?: string | null;
    boxId: string;
    addedAt?: string;
  },
): Promise<BasicResponse> {
  const box = await prisma.box.findFirst({
    where: { id: data.boxId, location: { userId } },
  })
  if (!box) {
    return { success: false, data: null, message: 'Box not found', code: 404 }
  }

  const item = await prisma.item.create({
    data: {
      name: data.name,
      description: data.description,
      collectionId: data.collectionId,
      boxId: data.boxId,
      addedAt: data.addedAt ? new Date(data.addedAt) : undefined,
    },
  })

  return { success: true, data: item, message: 'Item created successfully' }
}

export async function moveItem(
  userId: string,
  itemId: string,
  toBoxId: string,
): Promise<BasicResponse> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, box: { location: { userId } } },
  })
  if (!item) {
    return { success: false, data: null, message: 'Item not found', code: 404 }
  }

  const toBox = await prisma.box.findFirst({
    where: { id: toBoxId, location: { userId } },
  })
  if (!toBox) {
    return {
      success: false,
      data: null,
      message: 'Destination box not found',
      code: 404,
    }
  }

  const moved = await prisma.$transaction(async (tx) => {
    const updatedItem = await tx.item.update({
      where: { id: itemId },
      data: { boxId: toBoxId },
    })
    await tx.box.update({
      where: { id: toBoxId },
      data: { lastMovedAt: new Date() },
    })
    return updatedItem
  })

  return { success: true, data: moved, message: 'Item moved successfully' }
}

export async function searchItems(
  userId: string,
  name?: string,
): Promise<BasicResponse> {
  const items = await prisma.item.findMany({
    where: {
      box: { location: { userId } },
      ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return {
    success: true,
    data: items,
    message: 'Items retrieved successfully',
  }
}
