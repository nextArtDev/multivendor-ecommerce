import { retrieveProductDetailsOptimized } from '@/components/amazon/lib/queries/product'
import { Prisma, Size, Spec } from '@prisma/client'

export type ProductDataType = Prisma.PromiseReturnType<
  typeof retrieveProductDetailsOptimized
>

export type ProductVariantDataType = {
  id: string
  variantName: string
  slug: string
  sku: string
  weight: number
  isSale: boolean
  saleEndDate: string | null
  variantDescription: string | null

  variantImage: {
    url: string
  }[]
  sizes: Size[]
  specs: Spec[]
  colors: { name: string }[]
  keywords: string
}

export type CartProductType = {
  productId: string
  variantId: string
  productSlug: string
  variantSlug: string
  name: string
  variantName: string
  //   image: string
  variantImage: string
  sizeId: string
  size: string
  quantity: number
  price: number
  stock: number
  weight: number
  shippingMethod: string
  shippingService: string
  shippingFee: number
  extraShippingFee: number
  deliveryTimeMin: number
  deliveryTimeMax: number
  isFreeShipping: boolean
}
