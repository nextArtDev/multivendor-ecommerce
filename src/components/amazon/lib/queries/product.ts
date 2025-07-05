'use server'

import { getCityById, getProvinceById } from '@/lib/actions/province'
import { prisma } from '@/lib/prisma'
import {
  FreeShipping,
  FreeShippingCity,
  FreeShippingCountry,
  Store,
} from '@prisma/client'

export const retrieveProductDetailsOptimized = async (productSlug: string) => {
  // console.log('productSlug', productSlug)
  // Fetch the product details from the database
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: {
      id: true,
      name: true,
      slug: true,
      rating: true,
      numReviews: true,
      description: true,
      specs: true,
      questions: true,
      categoryId: true,
      subCategoryId: true,
      shippingFeeMethod: true,
      freeShippingForAllCountries: true,
      images: true,
      _count: {
        select: {
          reviews: true,
        },
      },
      freeShipping: {
        include: {
          eligibaleCountries: {
            include: {
              country: true,
            },
          },
        },
      },
      variants: {
        select: {
          id: true,
          variantName: true,
          variantImage: true,
          weight: true,
          slug: true,
          sku: true,
          isSale: true,
          saleEndDate: true,
          variantDescription: true,
          keywords: true,
          specs: true,
          //   images: {
          //     select: {
          //       url: true,
          //     },
          //     orderBy: {
          //       order: 'asc',
          //     },
          //   },
          sizes: true,
          colors: {
            select: {
              name: true,
            },
          },
        },
      },
      store: { include: { logo: true } },
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  // Return the structured product details
  return product
}

export type FreeShippingWithCountriesAndCitiesType = FreeShipping & {
  eligibaleCountries: FreeShippingCountry[]
  // eligibleCities: FreeShippingCity[]
  // freeShippingCity: FreeShippingCity[]
}

export const getShippingDetails = async (
  shippingFeeMethod: string,
  userCountry: { name: string; code: string; city: string },
  store: Store,
  freeShipping: FreeShippingWithCountriesAndCitiesType | null,
  freeShippingForAllCountries: boolean
  // freeShippingForAllCities: boolean
) => {
  // Default shipping details
  let shippingDetails = {
    shippingFeeMethod,
    shippingService: '',
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    returnPolicy: '',
    countryCode: userCountry.code,
    countryName: userCountry.name,
    city: userCountry.city,
    isFreeShipping: false,
  }

  const country = await prisma.country.findUnique({
    where: {
      name: userCountry.name,
      code: userCountry.code,
    },
  })
  // const city = await prisma.city.findUnique({
  //   where: {
  //     name: userCity.name,
  //     code: userCity.code,
  //   },
  // })

  if (country) {
    // Retrieve shipping rate for the country
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        countryId: country.id,
        storeId: store.id,
      },
    })

    // Extract shipping details
    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax

    // Check for free shipping
    let isFreeShipping = false
    if (freeShippingForAllCountries === true) {
      isFreeShipping = true
    } else if (freeShipping) {
      const eligibleCountries = freeShipping.eligibaleCountries
      isFreeShipping = eligibleCountries.some((c) => c.countryId === country.id)
    }

    shippingDetails = {
      shippingFeeMethod,
      shippingService,
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      countryCode: userCountry.code,
      countryName: userCountry.name,
      city: userCountry.city,
      isFreeShipping,
    }

    // Determine shipping fees based on method
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem
    const shippingFeeForAdditionalItem =
      shippingRate?.shippingFeeForAdditionalItem ||
      store.defaultShippingFeeForAdditionalItem
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed

    if (!isFreeShipping) {
      switch (shippingFeeMethod) {
        case 'ITEM':
          shippingDetails.shippingFee = shippingFeePerItem
          shippingDetails.extraShippingFee = shippingFeeForAdditionalItem
          break

        case 'WEIGHT':
          shippingDetails.shippingFee = shippingFeePerKg
          break

        case 'FIXED':
          shippingDetails.shippingFee = shippingFeeFixed
          break

        default:
          break
      }
    }

    return shippingDetails
  }

  // Default values if country is not found
  return {
    shippingFeeMethod,
    shippingService: store.defaultShippingService || 'International Delivery',
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: store.defaultDeliveryTimeMin || 0,
    deliveryTimeMax: store.defaultDeliveryTimeMax || 0,
    returnPolicy:
      store.returnPolicy ||
      'We understand things don’t always work out. You can return this item within 30 days of delivery for a full refund or exchange. Please ensure the item is in its original condition.',
    countryCode: userCountry.code,
    countryName: userCountry.name,
    city: userCountry.city,
    isFreeShipping: freeShippingForAllCountries,
  }
}
export const getCityShippingDetails = async (
  shippingFeeMethod: string,
  userProvince: string,
  store: Store,
  freeShipping: FreeShippingWithCountriesAndCitiesType | null,
  freeShippingForAllCountries: boolean
  // freeShippingForAllCities: boolean
) => {
  // Default shipping details
  // console.log('userProvinceByProvinceCityIds', userProvince)
  const [provinceId, cityId] = userProvince.split('-')
  const city = await getCityById(cityId)
  // console.log('city.name', city?.name)
  const province = await getProvinceById(provinceId)

  // console.log('province.name', province?.name)
  if (!city || !province) return
  let shippingDetails = {
    shippingFeeMethod,
    shippingService: '',
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: 0,
    deliveryTimeMax: 0,
    returnPolicy: '',
    provinceCode: provinceId,
    provinceName: province?.name,
    cityCode: cityId,
    cityName: city?.name,
    isFreeShipping: false,
  }

  // const country = await prisma.country.findUnique({
  //   where: {
  //     name: userCountry.name,
  //     code: userCountry.code,
  //   },
  // })
  // const city = await prisma.city.findUnique({
  //   where: {
  //     name: userCity.name,
  //     code: userCity.code,
  //   },
  // })
  if (city && province) {
    // Retrieve shipping rate for the country
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        cityId: +cityId,
        // countryId: country.id,
        storeId: store.id,
      },
    })

    // Extract shipping details
    const returnPolicy = shippingRate?.returnPolicy || store.returnPolicy
    const shippingService =
      shippingRate?.shippingService || store.defaultShippingService
    const deliveryTimeMin =
      shippingRate?.deliveryTimeMin || store.defaultDeliveryTimeMin
    const deliveryTimeMax =
      shippingRate?.deliveryTimeMax || store.defaultDeliveryTimeMax

    // Check for free shipping
    let isFreeShipping = false
    if (freeShippingForAllCountries === true) {
      isFreeShipping = true
    } else if (freeShipping) {
      const eligibleCountries = freeShipping.eligibaleCountries
      isFreeShipping = eligibleCountries.some((c) => c.countryId === cityId)
    }

    shippingDetails = {
      shippingFeeMethod,
      shippingService,
      shippingFee: 0,
      extraShippingFee: 0,
      deliveryTimeMin,
      deliveryTimeMax,
      returnPolicy,
      provinceCode: provinceId,
      provinceName: province?.name,
      cityCode: cityId,
      cityName: city?.name,
      isFreeShipping,
    }

    // Determine shipping fees based on method
    const shippingFeePerItem =
      shippingRate?.shippingFeePerItem || store.defaultShippingFeePerItem
    const shippingFeeForAdditionalItem =
      shippingRate?.shippingFeeForAdditionalItem ||
      store.defaultShippingFeeForAdditionalItem
    const shippingFeePerKg =
      shippingRate?.shippingFeePerKg || store.defaultShippingFeePerKg
    const shippingFeeFixed =
      shippingRate?.shippingFeeFixed || store.defaultShippingFeeFixed

    if (!isFreeShipping) {
      switch (shippingFeeMethod) {
        case 'ITEM':
          shippingDetails.shippingFee = shippingFeePerItem
          shippingDetails.extraShippingFee = shippingFeeForAdditionalItem
          break

        case 'WEIGHT':
          shippingDetails.shippingFee = shippingFeePerKg
          break

        case 'FIXED':
          shippingDetails.shippingFee = shippingFeeFixed
          break

        default:
          break
      }
    }

    return shippingDetails
  }

  // Default values if country is not found
  return {
    shippingFeeMethod,
    shippingService: store.defaultShippingService || 'International Delivery',
    shippingFee: 0,
    extraShippingFee: 0,
    deliveryTimeMin: store.defaultDeliveryTimeMin || 0,
    deliveryTimeMax: store.defaultDeliveryTimeMax || 0,
    returnPolicy:
      store.returnPolicy ||
      'We understand things don’t always work out. You can return this item within 30 days of delivery for a full refund or exchange. Please ensure the item is in its original condition.',
    provinceCode: provinceId,
    provinceName: province?.name,
    cityCode: cityId,
    cityName: city?.name,
    isFreeShipping: freeShippingForAllCountries,
  }
}

export const userProvinceByProvinceCityIds = async (userProvince: string) => {
  const [provinceId, cityId] = userProvince.split('-')
  const city = await getCityById(cityId)
  const province = await getProvinceById(provinceId)
  if (!city || !province) return null
  return { city, province }
}
