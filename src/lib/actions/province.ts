'use server'

import { prisma } from '../prisma'

export const getCityByProvinceId = async (provinceId: string) => {
  try {
    const cities = await prisma.city.findMany({
      where: {
        provinceId: +provinceId,
      },
      orderBy: {
        id: 'asc',
      },
    })

    return cities
  } catch (error) {
    console.log(error)
  }
}

export const getCityById = async (cityId: string) => {
  try {
    const city = await prisma.city.findFirst({
      where: {
        id: +cityId,
      },
    })

    return city
  } catch (error) {
    console.log(error)
  }
}
