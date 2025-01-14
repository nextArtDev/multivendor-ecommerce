'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button, buttonVariants } from '@/components/ui/button'
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
import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  Category,
  Color,
  Country,
  Image,
  OfferTag,
  Product,
  ProductVariant,
  Size,
  Spec,
  SubCategory,
} from '@prisma/client'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ProductWithVariantType } from '@/lib/types'
import { getAllCategoriesForCategory } from '@/lib/queries/dashboard'
import { format } from 'date-fns'
import { createProduct, editProduct } from '@/lib/actions/dashboard/products'
import { cn } from '@/lib/utils'
import ImagesPreviewGrid from '../images-preview-grid'
import { useTheme } from 'next-themes'
import { ImageInput } from '../image-input2'
import ClickToAddInputs from '../click-to-add'
interface ProductDetailProps {
  // data?: Product & {
  //   variants: (ProductVariant & { images: Image[] } & { sizes: Size[] } & {
  //     colors: Color[]
  //   })[]
  // } & { category: { id: string } } & { store: { id: string } } & {
  //   cover: Image[] | null
  // }
  data?: ProductWithVariantType
  categories: Category[]
  storeUrl: string
  offerTags: OfferTag[]
  countries: Country[]
}

const ProductDetails: FC<ProductDetailProps> = ({
  data,
  categories,
  offerTags,
  storeUrl,
  countries,
}) => {
  // console.log(data.cover.flatMap((cover) => cover.url))
  // console.log(data.logo.url)

  const path = usePathname()
  const [files, setFiles] = useState<File[]>([])
  const [isPending, startTransition] = useTransition()
  // Is new variant page
  const isNewVariantPage = data?.productId && !data?.variantId

  // Jodit editor refs
  const productDescEditor = useRef(null)
  const variantDescEditor = useRef(null)

  // Jodit configuration
  const { theme } = useTheme()

  const config = useMemo(
    () => ({
      theme: theme === 'dark' ? 'dark' : 'default',
    }),
    [theme]
  )

  // State for subCategories
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])

  // State for colors
  const [colors, setColors] = useState<{ color: string }[]>(
    data?.colors || [{ color: '' }]
  )

  // Temporary state for images
  // const [images, setImages] = useState<{ url: string }[]>([])

  // State for sizes
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >(data?.sizes || [{ size: '', quantity: 1, price: 0.01, discount: 0 }])

  // State for product specs
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(data?.product_specs || [{ name: '', value: '' }])

  // State for product variant specs
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(data?.variant_specs || [{ name: '', value: '' }])

  // State for product variant specs
  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(data?.questions || [{ question: '', answer: '' }])

  const form = useForm<z.infer<typeof ProductFormSchema>>({
    resolver: zodResolver(ProductFormSchema),
    defaultValues: {
      name: data?.name,
      name_fa: data?.name_fa || '',
      description: data?.description,
      description_fa: data?.description_fa || '',
      variantName: data?.variantName,
      variantDescription: data?.variantDescription,
      variantName_fa: data?.variantName_fa,
      variantDescription_fa: data?.variantDescription_fa,
      images: data?.images || [],
      variantImage: data?.variantImage
        ? data.variantImage.map((variantImg) => ({ url: variantImg.url }))
        : [],
      categoryId: data?.categoryId,
      offerTagId: data?.offerTagId || undefined,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: data?.sku,
      colors: data?.colors,
      sizes: data?.sizes,
      product_specs: data?.product_specs,
      variant_specs: data?.variant_specs,
      keywords: data?.keywords,
      keywords_fa: data?.keywords_fa,
      questions: data?.questions,
      isSale: data?.isSale || false,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      freeShippingForAllCountries: data?.freeShippingForAllCountries,
      freeShippingCountriesIds: data?.freeShippingCountriesIds || [],
      // shippingFeeMethod: data?.shippingFeeMethod,
    },
  })
  const saleEndDate = form.getValues().saleEndDate || new Date().toISOString()

  const formattedDate = new Date(saleEndDate).toLocaleString('en-Us', {
    weekday: 'short', // Abbreviated day name (e.g., "Mon")
    month: 'long', // Abbreviated month name (e.g., "Nov")
    day: '2-digit', // Two-digit day (e.g., "25")
    year: 'numeric', // Full year (e.g., "2024")
    hour: '2-digit', // Two-digit hour (e.g., "02")
    minute: '2-digit', // Two-digit minute (e.g., "30")
    second: '2-digit', // Two-digit second (optional)
    hour12: false, // 12-hour format (change to false for 24-hour format)
  })

  // UseEffect to get subCategories when user pick/change a category
  useEffect(() => {
    const getSubCategories = async () => {
      const res = await getAllCategoriesForCategory(form.watch().categoryId)
      setSubCategories(res)
    }
    getSubCategories()
  }, [form.watch().categoryId])

  // Extract errors state from form
  const errors = form.formState.errors

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        name_fa: data?.name_fa || '',
        description: data?.description,
        description_fa: data?.description_fa || '',
        variantName: data?.variantName,
        variantDescription: data?.variantDescription,
        images: data.images,
        variantImage: data?.variantImage
          ? data.variantImage.map((variantImg) => ({ url: variantImg.url }))
          : [],
        categoryId: data?.categoryId,
        offerTagId: data?.offerTagId,
        subCategoryId: data?.subCategoryId,
        brand: data?.brand,
        sku: data?.sku,
        colors: data?.colors,
        sizes: data?.sizes,
        product_specs: data?.product_specs,
        variant_specs: data?.variant_specs,
        keywords: data?.keywords,
        keywords_fa: data?.keywords_fa,
        questions: data?.questions,
        isSale: data?.isSale || false,
        weight: data?.weight,
        freeShippingForAllCountries: data?.freeShippingForAllCountries,
        freeShippingCountriesIds: data?.freeShippingCountriesIds || [],
        // shippingFeeMethod: data?.shippingFeeMethod,
      })
    }
  }, [data, form])

  const handleSubmit = async (data: z.infer<typeof ProductFormSchema>) => {
    console.log({ data })
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('variantName', data.variantName)
    formData.append('variantDescription', data.variantDescription)
    formData.append('name_fa', data.name_fa || '')
    formData.append('description_fa', data.description_fa || '')
    formData.append('variantName_fa', data.variantName_fa || '')
    formData.append('variantDescription_fa', data.variantDescription_fa || '')
    formData.append('images', data.images)
    formData.append('variantImage', data.variantImage)
    formData.append('categoryId', data.categoryId)
    formData.append('subCategoryId', data.subCategoryId)
    formData.append('offerTagId', data.offerTagId || '')
    formData.append('isSale', data.isSale)
    formData.append('saleEndDate', data.saleEndDate)
    formData.append('brand', data.brand)
    formData.append('sku', data.sku)
    formData.append('weight', data.weight)
    formData.append('colors', data.colors)
    formData.append('sizes', data.sizes)
    formData.append('product_specs', data.product_specs)
    formData.append('variant_specs', data.variant_specs)
    formData.append('keywords', data.keywords)
    formData.append('keywords_fa', data.keywords_fa || [])
    formData.append('questions', data.questions)
    // formData.append('shippingFeeMethod', data.shippingFeeMethod)
    formData.append(
      'freeShippingForAllCountries',
      data.freeShippingForAllCountries
    )
    // formData.append('freeShippingCountriesIds', data.freeShippingCountriesIds)
    // formData.append('name', data.name)
    // formData.append('name', data.name)
    // formData.append('name', data.name)
    // formData.append('name_fa', data.name_fa || '')
    // formData.append('description', data.description)
    // formData.append('description_fa', data.description_fa || '')
    // formData.append('email', data.email)
    // formData.append('phone', data.phone)
    // formData.append('url', data.url)

    // if (data.featured) {
    //   formData.append('featured', 'true')
    // } else {
    //   formData.append('featured', 'false')
    // }

    // data.logo?.forEach((item) => {
    //   if (item instanceof File) {
    //     formData.append('logo', item)
    //   }
    // })

    // if (data.cover && data.cover.length > 0) {
    //   for (let i = 0; i < data.cover.length; i++) {
    //     formData.append('cover', data.cover[i] as string | Blob)
    //   }
    // }
    try {
      if (data) {
        startTransition(async () => {
          try {
            const res = await editProduct(formData, data.id as string, path)
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.description) {
              form.setError('description', {
                type: 'custom',
                message: res?.errors.description?.join(' و '),
              })
            } else if (res?.errors?.variantName) {
              form.setError('variantName', {
                type: 'custom',
                message: res?.errors.variantName?.join(' و '),
              })
            } else if (res?.errors?.variantDescription) {
              form.setError('variantDescription', {
                type: 'custom',
                message: res?.errors.variantDescription?.join(' و '),
              })
            } else if (res?.errors?.name_fa) {
              form.setError('name_fa', {
                type: 'custom',
                message: res?.errors.name_fa?.join(' و '),
              })
            } else if (res?.errors?.description_fa) {
              form.setError('description_fa', {
                type: 'custom',
                message: res?.errors.description_fa?.join(' و '),
              })
            } else if (res?.errors?.variantName_fa) {
              form.setError('variantName_fa', {
                type: 'custom',
                message: res?.errors.variantName_fa?.join(' و '),
              })
            } else if (res?.errors?.variantDescription_fa) {
              form.setError('variantDescription_fa', {
                type: 'custom',
                message: res?.errors.variantDescription_fa?.join(' و '),
              })
            } else if (res?.errors?.images) {
              form.setError('images', {
                type: 'custom',
                message: res?.errors.images?.join(' و '),
              })
            } else if (res?.errors?.variantImage) {
              form.setError('variantImage', {
                type: 'custom',
                message: res?.errors.variantImage?.join(' و '),
              })
            } else if (res?.errors?.categoryId) {
              form.setError('categoryId', {
                type: 'custom',
                message: res?.errors.categoryId?.join(' و '),
              })
            } else if (res?.errors?.subCategoryId) {
              form.setError('subCategoryId', {
                type: 'custom',
                message: res?.errors.subCategoryId?.join(' و '),
              })
            } else if (res?.errors?.offerTagId) {
              form.setError('offerTagId', {
                type: 'custom',
                message: res?.errors.offerTagId?.join(' و '),
              })
            } else if (res?.errors?.isSale) {
              form.setError('isSale', {
                type: 'custom',
                message: res?.errors.isSale?.join(' و '),
              })
            } else if (res?.errors?.saleEndDate) {
              form.setError('saleEndDate', {
                type: 'custom',
                message: res?.errors.saleEndDate?.join(' و '),
              })
            } else if (res?.errors?.brand) {
              form.setError('brand', {
                type: 'custom',
                message: res?.errors.brand?.join(' و '),
              })
            } else if (res?.errors?.sku) {
              form.setError('sku', {
                type: 'custom',
                message: res?.errors.sku?.join(' و '),
              })
            } else if (res?.errors?.weight) {
              form.setError('weight', {
                type: 'custom',
                message: res?.errors.weight?.join(' و '),
              })
            } else if (res?.errors?.colors) {
              form.setError('colors', {
                type: 'custom',
                message: res?.errors.colors?.join(' و '),
              })
            } else if (res?.errors?.sizes) {
              form.setError('sizes', {
                type: 'custom',
                message: res?.errors.sizes?.join(' و '),
              })
            } else if (res?.errors?.product_specs) {
              form.setError('product_specs', {
                type: 'custom',
                message: res?.errors.product_specs?.join(' و '),
              })
            } else if (res?.errors?.variant_specs) {
              form.setError('variant_specs', {
                type: 'custom',
                message: res?.errors.variant_specs?.join(' و '),
              })
            } else if (res?.errors?.keywords) {
              form.setError('keywords', {
                type: 'custom',
                message: res?.errors.keywords?.join(' و '),
              })
            } else if (res?.errors?.keywords_fa) {
              form.setError('keywords_fa', {
                type: 'custom',
                message: res?.errors.keywords_fa?.join(' و '),
              })
            } else if (res?.errors?.questions) {
              form.setError('questions', {
                type: 'custom',
                message: res?.errors.questions?.join(' و '),
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
            } else if (res?.errors?.description) {
              form.setError('description', {
                type: 'custom',
                message: res?.errors.description?.join(' و '),
              })
            } else if (res?.errors?.variantName) {
              form.setError('variantName', {
                type: 'custom',
                message: res?.errors.variantName?.join(' و '),
              })
            } else if (res?.errors?.variantDescription) {
              form.setError('variantDescription', {
                type: 'custom',
                message: res?.errors.variantDescription?.join(' و '),
              })
            } else if (res?.errors?.name_fa) {
              form.setError('name_fa', {
                type: 'custom',
                message: res?.errors.name_fa?.join(' و '),
              })
            } else if (res?.errors?.description_fa) {
              form.setError('description_fa', {
                type: 'custom',
                message: res?.errors.description_fa?.join(' و '),
              })
            } else if (res?.errors?.variantName_fa) {
              form.setError('variantName_fa', {
                type: 'custom',
                message: res?.errors.variantName_fa?.join(' و '),
              })
            } else if (res?.errors?.variantDescription_fa) {
              form.setError('variantDescription_fa', {
                type: 'custom',
                message: res?.errors.variantDescription_fa?.join(' و '),
              })
            } else if (res?.errors?.images) {
              form.setError('images', {
                type: 'custom',
                message: res?.errors.images?.join(' و '),
              })
            } else if (res?.errors?.variantImage) {
              form.setError('variantImage', {
                type: 'custom',
                message: res?.errors.variantImage?.join(' و '),
              })
            } else if (res?.errors?.categoryId) {
              form.setError('categoryId', {
                type: 'custom',
                message: res?.errors.categoryId?.join(' و '),
              })
            } else if (res?.errors?.subCategoryId) {
              form.setError('subCategoryId', {
                type: 'custom',
                message: res?.errors.subCategoryId?.join(' و '),
              })
            } else if (res?.errors?.offerTagId) {
              form.setError('offerTagId', {
                type: 'custom',
                message: res?.errors.offerTagId?.join(' و '),
              })
            } else if (res?.errors?.isSale) {
              form.setError('isSale', {
                type: 'custom',
                message: res?.errors.isSale?.join(' و '),
              })
            } else if (res?.errors?.saleEndDate) {
              form.setError('saleEndDate', {
                type: 'custom',
                message: res?.errors.saleEndDate?.join(' و '),
              })
            } else if (res?.errors?.brand) {
              form.setError('brand', {
                type: 'custom',
                message: res?.errors.brand?.join(' و '),
              })
            } else if (res?.errors?.sku) {
              form.setError('sku', {
                type: 'custom',
                message: res?.errors.sku?.join(' و '),
              })
            } else if (res?.errors?.weight) {
              form.setError('weight', {
                type: 'custom',
                message: res?.errors.weight?.join(' و '),
              })
            } else if (res?.errors?.colors) {
              form.setError('colors', {
                type: 'custom',
                message: res?.errors.colors?.join(' و '),
              })
            } else if (res?.errors?.sizes) {
              form.setError('sizes', {
                type: 'custom',
                message: res?.errors.sizes?.join(' و '),
              })
            } else if (res?.errors?.product_specs) {
              form.setError('product_specs', {
                type: 'custom',
                message: res?.errors.product_specs?.join(' و '),
              })
            } else if (res?.errors?.variant_specs) {
              form.setError('variant_specs', {
                type: 'custom',
                message: res?.errors.variant_specs?.join(' و '),
              })
            } else if (res?.errors?.keywords) {
              form.setError('keywords', {
                type: 'custom',
                message: res?.errors.keywords?.join(' و '),
              })
            } else if (res?.errors?.keywords_fa) {
              form.setError('keywords_fa', {
                type: 'custom',
                message: res?.errors.keywords_fa?.join(' و '),
              })
            } else if (res?.errors?.questions) {
              form.setError('questions', {
                type: 'custom',
                message: res?.errors.questions?.join(' و '),
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
  const validUrls =
    data && data.images
      ? (data.images.map((img) => img.url).filter(Boolean) as string[])
      : (files
          .map((file) => URL.createObjectURL(file))
          .filter(Boolean) as string[])

  const [images, setImages] = useState([])
  const urls = {
    url: images
      .map((file) => URL.createObjectURL(file))
      .filter(Boolean) as string[],
  }
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {isNewVariantPage
              ? `Add a new variant to ${data.name}`
              : 'Create a new product'}
          </CardTitle>
          <CardDescription>
            {data?.productId && data.variantId
              ? `Update ${data?.name} product information.`
              : ' Lets create a product. You can edit product later from the product page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <div className="flex flex-col gap-y-6 xl:flex-row">
                {/* <FormField
                  control={form.control}
                  name="images"
                  render={({ field: { onChange }, ...field }) => (
                    <FormItem>
                      <FormControl>
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
                <ImageInput
                  name="images"
                  label="images"
                  colors={colors}
                  setColors={setColors}
                />
                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                  <ClickToAddInputs
                    details={data?.colors || colors}
                    setDetails={setColors}
                    initialDetail={{ color: '' }}
                    header="Colors"
                    colorPicker
                  />
                  {errors.colors && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.colors.message}
                    </span>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'loading...'
                  : data?.productId && data.variantId
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
