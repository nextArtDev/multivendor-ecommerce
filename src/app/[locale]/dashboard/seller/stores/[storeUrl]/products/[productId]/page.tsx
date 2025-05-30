import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'
import { getProductById } from '@/lib/queries/dashboard/products'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import { notFound } from 'next/navigation'
import ProductForm from '../components/new-product-form'

export default async function SellerNewProductPage({
  params,
}: // searchParams,
{
  params: Promise<{ storeUrl: string; productId: string }>
  // searchParams: Promise<{ categoryId: string }>
}) {
  const storeUrl = (await params).storeUrl
  const productId = (await params).productId
  const product = await getProductById(productId)

  // const categoryId = (await searchParams).categoryId
  const store = await prisma.store.findFirst({ where: { url: storeUrl } })
  if (!store || !product) return notFound()

  const categories = await getAllCategories({})
  // console.log({ categories })

  const offerTags = await getAllOfferTags()
  const countries = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  // Convert null fields to undefined for compatibility with ProductWithVariantType
  const productWithUndefined = {
    ...product,
    name_fa: product.name_fa ?? undefined,
    description_fa: product.description_fa ?? undefined,
    offerTagId: product.offerTagId ?? undefined,
    // Add similar lines for other possibly-null fields if needed
  }
  console.log({ productWithUndefined })
  return (
    <div className="w-full">
      <ProductForm
        categories={categories.categories}
        storeUrl={storeUrl}
        offerTags={offerTags}
        countries={countries}
        data={product}
      />
    </div>
  )
}
