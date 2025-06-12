import { retrieveProductDetailsOptimized } from '@/components/amazon/lib/queries/product'
import {
  Cart,
  CartItem,
  Category,
  City,
  Country,
  Coupon,
  FreeShipping,
  FreeShippingCountry,
  Image,
  OrderGroup,
  OrderItem,
  Prisma,
  Province,
  ShippingAddress,
  Size,
  Spec,
  Store,
  SubCategory,
  User,
} from '@prisma/client'
import { getOrder } from './lib/queries/order'
import {
  getUserOrders,
  getUserPayments,
  getUserWishlist,
} from './lib/queries/profile'

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
  city: City
  province: Province
  user: User
}
export type CartWithCartItemsType = Cart & {
  cartItems: CartItem[]
  coupon: (Coupon & { store: Store }) | null
}

export type FreeShippingWithCountriesType = FreeShipping & {
  eligibaleCountries: FreeShippingCountry[]
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  OutforDelivery = 'OutforDelivery',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  Refunded = 'Refunded',
  Returned = 'Returned',
  PartiallyShipped = 'PartiallyShipped',
  OnHold = 'OnHold',
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Declined = 'Declined',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  PartiallyRefunded = 'PartiallyRefunded',
  Chargeback = 'Chargeback',
}

export type OrderGroupWithItemsType = OrderGroup & {
  items: OrderItem[]
  store: Store & { logo: Image | null }
  _count: {
    items: number
  }
  coupon: Coupon | null
}

export type OrderFullType = Prisma.PromiseReturnType<typeof getOrder>

export enum ProductStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  ReadyForShipment = 'ReadyForShipment',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Canceled = 'Canceled',
  Returned = 'Returned',
  Refunded = 'Refunded',
  FailedDelivery = 'FailedDelivery',
  OnHold = 'OnHold',
  Backordered = 'Backordered',
  PartiallyShipped = 'PartiallyShipped',
  ExchangeRequested = 'ExchangeRequested',
  AwaitingPickup = 'AwaitingPickup',
}

export type OrderTableFilter =
  | ''
  | 'unpaid'
  | 'toShip'
  | 'shipped'
  | 'delivered'

export type OrderTableDateFilter =
  | ''
  | 'last-6-months'
  | 'last-1-year'
  | 'last-2-years'

export type UserOrderType = Prisma.PromiseReturnType<
  typeof getUserOrders
>['orders'][0]

export type UserPaymentType = Prisma.PromiseReturnType<
  typeof getUserPayments
>['payments'][0]

export type PaymentTableFilter = '' | 'paypal' | 'credit-card'

export type PaymentTableDateFilter =
  | ''
  | 'last-6-months'
  | 'last-1-year'
  | 'last-2-years'

export type ReviewFilter = '5' | '4' | '3' | '2' | '1' | ''

export type ReviewDateFilter =
  | ''
  | 'last-6-months'
  | 'last-1-year'
  | 'last-2-years'

export type ProductWishlistType = Prisma.PromiseReturnType<
  typeof getUserWishlist
>['wishlist'][0]

export type FiltersQueryType = {
  search: string
  category: string
  subCategory: string
  offer: string
  size: string
  sort: string
  minPrice: string
  maxPrice: string
  color: string
}

export type CatgegoryWithSubsType = Category & {
  subCategories: SubCategory[]
}

export type VariantImageType = {
  url: string
  image: Image
}
