import Header, { Country } from '../../components/header/header'
import CartContainer from '../../components/cart/container'
import { cookies } from 'next/headers'

export default async function CartPage() {
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
  // console.log({ userCountry })
  return (
    <>
      <Header />
      <CartContainer userCountry={userCountry} />
    </>
  )
}
