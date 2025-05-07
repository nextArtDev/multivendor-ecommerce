// Next.js
import { currentUser } from '@/lib/auth'
import { redirect } from '@/navigation'

import { Link } from '@/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

export default async function DashboardPage() {
  // Retrieve the current user information
  const user = await currentUser()

  // If user role is not defined or is "USER", redirect to the home page
  if (!user?.role || user?.role === 'USER') {
    redirect(`/`)
  }

  // If user role is "ADMIN", redirect to the admin dashboard
  if (user?.role === 'ADMIN') {
    // redirect(`/${locale}/dashboard/admin`)
    return (
      <section className="w-full h-full min-h-screen flex flex-col items-center justify-center gap-8">
        <p className="text-2xl text-center">میخواهید وارد کدام دشبورد شوید؟</p>
        <div className="flex flex-row items-center justify-center gap-4">
          <Link
            className={cn(buttonVariants({ variant: 'destructive' }))}
            href={`/dashboard/admin`}
          >
            ADMIN
          </Link>
          <Link
            className={cn(buttonVariants({ variant: 'default' }))}
            href={`/dashboard/seller`}
          >
            SELLER
          </Link>
        </div>
      </section>
    )
  }

  // If user role is "SELLER", redirect to the seller dashboard
  if (user?.role === 'SELLER') {
    redirect(`/dashboard/seller`)
  }
}
