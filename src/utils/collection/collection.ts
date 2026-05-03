import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export async function createCollection(userId: string, name: string): Promise<BasicResponse> {
  try {
    if (!name?.trim()) return { success: false, data: null, message: 'Collection name is required', code: 400 }

    const collection = await prisma.collection.create({
      data: { name: name.trim(), userId },
    })

    return { success: true, data: collection, message: 'Collection created successfully' }
  } catch (error) {
    return { success: false, data: null, error, message: 'Failed to create collection', code: 500 }
  }
}

export async function getCollections(userId: string): Promise<BasicResponse> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      include: { _count: { select: { boxes: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: collections, message: 'Collections retrieved successfully' }
  } catch (error) {
    return { success: false, data: null, error, message: 'Failed to retrieve collections', code: 500 }
  }
}

export async function assignBoxToCollection(userId: string, boxId: string, collectionId: string): Promise<BasicResponse> {
  try {
    const collection = await prisma.collection.findFirst({ where: { id: collectionId, userId } })
    if (!collection) return { success: false, data: null, message: 'Collection not found', code: 404 }

    const box = await prisma.box.findFirst({ where: { id: boxId, location: { userId } } })
    if (!box) return { success: false, data: null, message: 'Box not found', code: 404 }

    const updated = await prisma.box.update({ where: { id: boxId }, data: { collectionId } })
    return { success: true, data: updated, message: 'Box added to collection' }
  } catch (error) {
    return { success: false, data: null, error, message: 'Failed to add box to collection', code: 500 }
  }
}
