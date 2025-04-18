import { currentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { cookies } from 'next/headers'
import { redirect } from '@/navigation'
import Header, { Country } from '../components/header/header'
import CheckoutContainer from '../components/chekout/container'
import { getUserShippingAddresses } from '../lib/queries/user'

export default async function CheckoutPage() {
  const user = await currentUser()
  if (!user) redirect('/goshop/cart')

  // Get user cart
  const cart = await prisma.cart.findFirst({
    where: {
      userId: user?.id,
    },
    include: {
      cartItems: true,
      coupon: {
        include: {
          store: true,
        },
      },
    },
  })

  if (!cart) redirect('/goshop/cart')

  // Get user shipping address
  const addresses = await getUserShippingAddresses()

  // Get list of countries
  const countries = await prisma.country.findMany({
    orderBy: { name: 'desc' },
  })

  // Get cookies from the store
  const cookieStore = await cookies()
  const userCountryCookie = cookieStore.get('userCountry')

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

  return (
    <>
      <Header />
      <div className="bg-[#f4f4f4] min-h-[calc(100vh-65px)]">
        <div className="max-w-container mx-auto py-4 px-2 ">
          <CheckoutContainer
            cart={cart}
            countries={countries}
            addresses={addresses}
            // addresses={[]}
            userCountry={userCountry}
          />
        </div>
      </div>
    </>
  )
}
