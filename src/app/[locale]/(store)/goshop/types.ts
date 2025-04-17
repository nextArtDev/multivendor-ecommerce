import { retrieveProductDetailsOptimized } from '@/components/amazon/lib/queries/product'
import {
  Cart,
  CartItem,
  Country,
  Coupon,
  Image,
  Prisma,
  ShippingAddress,
  Size,
  Spec,
  Store,
  User,
} from '@prisma/client'

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
  images: Image[]
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

export type ShippingDetailsType = {
  countryCode: string
  countryName: string
  city: string
  shippingFeeMethod: string
  shippingFee: number
  extraShippingFee: number
  deliveryTimeMin: number
  deliveryTimeMax: number
  isFreeShipping: boolean
  shippingService: string
  returnPolicy: string
}

export type UserShippingAddressType = ShippingAddress & {
  country: Country
  user: User
}
export type CartWithCartItemsType = Cart & {
  cartItems: CartItem[]
  coupon: (Coupon & { store: Store }) | null
}
