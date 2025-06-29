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
        // provinceId: +provinceId,
      },
    })

    return city
  } catch (error) {
    console.log(error)
  }
}
export const getProvinceById = async (provinceId: string) => {
  console.log('query provinceId', provinceId)
  try {
    const province = await prisma.province.findFirst({
      where: {
        id: +provinceId,
      },
    })
    console.log('query province', province)
    return province
  } catch (error) {
    console.log(error)
  }
}
