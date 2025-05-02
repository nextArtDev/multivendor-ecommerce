import WishlistContainer from '../../../../components/profile/wishlist/container'
import { getUserWishlist } from '../../../../lib/queries/profile'

export default async function ProfileWishlistPage({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const page = +(await params).page

  const wishlist_data = await getUserWishlist(page)
  const { wishlist, totalPages } = wishlist_data
  return (
    <div className="  py-4 px-6">
      <h1 className="text-lg mb-3 font-bold">Your Wishlist</h1>
      {wishlist.length > 0 ? (
        <WishlistContainer
          products={wishlist}
          page={page}
          totalPages={totalPages}
        />
      ) : (
        <div>No products</div>
      )}
    </div>
  )
}
