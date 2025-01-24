import { Link } from '@/navigation'
import React from 'react'
import UserMenu from '../user-menu'
import Cart from '../cart'
import Search from '../search/search'
import CountryLanguageCurrencySelector from '../country-lang-curr-selector'
import { cookies } from 'next/headers'

export interface Country {
  name: string
  code: string
  city: string
  region: string
}

const Header = async () => {
  const cookieStore = await cookies()
  const userCountryCookie = cookieStore.get('userCountry')
  let userCountry: Country = {
    name: 'United States',
    city: '',
    code: 'US',
    region: '',
  }
  if (userCountryCookie) {
    userCountry = JSON.parse(userCountryCookie.value) as Country
  }

  return (
    <div className="bg-gradient-to-r from-slate-500 to-slate-800">
      <div className="h-full w-full lg:flex  px-4 lg:px-12">
        <div className="flex lg:w-full lg:flex-1 flex-col lg:flex-row gap-3 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="font-extrabold text-3xl font-mono">GoShop</h1>
            </Link>
            <div className="flex lg:hidden">
              <UserMenu />
              <Cart />
            </div>
          </div>
          <Search />
        </div>
        <div className="hidden lg:flex w-full lg:w-fit lg:mt-2 justify-end mt-1.5 pl-6">
          <div className="lg:flex">{/* <DownloadApp /> */}</div>
          {/* <CountryLanguageCurrencySelector userCountry={userCountry} /> */}
          <CountryLanguageCurrencySelector userCountry={userCountry} />
          <UserMenu />
          <Cart />
        </div>
      </div>
    </div>
  )
}

export default Header
