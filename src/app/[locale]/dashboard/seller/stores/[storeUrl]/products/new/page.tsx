import { prisma } from '@/lib/prisma'
import { getAllCategories } from '@/lib/queries/dashboard'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import { notFound } from 'next/navigation'
import ProductForm from '../components/new-product-form'

// import { getAllCategories } from '@/queries/category'
// import { getAllOfferTags } from '@/queries/offer-tag'

export default async function SellerNewProductPage({
  params,
}: // searchParams,
{
  params: Promise<{ storeUrl: string }>
  // searchParams: Promise<{ categoryId: string }>
}) {
  const storeUrl = (await params).storeUrl
  // const categoryId = (await searchParams).categoryId
  const store = await prisma.store.findFirst({ where: { url: storeUrl } })
  if (!store) return notFound()

  // const categories = await getAllCategories(store.id)
  const categories = await getAllCategories({})
  // console.log({ categories })

  const offerTags = await getAllOfferTags()
  const countries = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })
  const provinces = await prisma.province.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="w-full">
      <ProductForm
        categories={categories.categories}
        storeUrl={storeUrl}
        offerTags={offerTags}
        countries={countries}
        provinces={provinces}
      />
    </div>
  )
}
