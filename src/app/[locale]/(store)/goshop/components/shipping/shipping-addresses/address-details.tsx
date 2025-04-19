'use client'

// React
import { Dispatch, FC, SetStateAction, useEffect, useState } from 'react'

// Prisma model
import { Country } from '@prisma/client'

// Form handling utilities
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Types, Schema

// UI Components
import CountrySelector, {
  SelectMenuOption,
} from '@/components/shared/country-selector'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Queries

// Utils
import { v4 } from 'uuid'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { UserShippingAddressType } from '../../../types'
import { ShippingAddressSchema } from '../../../lib/schemas/shipping'
import { upsertShippingAddress } from '../../../lib/actions/user'
import ProvinceCity from '@/components/shared/province-city'
import { useQuery } from '@tanstack/react-query'
import { getAllProvinces } from '../../../lib/queries/address'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddressDetailsProps {
  data?: UserShippingAddressType
  countries: Country[]
  setShow: Dispatch<SetStateAction<boolean>>
}

const AddressDetails: FC<AddressDetailsProps> = ({
  data,
  countries,
  setShow,
}) => {
  const router = useRouter() // Hook for routing
  const provinces = useQuery({
    queryKey: ['provinces'],
    queryFn: getAllProvinces,
  })

  // // State for country selector
  // const [isOpen, setIsOpen] = useState<boolean>(false)

  // // State for selected country
  // const [country, setCountry] = useState<string>('Afghanistan')

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof ShippingAddressSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(ShippingAddressSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      firstName: data?.firstName,
      lastName: data?.lastName,
      address1: data?.address1,
      address2: data?.address2 || '',
      countryId: data?.countryId,
      phone: data?.phone,
      cityId: data?.city.id.toString(),
      provinceId: data?.province.id.toString(),
      // state: data?.state,
      zip_code: data?.zip_code,
      default: data?.default,
    },
  })

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        cityId: data.city.id.toString(),
        provinceId: data.province.id.toString(),
        address2: data.address2 || '',
      })
      // handleCountryChange(data?.country.name)
    }
  }, [data, form])

  // Submit handler for form submission
  const handleSubmit = async (
    values: z.infer<typeof ShippingAddressSchema>
  ) => {
    console.log({ values })
    try {
      // Upserting category data
      const response = await upsertShippingAddress({
        id: data?.id ? data.id : v4(),
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address1: values.address1,
        address2: values.address2 || '',
        cityId: +values.cityId,
        provinceId: +values.provinceId,

        countryId: values.countryId,

        // state: values.state,
        default: values.default,
        zip_code: values.zip_code,
        userId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Displaying success message
      toast.success(
        data?.id
          ? 'Shipping address has been updated.'
          : `Congratulations! Shipping address is now created.`
      )

      // Refresh data
      router.refresh()
      setShow(false)
    } catch (error) {
      // Handling form submission errors
      toast.error(error.toString())
    }
  }

  // const handleCountryChange = (name: string) => {
  //   const country = countries.find((c) => c.name === name)
  //   if (country) {
  //     // form.setValue('countryId', country.id)
  //   }
  //   setCountry(name)
  // }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Contact information</FormLabel>
            <div className="flex flex-col md:flex-row gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="First name*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="Last name*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1 md:w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Phone number*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="space-y-2">
            <FormLabel>Address</FormLabel>
            <div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="countryId"
                render={({ field }) => (
                  // <FormItem className="flex-1 md:w-[calc(50%-8px)] !mt-3">
                  //   <FormControl>
                  //     <CountrySelector
                  //       id={'countries'}
                  //       open={isOpen}
                  //       onToggle={() => setIsOpen((prev) => !prev)}
                  //       onChange={(val) => handleCountryChange(val)}
                  //       selectedValue={
                  //         (countries?.find(
                  //           (c) => c.name === country
                  //         ) as SelectMenuOption) || countries[0]
                  //       }
                  //     />
                  //   </FormControl>
                  //   <FormMessage />
                  // </FormItem>
                  <FormItem className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            defaultValue={field.value?.[0]}
                            placeholder="Select a Country"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem
                            key={country.id}
                            value={String(country.id)}
                          >
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="!mt-3 flex flex-col gap-3">
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Street, house/apartment/unit*"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="Apt, suite, unit, etc (optional）"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="!mt-3 flex items-center justify-between gap-3">
              {/* <FormField
                disabled={isLoading}
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="State*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder="City*" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} 
              /> */}
              <ProvinceCity provinces={provinces.data || []} />
            </div>
            <FormField
              disabled={isLoading}
              control={form.control}
              name="zip_code"
              render={({ field }) => (
                <FormItem className="flex-1 w-[calc(50%-8px)] !mt-3">
                  <FormControl>
                    <Input placeholder="Zip code*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="rounded-md">
            {isLoading
              ? 'loading...'
              : data?.id
              ? 'Save address information'
              : 'Create address'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default AddressDetails
