'use server'

import { prisma } from '../prisma'

export const getCityByProvinceId = async (provinceId: string) => {
  try {
    const city = await prisma.city.findMany({
      where: {
        provinceId: +provinceId,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return city
  } catch (error) {
    console.log(error)
  }
}
