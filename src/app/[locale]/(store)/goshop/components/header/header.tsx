import { Link } from '@/navigation'
import React from 'react'
import UserMenu from '../user-menu'
import Cart from '../cart'
import Search from '../search/search'
import CountryLanguageCurrencySelector from '../country-lang-curr-selector'
import { cookies } from 'next/headers'
import { Province } from '@prisma/client'
import ProvinceLanguageCurrencySelector from '../province-lang-curr-selector'

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

  const userProvinceCookie = cookieStore.get('userProvince')
  let userProvince: Partial<Province> = {
    name: 'اصفهان',
    // province: '',
    id: 3,
    // region: '',
  }
  if (userProvinceCookie) {
    userProvince = JSON.parse(userProvinceCookie.value) as Partial<Province>
  }

  return (
    <div className="bg-gradient-to-r dark:from-slate-500 dark:to-slate-800  from-slate-600  to-slate-200">
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
          <ProvinceLanguageCurrencySelector userProvince={userProvince} />
          <UserMenu />
          <Cart />
        </div>
      </div>
    </div>
  )
}

export default Header
