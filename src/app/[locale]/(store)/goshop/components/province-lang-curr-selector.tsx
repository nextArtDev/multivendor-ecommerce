'use client'

// React, Next.js
import { useState } from 'react'
import countries from '@/constants/countries.json'
import cities from '@/constants/cities.json'
// Icons
// import '/node_modules/flag-icons/css/flag-icons.min.css'
import { ChevronDown } from 'lucide-react'

// Province selector
import ProvinceSelector, {
  SelectCityMenuOption,
} from '@/components/shared/city-selector'

import { useRouter } from 'next/navigation'
import { SelectMenuOption } from '../../../../../components/shared/country-selector'
import { Province } from '@prisma/client'
import SelectProvinceForm from '@/components/shared/select-province-form'

export default function ProvinceLanguageCurrencySelector({
  userProvince,
}: {
  userProvince: Partial<Province>
}) {
  // Router hook for navigation
  const router = useRouter()

  // State to manage countries dropdown visibility
  const [show, setshow] = useState(false)

  const handleProvinceClick = async (province: string) => {
    // Find the province data based on the selected province name
    // const provinceData = countries.find((c) => c.name === province)
    const provinceData = cities.find((c) => c.name === province)

    if (provinceData) {
      const data: Partial<Province> = {
        name: provinceData.name,
        // code: provinceData.id.toString(),
        id: provinceData.id,

        // region: '',
      }
      try {
        // Send a POST request to your API endpoint to set the cookie
        const response = await fetch('/api/setUserProvinceInCookies', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ userProvince: data }),
        })
        if (response.ok) {
          router.refresh()
        }
      } catch (error) {}
    }
  }

  return (
    <div className="relative inline-block group">
      {/* Trigger */}
      <div>
        <div className="flex items-center h-11 py-0 px-2 cursor-pointer">
          {/* <span className="mr-0.5  h-[33px] grid place-items-center">
            <span className={`fi fi-${userProvince.id}`} />
          </span> */}
          <div className="ml-1">
            <span className="block text-xs leading-3 mt-2">
              {/* {userProvince.name}/EN/ */}
              {userProvince.name}
            </span>
            <b className="text-xs font-bold ">
              USD
              <span className="scale-[60%] align-middle inline-block">
                <ChevronDown />
              </span>
            </b>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="absolute hidden top-0 group-hover:block cursor-pointer">
        <div className="relative mt-12 -ml-32 w-[300px] bg-foreground/30 backdrop-blur-sm  rounded-[24px] pt-2 px-6 pb-6 z-50 shadow-lg">
          {/* Triangle */}
          <div className="w-0 h-0 absolute -top-1.5  right-24 !border-l-[10px] !border-l-transparent !border-r-[10px] !border-r-transparent !border-b-[10px] border-b-foreground/20 backdrop-blur-sm" />

          <div className="mt-4 leading-6 text-[20px] font-bold">Ship to</div>
          <div className="mt-2">
            <div className="relative rounded-lg">
              {/* <ProvinceSelector
                id={'cities'}
                open={show}
                onToggle={() => setshow(!show)}
                onChange={(val) => handleProvinceClick(val)}
                selectedValue={
                  (cities.find(
                    (option) => option.name === userProvince?.name
                  ) as SelectCityMenuOption) || cities[0]
                }
              /> */}
              <SelectProvinceForm />
              <div>
                <div className="mt-4 leading-6 text-[20px] font-bold">
                  Language
                </div>
                <div className="relative mt-2.5 h-10 py-0 px-3 border-[1px] border-black/20 rounded-lg  flex items-center cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap">
                  <div className="align-middle">English</div>
                  <span className="absolute right-2">
                    <ChevronDown className="text-main-primary scale-75" />
                  </span>
                </div>
              </div>
              <div>
                <div className="mt-4 leading-6 text-[20px] font-bold">
                  Currency
                </div>
                <div className="relative mt-2 h-10 py-0 px-3 border-[1px] border-black/20 rounded-lg  flex items-center cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap">
                  <div className="align-middle">USD (US Dollar)</div>
                  <span className="absolute right-2">
                    <ChevronDown className="text-main-primary scale-75" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
