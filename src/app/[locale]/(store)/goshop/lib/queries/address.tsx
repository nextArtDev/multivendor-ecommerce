'use server'

import { prisma } from '@/lib/prisma'

export const getAllProvinces = async () => {
  try {
    return await prisma.province.findMany({})
  } catch (error) {
    console.log(error)
  }
}
