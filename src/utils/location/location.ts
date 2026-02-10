import prisma from '@/lib/prisma'
import { BasicResponse } from '@/types/responses/basic-response'

export async function getLocations(userId: string): Promise<BasicResponse> {
  try {
    const locations = await prisma.location.findMany({
      where: {
        userId,
      },
    })

    return {
      success: true,
      data: locations,
      message: 'Locations retrieved successfully',
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
      message: 'Failed to retrieve locations',
      code: 500,
    }
  }
}
