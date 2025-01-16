// Product Details form
import ProductDetails from '@/components/dashboard/forms/product-details'
import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'
import { getProductMainInfo } from '@/lib/queries/dashboard/products'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'

export default async function SellerNewProductVariantPage({
  params,
}: {
  //   params: { storeUrl: string; productId: string }
  params: Promise<{ storeUrl: string; productId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId
  const categories = await getAllCategories()
  const offerTags = await getAllOfferTags()
  const product = await getProductMainInfo(productId)
  if (!product) return null
  const countries = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  return (
    <div>
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        data={product}
        offerTags={offerTags}
        countries={countries}
      />
    </div>
  )
}
