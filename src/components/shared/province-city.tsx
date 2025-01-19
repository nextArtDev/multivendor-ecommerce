'use client'
import { useQuery } from '@tanstack/react-query'
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
import { getCityByProvinceId } from '@/lib/actions/province'

interface ProvinceCityProps {
  isPending?: boolean
  provinceName: string
  provinceLabel?: string
  cityName: string
  cityLabel?: string
  provinces: Province[]
}

const ProvinceCity: FC<ProvinceCityProps> = ({
  isPending,
  provinces,
  provinceName,
  provinceLabel = provinceName,
  cityName,
}) => {
  const form = useFormContext()

  const { data: cities, isPending: isPendingCategory } = useQuery({
    queryKey: ['city-by-province', form.watch().provinceId],
    queryFn: () => getCityByProvinceId(form.watch().provinceId),
  })

  return (
    <div>
      <InputFieldset label={provinceLabel}>
        <div className="flex gap-4">
          <FormField
            disabled={isPending}
            control={form.control}
            name={provinceName}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  disabled={
                    isPending || isPendingCategory || provinces.length == 0
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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
                    {provinces.map((province) => (
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
            name={cityName}
            render={({ field }) => (
              <FormItem className="flex-1">
                <Select
                  disabled={
                    isPending ||
                    isPendingCategory ||
                    provinces.length == 0 ||
                    !form.getValues().categoryId
                  }
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
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
