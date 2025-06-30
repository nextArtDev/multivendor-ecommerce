// 'use server'
import countries from '@/constants/countries.json'
import { CartProductType } from '../types'
interface Country {
  name: string
  code: string
  city: string
  region: string
  //   loc?: string
}
const DEFAULT_COUNTRY: Country = {
  name: 'Iran, Islamic Republic Of',
  code: 'IR',
  city: '',
  region: '',
  //   loc: '',
}

interface IPInfoResponse {
  country: string
  city: string
  region: string
  //   loc?: string
}
export async function getUserCountry(req: Request): Promise<Country> {
  let userCountry: Country = DEFAULT_COUNTRY

  // If geo data is available (in production on Vercel as an edge function)
  const geo = (req as any).geo // For edge functions in Vercel
  if (geo) {
    userCountry = {
      name: geo.country || DEFAULT_COUNTRY.name,
      code: geo.country || DEFAULT_COUNTRY.code,
      city: geo.city || DEFAULT_COUNTRY.city,
      region: geo.region || DEFAULT_COUNTRY.region,
      //   loc: geo?.loc || '',
    }
  } else {
    // Fallback to IPInfo API on localhost or non-edge environments
    try {
      const response = await fetch(
        `https://ipinfo.io/?token=${process.env.IPINFO_TOKEN}`
      )
      if (response.ok) {
        const data = (await response.json()) as IPInfoResponse
        userCountry = {
          name:
            countries.find((c) => c.code === data.country)?.name ||
            data.country ||
            DEFAULT_COUNTRY.name,
          code: data.country || DEFAULT_COUNTRY.code,
          city: data.city || DEFAULT_COUNTRY.city,
          region: data.region || DEFAULT_COUNTRY.region,
          //   loc: data?.loc,
        }
      }
    } catch (error) {
      // Handle error if necessary
      console.log(error)
    }
  }

  return userCountry
}

export const getShippingDatesRange = (
  minDays: number,
  maxDays: number,
  date?: Date
): { minDate: string; maxDate: string } => {
  // Get the current date
  const currentDate = date ? new Date(date) : new Date()

  // Calculate minDate by adding minDays to current date
  const minDate = new Date(currentDate)
  minDate.setDate(currentDate.getDate() + minDays)

  // Calculate maxDate by adding maxDays to current date
  const maxDate = new Date(currentDate)
  maxDate.setDate(currentDate.getDate() + maxDays)

  // Return an object containing minDate and maxDate
  return {
    minDate: minDate.toDateString(),
    maxDate: maxDate.toDateString(),
  }
}

// Function to validate the product data before adding it to the cart
export const isProductValidToAdd = (product: CartProductType): boolean => {
  // Check that all required fields are filled
  const {
    productId,
    variantId,
    productSlug,
    variantSlug,
    name,
    variantName,
    images,
    quantity,
    price,
    sizeId,
    size,
    stock,
    shippingFee,
    extraShippingFee,
    shippingMethod,
    shippingService,
    variantImage,
    weight,
    deliveryTimeMin,
    deliveryTimeMax,
  } = product

  // Ensure that all necessary fields have values
  if (
    !productId ||
    !variantId ||
    !productSlug ||
    !variantSlug ||
    !name ||
    !variantName ||
    !images ||
    quantity <= 0 ||
    price <= 0 ||
    !sizeId || // Ensure sizeId is not empty
    !size || // Ensure size is not empty
    stock <= 0 ||
    weight <= 0 || // Weight should be <= 0
    // !shippingMethod ||
    !variantImage ||
    deliveryTimeMin < 0 ||
    deliveryTimeMax < deliveryTimeMin // Ensure delivery times are valid
  ) {
    return false // Validation failed
  }

  return true // Product is valid
}

export const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

export const printPDF = (blob: Blob) => {
  const pdfUrl = URL.createObjectURL(blob)
  const printWindow = window.open(pdfUrl, '_blank')
  if (printWindow) {
    printWindow.addEventListener('load', () => {
      printWindow.focus()
      printWindow.print()
    })
  }
}
export const updateProductHistory = (variantId: string) => {
  // Fetch existing product history from localStorage
  let productHistory: string[] = []
  const historyString = localStorage.getItem('productHistory')

  if (historyString) {
    try {
      productHistory = JSON.parse(historyString)
    } catch (error) {
      productHistory = []
    }
  }

  // Update the history: Remove the product if it exists, and add it to the front
  productHistory = productHistory.filter((id) => id !== variantId)
  productHistory.unshift(variantId)

  // Check storage limit (manage max number of products)
  const MAX_PRODUCTS = 100
  if (productHistory.length > MAX_PRODUCTS) {
    productHistory.pop() // Remove the oldest product
  }
  // Save updated history to localStorage
  localStorage.setItem('productHistory', JSON.stringify(productHistory))
}
