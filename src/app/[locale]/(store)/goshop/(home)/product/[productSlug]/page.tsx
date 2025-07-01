import { retrieveProductDetailsOptimized } from '@/components/amazon/lib/queries/product'
import { Separator } from '@/components/ui/separator'
import { cookies } from 'next/headers'
import { Country } from '../../../components/country-lang-curr-selector'
import ProductPageContainer from '../../../components/product/product-page-container'
import Header from '../../../components/header/header'
import CategoriesHeader from '../../../components/categories-header'
import RelatedProducts from '../../../components/product/related-product'
import ProductDescription from '../../../components/product/product-description'
import ProductSpecs from '../../../components/product/product-specs'
import ProductQuestions from '../../../components/product/product-questions'
import StoreCard from '../../../components/store/store-card'
import StoreProducts from '../../../components/product/store-products'
import ProductReviews from '../../../components/reviews/product-reviews'
import { Rating } from '@/components/shared/rating'
import { redirect } from '@/navigation'
import { getProductFilteredReviews } from '../../../lib/queries/review'
import { getRelatedProducts } from '../../../lib/queries/product'
import { Suspense } from 'react'
import RelatedProductSkeleton from '../../../components/skeleton/related-products-skeleton'

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string }>
  searchParams: Promise<{
    variant: string
    sizeId: string
    sort: string
    hasImages: string
    page: string
    rating: string
  }>
}) {
  const productSlug = (await params).productSlug
  const searchParamsVariant = (await searchParams).variant
  const searchParamsSizeId = (await searchParams).sizeId

  const data = await retrieveProductDetailsOptimized(productSlug)
  // console.log('data?.variants?.[0]', data?.variants?.[0])
  const variant =
    data?.variants.find((v) => v.slug === searchParamsVariant) ||
    data?.variants?.[0]

  // const sizeId =
  //   data?.variants.find(
  //     (v) =>
  //       v.sizes.map((s) => s.id === searchParamsSizeId)
  //   ) || data?.variants?.[0]
  const sizeId =
    variant.sizes.find((s) => s.id === searchParamsSizeId)?.id ||
    variant.sizes?.[0].id ||
    searchParamsSizeId

  // console.log('vslug', variant.slug)
  const specs = {
    product: data.specs,
    variant: variant?.specs,
  }
  if (!data) return redirect('/goshop')

  // Get cookies from the store
  const cookieStore = await cookies()
  const userCountryCookie = cookieStore.get('userCountry')
  const userProvinceCookie = cookieStore.get('userProvince')
  // Set default country if cookie is missing
  let userCountry: Country = {
    name: 'United States',
    city: '',
    code: 'US',
    region: '',
  }

  // If cookie exists, update the user country
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country
  }
  // let userProvince = {
  //   // name: 'United States',
  //   // city: '',
  //   // code: 'US',
  //   // region: '',

  // }
  let userProvince = `117-1078`

  // If cookie exists, update the user country
  if (userProvinceCookie) {
    userProvince = JSON.parse(userProvinceCookie.value)
  }
  // console.log(userProvinceCookie, userProvince)

  const storeData = {
    id: data.store.id,
    name: data.store.name,
    url: data.store.url,
    logo: data.store.logo?.url,
    followersCount: 0,
    isUserFollowingStore: false,
  }

  //--> Review fetching
  const sorter =
    ((await searchParams).sort as 'latest' | 'oldest' | 'highest') || undefined
  const hasImages = (await searchParams).hasImages === 'true'
  const page = Number((await searchParams).page) || 1
  const FilterRating = Number((await searchParams).rating) || undefined
  const pageSize = 4 // Ensure this matches your client component's default

  const filters = {
    rating: FilterRating,
    hasImages: hasImages,
  }
  const sort = sorter ? { orderBy: sorter } : undefined

  const filteredReviewsData = await getProductFilteredReviews(
    data.id,
    filters,
    sort,
    Number(page),
    pageSize
  )
  // --> End of   // Review fetching

  // --> Fetching Related Products
  const relatedProducts = await getRelatedProducts(
    data.id,
    data.categoryId,
    data.subCategoryId
  )
  //End of Fetching related products
  return (
    <div>
      <Header />
      <CategoriesHeader />
      <div className="p-4 2xl:px-28 overflow-x-hidden mx-auto">
        <ProductPageContainer
          productData={data}
          variantSlug={variant.slug}
          // sizeId={searchParamsSizeId || variant.sizes?.[0].id}
          sizeId={sizeId}
          userCountry={userCountry}
          userProvince={userProvince}
        >
          <Separator />
          {!!relatedProducts && (
            <Suspense fallback={<RelatedProductSkeleton />}>
              <RelatedProducts
                products={relatedProducts}
                productId={data.id}
                categoryId={data.categoryId}
                subCategoryId={data.subCategoryId}
              />
            </Suspense>
          )}
          <Separator className="mt-6" />
          {!!data._count.reviews && !!filteredReviewsData && (
            <ProductReviews
              hasImages={hasImages}
              page={page}
              FilterRating={FilterRating}
              pageSize={pageSize}
              data={filteredReviewsData}
              product={data}
              rating={data.rating}
              variant={data.variants}
              numReviews={data._count.reviews}
            />
          )}

          <Separator className="mt-6" />

          <ProductDescription
            text={[data.description, variant?.variantDescription || '']}
          />

          <Separator className="mt-6" />
          {(specs.product || specs.variant) && <ProductSpecs specs={specs} />}
          <Separator className="mt-6" />
          {data.questions && <ProductQuestions questions={data.questions} />}
          <Separator className="mt-6" />
          <StoreCard store={storeData} />

          <div className="h-6"></div>
          <StoreProducts
            storeUrl={data.store.url}
            storeName={data.store.name}
            count={5}
          />
        </ProductPageContainer>
      </div>
    </div>
  )
}
