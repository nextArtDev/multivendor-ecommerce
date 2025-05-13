import { getAllCategories } from '@/lib/queries/dashboard'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import CategoriesHeaderContainer from './categories-header-container'

export default async function CategoriesHeader() {
  // Fetch all categories
  const categories = await getAllCategories({})

  // Fetch all offer tags
  const offerTags = await getAllOfferTags()
  return (
    <div className="w-full pt-2 pb-3 px-0 bg-gradient-to-r from-slate-500 to-slate-800">
      <CategoriesHeaderContainer
        categories={categories.categories}
        offerTags={offerTags}
      />
    </div>
  )
}
