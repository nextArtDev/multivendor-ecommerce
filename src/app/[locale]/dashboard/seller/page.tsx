// Next.js
import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from '@/navigation'

export default async function SellerDashboardPage() {
  // Fetch the current user. If the user is not authenticated, redirect them to the home page.
  const user = await currentUser()
  if (!user) {
    redirect('/')
    return // Ensure no further code is executed after redirect
  }

  // Retrieve the list of stores associated with the authenticated user.
  // const stores = await prisma.store.findMany({
  //   where: {
  //     userId: user.id,
  //   },
  // });

  // // If the user has no stores, redirect them to the page for creating a new store.
  // if (stores.length === 0) {
  //   redirect("/dashboard/seller/stores/new");
  //   return; // Ensure no further code is executed after redirect
  // }

  // // If the user has stores, redirect them to the dashboard of their first store.
  // redirect(`/dashboard/seller/stores/${stores[0].url}`);

  return <div>Seller Dashboard</div>
}
