// Product Details form
import ProductDetails from '@/components/dashboard/forms/product-details'
import VariantDetails from '@/components/dashboard/forms/variant-details'
import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'
import {
  getProductById,
  getProductMainInfo,
} from '@/lib/queries/dashboard/products'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import { notFound } from 'next/navigation'

export default async function SellerNewProductVariantPage({
  params,
}: {
  //   params: { storeUrl: string; productId: string }
  params: Promise<{ storeUrl: string; productId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId

  // Fetching products data from the database for the active store
  // const product = await getProductById(productId)
  if (!productId || !storeUrl) return notFound()
  // if (!product) return null

  return (
    <div>
      <VariantDetails productId={productId} />
    </div>
  )
}
