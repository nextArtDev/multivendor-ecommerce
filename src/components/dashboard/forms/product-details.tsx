'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import InputFileUpload from '@/components/shared/InputFileUpload'

import { Switch } from '@/components/ui/switch'
import { ProductFormSchema } from '@/lib/schemas/dashboard'
import { usePathname } from '@/navigation'
import { FC, useEffect, useTransition } from 'react'
import {
  Color,
  Image,
  Product,
  ProductVariant,
  Size,
  Spec,
} from '@prisma/client'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createProduct, editProduct } from '@/lib/actions/dashboard/product'
import { Textarea } from '@/components/ui/textarea'

interface ProductDetailProps {
  initialData?: Product & {
    variants: (ProductVariant & { images: Image[] } & { sizes: Size[] } & {
      colors: Color[]
    })[]
  } & { category: { id: string } } & { store: { id: string } } & {
    cover: Image[] | null
  }
}

const ProductDetails: FC<ProductDetailProps> = ({ initialData }) => {
  // console.log(initialData.cover.flatMap((cover) => cover.url))
  // console.log(initialData.logo.url)

  const path = usePathname()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: initialData?.name,
      name_fa: initialData?.name_fa || '',
      description: initialData?.description,
      description_fa: initialData?.description_fa || '',
      variantName: initialData?.variants.variantName,
      variantDescription: initialData?.variantDescription,
      categoryId: initialData?.categoryId,
      offerTagId: initialData?.offerTagId || undefined,
      subCategoryId: initialData?.subCategoryId,
      brand: initialData?.brand,
      sku: initialData?.sku,
      colors: initialData?.colors,
      sizes: initialData?.sizes,
      product_specs: initialData?.product_specs,
      variant_specs: initialData?.variant_specs,
      keywords: initialData?.keywords,
      questions: initialData?.questions,
      isSale: initialData?.isSale || false,
      weight: initialData?.weight,
      freeShippingForAllCountries: initialData?.freeShippingForAllCountries,
      freeShippingCountriesIds: initialData?.freeShippingCountriesIds || [],
      shippingFeeMethod: initialData?.shippingFeeMethod,
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name,
        name_fa: initialData?.name_fa || '',
        description: initialData?.description,
        description_fa: initialData?.description_fa || '',
        variantName: initialData?.variantName,
        variantDescription: initialData?.variantDescription,
        categoryId: initialData?.categoryId,
        offerTagId: initialData?.offerTagId,
        subCategoryId: initialData?.subCategoryId,
        brand: initialData?.brand,
        sku: initialData?.sku,
        colors: initialData?.colors,
        sizes: initialData?.sizes,
        product_specs: initialData?.product_specs,
        variant_specs: initialData?.variant_specs,
        keywords: initialData?.keywords,
        questions: initialData?.questions,
        isSale: initialData?.isSale || false,
        weight: initialData?.weight,
        freeShippingForAllCountries: initialData?.freeShippingForAllCountries,
        freeShippingCountriesIds: initialData?.freeShippingCountriesIds || [],
        shippingFeeMethod: initialData?.shippingFeeMethod,
      })
    }
  }, [initialData, form])

  const handleSubmit = async (data: z.infer<typeof ProductFormSchema>) => {
    // console.log({ data })
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('name_fa', data.name_fa || '')
    formData.append('description', data.description)
    formData.append('description_fa', data.description_fa || '')
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('url', data.url)

    if (data.featured) {
      formData.append('featured', 'true')
    } else {
      formData.append('featured', 'false')
    }

    data.logo?.forEach((item) => {
      if (item instanceof File) {
        formData.append('logo', item)
      }
    })

    if (data.cover && data.cover.length > 0) {
      for (let i = 0; i < data.cover.length; i++) {
        formData.append('cover', data.cover[i] as string | Blob)
      }
    }
    try {
      if (initialData) {
        startTransition(async () => {
          try {
            const res = await editProduct(
              formData,
              initialData.id as string,
              path
            )
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.name_fa) {
              form.setError('name_fa', {
                type: 'custom',
                message: res?.errors.name_fa?.join(' و '),
              })
            } else if (res?.errors?.description) {
              form.setError('description', {
                type: 'custom',
                message: res?.errors.description?.join(' و '),
              })
            } else if (res?.errors?.description_fa) {
              form.setError('description_fa', {
                type: 'custom',
                message: res?.errors.description_fa?.join(' و '),
              })
            } else if (res?.errors?.email) {
              form.setError('email', {
                type: 'custom',
                message: res?.errors.email?.join(' و '),
              })
            } else if (res?.errors?.phone) {
              form.setError('phone', {
                type: 'custom',
                message: res?.errors.phone?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
              })
            } else if (res?.errors?.status) {
              form.setError('status', {
                type: 'custom',
                message: res?.errors.status?.join(' و '),
              })
            } else if (res?.errors?.featured) {
              form.setError('featured', {
                type: 'custom',
                message: res?.errors.featured?.join(' و '),
              })
            } else if (res?.errors?.cover) {
              form.setError('cover', {
                type: 'custom',
                message: res?.errors.cover?.join(' و '),
              })
            } else if (res?.errors?.logo) {
              form.setError('logo', {
                type: 'custom',
                message: res?.errors.logo?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
            }
          } catch (error) {
            // This will catch the NEXT_REDIRECT error, which is expected
            // when the redirect happens
            if (
              !(
                error instanceof Error &&
                error.message.includes('NEXT_REDIRECT')
              )
            ) {
              toast.error('مشکلی پیش آمده.')
            }
          }
        })
      } else {
        startTransition(async () => {
          try {
            const res = await createProduct(formData, path)
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.name_fa) {
              form.setError('name_fa', {
                type: 'custom',
                message: res?.errors.name_fa?.join(' و '),
              })
            } else if (res?.errors?.description) {
              form.setError('description', {
                type: 'custom',
                message: res?.errors.description?.join(' و '),
              })
            } else if (res?.errors?.description_fa) {
              form.setError('description_fa', {
                type: 'custom',
                message: res?.errors.description_fa?.join(' و '),
              })
            } else if (res?.errors?.email) {
              form.setError('email', {
                type: 'custom',
                message: res?.errors.email?.join(' و '),
              })
            } else if (res?.errors?.phone) {
              form.setError('phone', {
                type: 'custom',
                message: res?.errors.phone?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
              })
            } else if (res?.errors?.status) {
              form.setError('status', {
                type: 'custom',
                message: res?.errors.status?.join(' و '),
              })
            } else if (res?.errors?.featured) {
              form.setError('featured', {
                type: 'custom',
                message: res?.errors.featured?.join(' و '),
              })
            } else if (res?.errors?.cover) {
              form.setError('cover', {
                type: 'custom',
                message: res?.errors.cover?.join(' و '),
              })
            } else if (res?.errors?.logo) {
              form.setError('logo', {
                type: 'custom',
                message: res?.errors.logo?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
            }
          } catch (error) {
            // This will catch the NEXT_REDIRECT error, which is expected when the redirect happens
            if (
              !(
                error instanceof Error &&
                error.message.includes('NEXT_REDIRECT')
              )
            ) {
              toast.error('مشکلی پیش آمده.')
            }
          }
        })
      }
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>
            {initialData?.id
              ? `Update ${initialData?.name} product information.`
              : ' Lets create a product. You can edit product later from the Products table or the product page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <div className="grid grid-cols-12 ">
                <div className="col-span-11">
                  <InputFileUpload
                    className="w-full"
                    initialDataImages={initialData?.cover || []}
                    name="cover"
                    label="Cover"
                  />
                </div>
                <div className="col-span-1 mt-[80%] -ml-24 z-10">
                  <InputFileUpload
                    initialDataImages={
                      initialData?.logo ? [initialData.logo] : null
                    }
                    name="logo"
                    label="Logo"
                    multiple={false}
                    className="w-24 h-24"
                  />
                </div>
              </div>

              <div className="flex  flex-col md:flex-row justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name_fa"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Farsi Name</FormLabel>
                      <FormControl>
                        <Input placeholder="" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description_fa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farsi Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel>Mobile Phone</FormLabel>
                    <FormControl className="w-full">
                      <PhoneInput
                        placeholder="09121111111"
                        {...field}
                        defaultCountry="IR"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@gmail.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/product-url" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : initialData?.id
                  ? 'Save product information'
                  : 'Create product'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default ProductDetails
