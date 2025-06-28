'use client'
import { useQueries } from '@tanstack/react-query'
import { FC } from 'react'
import { useFormContext } from 'react-hook-form'
import InputFieldset from '../dashboard/input-fieldset'
import { FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Province } from '@prisma/client'
import {
  getCityById,
  getCityByProvinceId,
  getProvinceById,
} from '@/lib/actions/province'
import { getDistance, isPointWithinRadius } from 'geolib'
import { cn } from '@/lib/utils'

interface ProvinceCityProps {
  isPending?: boolean
  provinceLabel?: string
  // provinceName: string
  // cityName: string
  // cityLabel?: string
  provinces: Province[]
  className?: string
  initialData?: string
}

const ProvinceCity: FC<ProvinceCityProps> = ({
  isPending = false,
  provinceLabel,
  provinces,
  initialData,
  // provinceName,
  // cityName,
  className,
}) => {
  // online :https://iran-locations-api.ir/api/v1/fa/states

  const [initialProvince, initialCity] = initialData?.split('-')

  const form = useFormContext()
  // if (initialData) {
  //   const [{ data: initialProvince }, { data: initialCity }] = useQueries({
  //     queries: [
  //       {
  //         queryKey: ['initialProvince'],
  //         queryFn: () => getProvinceById(initialData[0]),
  //         // staleTime: Infinity,
  //       },
  //       {
  //         queryKey: ['initialCityById'],
  //         queryFn: () => getCityById(initialData[1], initialData[0]),
  //         // staleTime: Infinity,
  //       },
  //     ],
  //   })
  // }
  const [{ data: cities, isPending: isPendingProvince }, { data: city }] =
    useQueries({
      queries: [
        {
          queryKey: ['cityByProvince', form.watch().provinceId],
          queryFn: () => getCityByProvinceId(form.watch().provinceId),
          // staleTime: Infinity,
        },
        {
          queryKey: ['cityById', form.watch().cityId],
          queryFn: () => getCityById(initialCity || form.watch().cityId),
          // staleTime: Infinity,
        },
      ],
    })

  // console.log({ cities })
  // console.log({ city })
  const distance = getDistance(
    {
      latitude: '32.390',

      longitude: '51.400',
    },
    {
      latitude: `${city?.latitude}`,
      longitude: `${city?.longitude}`,
    }
  )
  const isThePointWithinRadius = isPointWithinRadius(
    {
      latitude: '32.390',

      longitude: '51.400',
    },
    {
      latitude: `${city?.latitude}`,
      longitude: `${city?.longitude}`,
    },
    500000
  )
  // console.log(city?.name)
  // console.log({ distance })
  // console.log({ isThePointWithinRadius })

  return (
    <div className={cn('w-full h-full relative', className)}>
      <InputFieldset label={provinceLabel || 'انتخاب شهر'}>
        <div className="flex gap-4">
          <FormField
            disabled={isPending}
            control={form.control}
            name={'provinceId'}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  disabled={
                    isPending || isPendingProvince || provinces?.length == 0
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={initialProvince ? initialProvince : field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        defaultValue={field.value?.[0]}
                        placeholder="Select a Province"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces?.map((province) => (
                      <SelectItem key={province.id} value={String(province.id)}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            disabled={isPending}
            control={form.control}
            name={'cityId'}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  disabled={
                    // isPending ||
                    isPendingProvince ||
                    provinces.length == 0 ||
                    !form.getValues().provinceId
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={initialCity ? initialCity : field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        defaultValue={field.value?.[0]}
                        placeholder="Select a City"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cities?.map((city) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </InputFieldset>
    </div>
  )
}

export default ProvinceCity
