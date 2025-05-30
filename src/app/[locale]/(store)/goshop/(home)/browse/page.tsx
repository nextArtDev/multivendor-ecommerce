import ProductFilters from '../../components/browse/filters'
import ProductSort from '../../components/browse/sort'
import Header from '../../components/header/header'
import ProductCard from '../../components/product/product-card'
import { getProducts } from '../../lib/queries/product'
import { FiltersQueryType } from '../../types'

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<FiltersQueryType>
}) {
  const searchPromise = await searchParams
  const {
    category,
    offer,
    search,
    size,
    sort,
    subCategory,
    maxPrice,
    minPrice,
    color,
  } = await searchParams
  const products_data = await getProducts(
    {
      search,
      minPrice: Number(minPrice) || 0,
      maxPrice: Number(maxPrice) || Number.MAX_SAFE_INTEGER,
      category,
      subCategory,
      offer,
      size: Array.isArray(size)
        ? size
        : size
        ? [size] // Convert single size string to array
        : undefined, // If no size, keep it undefined
      color: Array.isArray(color)
        ? color
        : color
        ? [color] // Convert single color string to array
        : undefined, // If no color, keep it undefined
    },
    sort
  )
  const { products } = products_data

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-10">
        <Header />
      </div>

      {/* Filters Sidebar */}
      <div className="fixed top-[124px] lg:top-16 left-2 md:left-4 pt-4 h-[calc(100vh-64px)] overflow-auto scrollbar">
        <ProductFilters queries={searchPromise} />
      </div>
      {/* Main Content */}
      <div className="ml-[190px] md:ml-[220px] pt-[140px] lg:pt-20">
        {/* Sort Section */}
        <div className="sticky top-[64px] z-10 px-4 py-2 flex items-center">
          <ProductSort />
        </div>

        {/* Product List */}
        <div className="mt-4 px-4  w-full overflow-y-auto max-h-[calc(100vh-155px)] pb-28 scrollbar flex flex-wrap gap-4">
          {products.map((product) => (
            <ProductCard key={product.id + product.slug} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
