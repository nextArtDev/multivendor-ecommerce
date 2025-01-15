import ProductDetails from '@/components/dashboard/forms/product-details'
import { prisma } from '@/lib/prisma'
import {
  getAllCategories,
  getAllCategoriesForCategory,
} from '@/lib/queries/dashboard'

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
  const categories = await getAllCategories()
  // let subCategories
  // if (categoryId) {
  //   subCategories = await getAllCategoriesForCategory(categoryId)
  //   console.log({ subCategories })
  // }
  // const offerTags = await getAllOfferTags()
  const countries = await prisma.country.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return (
    <div className="w-full">
      <ProductDetails
        categories={categories}
        storeUrl={storeUrl}
        // offerTags={offerTags}
        countries={countries}
        // subCategories={subCategories}
      />
    </div>
  )
}
