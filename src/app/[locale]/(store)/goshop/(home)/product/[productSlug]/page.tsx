// DB
// import StoreCard from '@/components/store/cards/store-card'
// import CategoriesHeader from '@/components/store/layout/categories-header/categories-header'
// import Header from '@/components/store/layout/header/header'
// import ProductPageContainer from '@/components/store/product-page/container'
// import ProductDescription from '@/components/store/product-page/product-description'
// import ProductQuestions from '@/components/store/product-page/product-questions'
// import ProductSpecs from '@/components/store/product-page/product-specs'
// import RelatedProducts from '@/components/store/product-page/related-product'
// import ProductReviews from '@/components/store/product-page/reviews/product-reviews'
// import StoreProducts from '@/components/store/product-page/store-products'
// import { Country } from '@/lib/types'
// import { retrieveProductDetailsOptimized } from '@/queries/product-optimized'
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

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ productSlug: string }>
  searchParams: Promise<{ variant: string }>
}) {
  const productSlug = (await params).productSlug
  const searchParamsVariant = (await searchParams).variant
  const data = await retrieveProductDetailsOptimized(productSlug)
  // console.log({ data })
  const variant = data.variants.find((v) => v.slug === searchParamsVariant)
  // console.log({ data })
  const specs = {
    product: data.specs,
    variant: variant?.specs,
  }

  // Get cookies from the store
  const cookieStore = await cookies()
  const userCountryCookie = cookieStore.get('userCountry')
  // console.log({ userCountryCookie })
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

  const storeData = {
    id: data.store.id,
    name: data.store.name,
    url: data.store.url,
    logo: data.store.logo?.url,
    followersCount: 0,
    isUserFollowingStore: false,
  }

  return (
    <div>
      <Header />
      <CategoriesHeader />
      <div className="p-4 2xl:px-28 overflow-x-hidden mx-auto">
        <ProductPageContainer
          productData={data}
          variantSlug={searchParamsVariant}
          userCountry={userCountry}
        >
          <>
            <Separator />
            {/* Related products */}
            <RelatedProducts
              productId={data.id}
              categoryId={data.categoryId}
              subCategoryId={data.subCategoryId}
            />
          </>
          {/* Product reviews */}
          {/* <Separator className="mt-6" />
          <ProductReviews
            productId={data.id}
            rating={data.rating}
            variantsInfo={data.variants}
            numReviews={data._count.reviews}
          />
          <>
            <Separator className="mt-6" /> */}
          {/* Product description */}
          <ProductDescription
            text={[data.description, variant?.variantDescription || '']}
          />
          {/* </> */}
          <Separator className="mt-6" />
          {(specs.product || specs.variant) && <ProductSpecs specs={specs} />}
          <Separator className="mt-6" />
          {data.questions && <ProductQuestions questions={data.questions} />}
          <Separator className="mt-6" />
          <StoreCard store={storeData} />
          {/*
           */}
          <div className="h-6"></div>
          <StoreProducts
            storeUrl={data.store.url}
            storeName={data.store.name}
            count={5}
          />
          {/*    </div> */}
        </ProductPageContainer>
      </div>
    </div>
  )
}
