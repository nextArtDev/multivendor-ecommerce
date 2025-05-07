import { prisma } from '@/lib/prisma'

export const getOfferTag = async (offerTagId: string) => {
  // Ensure offerTag ID is provided
  if (!offerTagId) throw new Error('Please provide offer tag ID.')

  // Retrieve the offer tag from the database using the provided ID
  const offerTag = await prisma.offerTag.findUnique({
    where: {
      id: offerTagId,
    },
  })

  // Return the retrieved offer tag details
  return offerTag
}
