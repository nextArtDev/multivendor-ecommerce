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

export const getCityById = async (cityId: string, provinceId: string) => {
  try {
    const city = await prisma.city.findFirst({
      where: {
        id: +cityId,
        provinceId: +provinceId,
      },
    })

    return city
  } catch (error) {
    console.log(error)
  }
}
export const getProvinceById = async (provinceId: string) => {
  try {
    const province = await prisma.province.findFirst({
      where: {
        id: +provinceId,
      },
    })

    return province
  } catch (error) {
    console.log(error)
  }
}
