'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import JoditEditor from 'jodit-react'
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
import { Link, usePathname } from '@/navigation'
import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  Category,
  Color,
  Country,
  Image,
  OfferTag,
  Product,
  ProductVariant,
  ShippingFeeMethod,
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
import ImagesPreviewGrid from '../images-preview-grid_'
import { useTheme } from 'next-themes'
import { ImageInput } from '../image-input'
import ClickToAddInputs from '../click-to-add'
import InputFieldset from '../input-fieldset'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Dot } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from '@/components/ui/multi-selector'
import { NumberInput } from '@tremor/react'
import { TagsInput } from '@/components/shared/tag-input'
// import { useQueryState } from 'nuqs'
import { getSubCategoryByCategoryId } from '@/lib/actions/dashboard/categories'
import { useQuery } from '@tanstack/react-query'
import MultipleSelector, { Option } from '@/components/shared/multiple-selector'
import { DateTimePicker } from '@/components/shared/date-time-picker'

const shippingFeeMethods = [
  {
    value: ShippingFeeMethod.ITEM,
    description: 'ITEM (Fees calculated based on number of products.)',
  },
  {
    value: ShippingFeeMethod.WEIGHT,
    description: 'WEIGHT (Fees calculated based on product weight)',
  },
  {
    value: ShippingFeeMethod.FIXED,
    description: 'FIXED (Fees are fixed.)',
  },
]

interface ProductDetailProps {
  // data?: Product & {
  //   variants: (ProductVariant & { images: Image[] } & { sizes: Size[] } & {
  //     colors: Color[]
  //   })[]
  // } & { category: { id: string } } & { store: { id: string } } & {
  //   cover: Image[] | null
  // }
  data?: Partial<ProductWithVariantType>
  categories: Category[]
  storeUrl: string
  offerTags: OfferTag[]
  countries: Country[]
  // subCategories?: SubCategory[]
}

const ProductDetails: FC<ProductDetailProps> = ({
  data,
  categories,
  offerTags,
  storeUrl,
  countries,
  // subCategories,
}) => {
  // console.log(data?.colors)

  const path = usePathname()

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

  // State for colors
  // const [colors, setColors] = useState<{ color: string }[]>(
  //   data?.colors || [{ color: '' }]
  // )
  const [colors, setColors] = useState<{ color: string }[]>(
    data?.colors
      ? data.colors
          .filter(
            (color): color is NonNullable<typeof color> => color !== undefined
          )
          .map(({ name }) => ({ color: name }))
      : [{ color: '' }]
  )

  // Temporary state for images
  // const [images, setImages] = useState<{ url: string }[]>([])

  // State for sizes
  const [sizes, setSizes] = useState<
    { size: string; price: number; quantity: number; discount: number }[]
  >(
    data?.sizes
      ? data.sizes
          .filter(
            (size): size is NonNullable<typeof size> => size !== undefined
          )
          .map(({ size, price, quantity, discount }) => ({
            size,
            price,
            quantity,
            discount,
          }))
      : [{ size: '', quantity: 1, price: 1000, discount: 0 }]
  )

  // State for product specs
  // const [productSpecs, setProductSpecs] = useState<
  //   { name: string; value: string }[]
  // >(data?.product_specs || [{ name: '', value: '' }])
  const [productSpecs, setProductSpecs] = useState<
    { name: string; value: string }[]
  >(
    data?.product_specs
      ? data?.product_specs
          .filter(
            (
              product_specs
            ): product_specs is NonNullable<typeof product_specs> =>
              product_specs !== undefined
          )
          .map(({ name, value }) => ({ name, value }))
      : [{ name: '', value: '' }]
  )

  // State for product variant specs
  // const [variantSpecs, setVariantSpecs] = useState<
  //   { name: string; value: string }[]
  // >(data?.variantSpecs, setVariantSpecs || [{ name: '', value: '' }])
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(
    data?.variant_specs
      ? data?.variant_specs
          .filter(
            (
              variant_specs
            ): variant_specs is NonNullable<typeof variant_specs> =>
              variant_specs !== undefined
          )
          .map(({ name, value }) => ({ name, value }))
      : [{ name: '', value: '' }]
  )

  // State for product variant specs
  // const [questions, setQuestions] = useState<
  //   { question: string; answer: string }[]
  // >(data?.questions || [{ question: '', answer: '' }])

  const [questions, setQuestions] = useState<
    { question: string; answer: string }[]
  >(
    data?.questions
      ? data.questions
          .filter(
            (questions): questions is NonNullable<typeof questions> =>
              questions !== undefined
          )
          .map(({ question, answer }) => ({
            question,
            answer,
          }))
      : [{ question: '', answer: '' }]
  )

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
      variantImage: data?.images || [],
      categoryId: data?.categoryId,
      offerTagId: data?.offerTagId || undefined,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: data?.sku,
      // colors: data?.colors,
      colors: data?.colors?.map((clr) => {
        return {
          color: clr?.name,
        }
      }),
      sizes: data?.sizes,
      product_specs: data?.product_specs,
      variant_specs: data?.variant_specs,
      keywords: data?.keywords,
      keywords_fa: data?.keywords_fa,
      questions: data?.questions,
      isSale: data?.isSale || false,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
      freeShippingForAllCountries: data?.freeShippingForAllCountries,
      freeShippingCountriesIds: data?.freeShippingCountriesIds || [],
      shippingFeeMethod: data?.shippingFeeMethod,
    },
  })
  // const saleEndDate = form.getValues().saleEndDate || new Date().toISOString()

  // const formattedDate = new Date(saleEndDate).toLocaleString('en-Us', {
  //   weekday: 'short', // Abbreviated day name (e.g., "Mon")
  //   month: 'long', // Abbreviated month name (e.g., "Nov")
  //   day: '2-digit', // Two-digit day (e.g., "25")
  //   year: 'numeric', // Full year (e.g., "2024")
  //   hour: '2-digit', // Two-digit hour (e.g., "02")
  //   minute: '2-digit', // Two-digit minute (e.g., "30")
  //   second: '2-digit', // Two-digit second (optional)
  //   hour12: false, // 12-hour format (change to false for 24-hour format)
  // })
  const { data: SubCategories, isPending: isPendingCategory } = useQuery({
    queryKey: ['subCateByCat', form.watch().categoryId],
    queryFn: () => getSubCategoryByCategoryId(form.watch().categoryId),
  })
  // console.log({ SubCategories })
  // // Extract errors state from form
  const errors = form.formState.errors
  console.log({ errors })

  // // Loading status based on form submission
  // const isPending = form.formState.isSubmitting

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
        variantImage: data?.variantImage,
        categoryId: data?.categoryId,
        offerTagId: data?.offerTagId,
        subCategoryId: data?.subCategoryId,
        brand: data?.brand,
        sku: data?.sku,
        colors: data?.colors?.map((clr) => {
          return {
            color: clr?.name,
          }
        }),
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
        shippingFeeMethod: data?.shippingFeeMethod,
      })
    }
  }, [data, form])

  const handleSubmit = async (data: z.infer<typeof ProductFormSchema>) => {
    const formData = new FormData()

    // console.log({ data })
    formData.append('name', data.name)
    formData.append('description', data.description)
    formData.append('variantName', data.variantName)
    formData.append('variantDescription', data.variantDescription || '')
    formData.append('name_fa', data.name_fa || '')
    formData.append('description_fa', data.description_fa || '')
    formData.append('variantName_fa', data.variantName_fa || '')
    formData.append('variantDescription_fa', data.variantDescription_fa || '')
    // formData.append('images', data.images)
    // formData.append('variantImage', data.variantImage)
    formData.append('categoryId', data.categoryId)
    formData.append('subCategoryId', data.subCategoryId)
    formData.append('offerTagId', (data.offerTagId as string) || '')
    if (data.isSale) {
      formData.append('isSale', 'true')
    }
    const saleEndDate =
      data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0))

    const saleEndDateString =
      saleEndDate instanceof Date ? saleEndDate.toISOString() : saleEndDate
    // formData.append(
    //   'saleEndDate',
    //   data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0))
    // )
    formData.append('saleEndDate', saleEndDateString)

    formData.append('brand', data.brand || '')
    formData.append('sku', data.sku || '')

    formData.append('weight', String(data.weight))

    // formData.append('colors', data.colors || [])
    // formData.append('sizes', data.sizes || [])
    // if (data.product_specs && data.product_specs.length > 0) {
    //   for (let i = 0; i < data.product_specs.length; i++) {
    //     formData.append('product_specs', data.product_specs[i] as string | Blob)
    //   }
    // }
    if (data.keywords && data.keywords.length > 0) {
      for (let i = 0; i < data.keywords.length; i++) {
        formData.append('keywords', data.keywords[i] as string | Blob)
      }
    }

    formData.append('shippingFeeMethod', data.shippingFeeMethod || [])
    if (data.freeShippingForAllCountries) {
      formData.append('freeShippingForAllCountries', 'true')
    }

    // if (data.featured) {
    //   formData.append('featured', 'true')
    // } else {
    //   formData.append('featured', 'false')
    // }

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i] as string | Blob)
      }
    }
    if (data.variantImage && data.variantImage.length > 0) {
      for (let i = 0; i < data.variantImage.length; i++) {
        formData.append('variantImage', data.variantImage[i] as string | Blob)
      }
    }

    if (data.questions && data.questions.length > 0) {
      data.questions.forEach((questions) => {
        formData.append('questions', JSON.stringify(questions))
      })
    }
    if (data.product_specs && data.product_specs.length > 0) {
      data.product_specs.forEach((size) => {
        formData.append('product_specs', JSON.stringify(size))
      })
    }
    if (data.variant_specs && data.variant_specs.length > 0) {
      data.variant_specs.forEach((size) => {
        formData.append('variant_specs', JSON.stringify(size))
      })
    }
    if (data.sizes && data.sizes.length > 0) {
      data.sizes.forEach((size) => {
        formData.append('sizes', JSON.stringify(size))
      })
    }

    if (data.colors && data.colors.length > 0) {
      data.colors.forEach((color) => {
        formData.append('colors', JSON.stringify(color))
      })
    }
    if (data.questions && data.questions.length > 0) {
      data.questions.forEach((question) => {
        formData.append('question', JSON.stringify(question))
      })
    }
    // if (data.sizes && data.sizes.length > 0) {
    //   for (let i = 0; i < data.sizes.length; i++) {
    //     const sizeData = data.sizes[i]
    //     formData.append(`sizes`, {sizeData.size,sizeData.quantity,sizeData.price,sizeData.discount})
    //   }
    // }
    // formData.append(`sizes`, sizeData.quantity.toString())
    // formData.append(`sizes`, sizeData.price.toString())
    // formData.append(`sizes`, sizeData.discount.toString())
    // try {
    //   if (data) {
    //     startTransition(async () => {
    //       try {
    //         const res = await editProduct(formData, data.id as string, path)
    //         if (res?.errors?.name) {
    //           form.setError('name', {
    //             type: 'custom',
    //             message: res?.errors.name?.join(' و '),
    //           })
    //         } else if (res?.errors?.description) {
    //           form.setError('description', {
    //             type: 'custom',
    //             message: res?.errors.description?.join(' و '),
    //           })
    //         } else if (res?.errors?.variantName) {
    //           form.setError('variantName', {
    //             type: 'custom',
    //             message: res?.errors.variantName?.join(' و '),
    //           })
    //         } else if (res?.errors?.variantDescription) {
    //           form.setError('variantDescription', {
    //             type: 'custom',
    //             message: res?.errors.variantDescription?.join(' و '),
    //           })
    //         } else if (res?.errors?.name_fa) {
    //           form.setError('name_fa', {
    //             type: 'custom',
    //             message: res?.errors.name_fa?.join(' و '),
    //           })
    //         } else if (res?.errors?.description_fa) {
    //           form.setError('description_fa', {
    //             type: 'custom',
    //             message: res?.errors.description_fa?.join(' و '),
    //           })
    //         } else if (res?.errors?.variantName_fa) {
    //           form.setError('variantName_fa', {
    //             type: 'custom',
    //             message: res?.errors.variantName_fa?.join(' و '),
    //           })
    //         } else if (res?.errors?.variantDescription_fa) {
    //           form.setError('variantDescription_fa', {
    //             type: 'custom',
    //             message: res?.errors.variantDescription_fa?.join(' و '),
    //           })
    //         } else if (res?.errors?.images) {
    //           form.setError('images', {
    //             type: 'custom',
    //             message: res?.errors.images?.join(' و '),
    //           })
    //         } else if (res?.errors?.variantImage) {
    //           form.setError('variantImage', {
    //             type: 'custom',
    //             message: res?.errors.variantImage?.join(' و '),
    //           })
    //         } else if (res?.errors?.categoryId) {
    //           form.setError('categoryId', {
    //             type: 'custom',
    //             message: res?.errors.categoryId?.join(' و '),
    //           })
    //         } else if (res?.errors?.subCategoryId) {
    //           form.setError('subCategoryId', {
    //             type: 'custom',
    //             message: res?.errors.subCategoryId?.join(' و '),
    //           })
    //         } else if (res?.errors?.offerTagId) {
    //           form.setError('offerTagId', {
    //             type: 'custom',
    //             message: res?.errors.offerTagId?.join(' و '),
    //           })
    //         } else if (res?.errors?.isSale) {
    //           form.setError('isSale', {
    //             type: 'custom',
    //             message: res?.errors.isSale?.join(' و '),
    //           })
    //         } else if (res?.errors?.saleEndDate) {
    //           form.setError('saleEndDate', {
    //             type: 'custom',
    //             message: res?.errors.saleEndDate?.join(' و '),
    //           })
    //         } else if (res?.errors?.brand) {
    //           form.setError('brand', {
    //             type: 'custom',
    //             message: res?.errors.brand?.join(' و '),
    //           })
    //         } else if (res?.errors?.sku) {
    //           form.setError('sku', {
    //             type: 'custom',
    //             message: res?.errors.sku?.join(' و '),
    //           })
    //         } else if (res?.errors?.weight) {
    //           form.setError('weight', {
    //             type: 'custom',
    //             message: res?.errors.weight?.join(' و '),
    //           })
    //         } else if (res?.errors?.colors) {
    //           form.setError('colors', {
    //             type: 'custom',
    //             message: res?.errors.colors?.join(' و '),
    //           })
    //         } else if (res?.errors?.sizes) {
    //           form.setError('sizes', {
    //             type: 'custom',
    //             message: res?.errors.sizes?.join(' و '),
    //           })
    //         } else if (res?.errors?.product_specs) {
    //           form.setError('product_specs', {
    //             type: 'custom',
    //             message: res?.errors.product_specs?.join(' و '),
    //           })
    //         } else if (res?.errors?.variant_specs) {
    //           form.setError('variant_specs', {
    //             type: 'custom',
    //             message: res?.errors.variant_specs?.join(' و '),
    //           })
    //         } else if (res?.errors?.keywords) {
    //           form.setError('keywords', {
    //             type: 'custom',
    //             message: res?.errors.keywords?.join(' و '),
    //           })
    //         } else if (res?.errors?.keywords_fa) {
    //           form.setError('keywords_fa', {
    //             type: 'custom',
    //             message: res?.errors.keywords_fa?.join(' و '),
    //           })
    //         } else if (res?.errors?.questions) {
    //           form.setError('questions', {
    //             type: 'custom',
    //             message: res?.errors.questions?.join(' و '),
    //           })
    //         } else if (res?.errors?._form) {
    //           toast.error(res?.errors._form?.join(' و '))
    //         }
    //       } catch (error) {
    //         // This will catch the NEXT_REDIRECT error, which is expected
    //         // when the redirect happens
    //         if (
    //           !(
    //             error instanceof Error &&
    //             error.message.includes('NEXT_REDIRECT')
    //           )
    //         ) {
    //           toast.error('مشکلی پیش آمده.')
    //         }
    //       }
    //     })
    //   } else {
    startTransition(async () => {
      try {
        const res = await createProduct(formData, storeUrl, path)
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
          !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
        ) {
          toast.error('مشکلی پیش آمده.')
        }
      }
    })
    // }
    // } catch {
    //   toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    // }
  }

  const countryOptions: Option[] = countries.map((c) => ({
    label: c.name,
    value: c.id,
  }))

  const handleDeleteCountryFreeShipping = (index: number) => {
    const currentValues = form.getValues().freeShippingCountriesIds
    const updatedValues = currentValues.filter((_, i) => i !== index)
    form.setValue('freeShippingCountriesIds', updatedValues)
  }

  useEffect(() => {
    form.setValue('colors', colors)
    form.setValue('sizes', sizes)
    form.setValue('product_specs', productSpecs)
    form.setValue('variant_specs', variantSpecs)
    form.setValue('questions', questions)
  }, [colors, form, productSpecs, questions, sizes, variantSpecs])
  // console.log(form.watch().keywords)
  // console.log('form sizes', form.watch().sizes)
  // console.log('form colors', form.watch().colors)
  // console.log(
  //   'form colors',
  //   form.watch().colors?.map((clr) => clr.color)
  // )
  // console.log('saleEndDate', form.watch().saleEndDate)
  // console.log('form description', form.watch().product_specs)
  // console.log('form description', form.watch().variant_specs)
  // console.log('form isSale', form.watch().isSale)
  // console.log('form sku', form.watch().sku)
  // // console.log('form questions', form.watch().questions)
  // console.log('form saleEndDate', form.watch().saleEndDate)
  // console.log(
  //   'form freeShippingCountriesIds',
  //   form.watch().freeShippingCountriesIds
  // )
  // const initialValue = [
  //   { type: 'p', children: [{ text: '' }] },
  // ]
  // const editor = usePlateEditor({
  //   value: initialValue,
  //   plugins: [...editorPlugins],
  // })
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
              className="space-y-4"
            >
              <div className="flex flex-col gap-y-6 xl:flex-row">
                <ImageInput
                  name="images"
                  label="images"
                  colors={colors}
                  setColors={setColors}
                />
                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                  <ClickToAddInputs
                    details={
                      // data?.colors?.map((color) => {
                      //   return { color: color?.name }
                      // }) || colors
                      data?.colors
                        ?.map((color) => color?.name)
                        .filter((name): name is string => !!name)
                        .map((name) => ({ color: name })) || colors
                    }
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
              {/* sizes */}
              <InputFieldset label="Sizes, Quantities, Prices, Disocunts">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputs
                    details={sizes}
                    setDetails={setSizes}
                    initialDetail={{
                      size: '',
                      quantity: 1,
                      price: 1000,
                      discount: 0,
                    }}
                    containerClassName="flex-1"
                    inputClassName="w-full"
                  />
                  {errors.sizes && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.sizes.message}
                    </span>
                  )}
                </div>
              </InputFieldset>
              {/* Name   */}
              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
                  {!isNewVariantPage && (
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Variant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>
              {/* Product and variant description editors (tabs) */}
              <InputFieldset
                label="Description"
                description={
                  isNewVariantPage
                    ? ''
                    : "Note: The product description is the main description for the product (Will display in every variant page). You can add an extra description specific to this variant using 'Variant description' tab."
                }
              >
                <Tabs
                  defaultValue={isNewVariantPage ? 'variant' : 'product'}
                  className="w-full"
                >
                  {!isNewVariantPage && (
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="product">
                        Product description
                      </TabsTrigger>
                      <TabsTrigger value="variant">
                        Variant description
                      </TabsTrigger>
                    </TabsList>
                  )}
                  <TabsContent value="product">
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <JoditEditor
                              {...field}
                              ref={productDescEditor}
                              config={config}
                              value={form.getValues().description}
                              onChange={(content) => {
                                form.setValue('description', content)
                              }}
                            />
                            {/* <Plate
                              editor={editor}
                              onChange={({ value }) => {
                                // Sync to the form
                                field.onChange(value)
                              }}
                            >
                              <EditorContainer variant="demo">
                                <Editor />
                              </EditorContainer>
                            </Plate> */}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="variant">
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="variantDescription"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <JoditEditor
                              {...field}
                              ref={variantDescEditor}
                              config={config}
                              value={form.getValues().variantDescription || ''}
                              onChange={(content) => {
                                form.setValue('variantDescription', content)
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </InputFieldset>
              {/* Category - SubCategory - offer*/}
              {!isNewVariantPage && (
                <InputFieldset label="Category">
                  <div className="flex gap-4">
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            disabled={
                              isPending ||
                              isPendingCategory ||
                              categories.length == 0
                            }
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select a category"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
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
                      name="subCategoryId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            disabled={
                              isPending ||
                              isPendingCategory ||
                              categories.length == 0 ||
                              !form.getValues().categoryId
                            }
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select a sub-category"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SubCategories?.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                  {sub.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Offer Tag */}
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="offerTagId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            disabled={isPending || categories.length == 0}
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  defaultValue={field.value}
                                  placeholder="Select an offer"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {offerTags &&
                                offerTags.map((offer) => (
                                  <SelectItem key={offer.id} value={offer.id}>
                                    {offer.name}
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
              )}
              {/* Brand, Sku, Weight */}
              <InputFieldset
                label={isNewVariantPage ? 'Sku, Weight' : 'Brand, Sku, Weight'}
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {!isNewVariantPage && (
                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Product brand" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Product sku" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <NumberInput
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            placeholder="Product weight"
                            min={0.01}
                            step={0.01}
                            className="!shadow-none rounded-md !text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>
              {/* Variant image - Keywords*/}
              <div className="flex items-center gap-10 py-14">
                {/* Variant image */}
                <div className="w-60 h-60">
                  <InputFileUpload
                    className="w-full"
                    // initialDataImages={
                    //   data?.variantImage ? data?.variantImage : []
                    // }
                    initialDataImages={
                      data?.variantImage
                        ? data.variantImage.filter(
                            (image): image is NonNullable<typeof image> =>
                              image !== undefined
                          )
                        : []
                    }
                    name="variantImage"
                    multiple={false}
                    label="VariantImage"
                  />
                </div>
                {/* Keywords */}
                <div className="w-full flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem className="relative flex-1">
                        <FormLabel>Product Keywords</FormLabel>
                        <FormControl>
                          <TagsInput
                            maxItems={10}
                            value={field?.value || []}
                            onValueChange={field.onChange}
                            placeholder="Enter your tags"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              {/* Product and variant specs*/}
              <InputFieldset
                label="Specifications"
                description={
                  isNewVariantPage
                    ? ''
                    : "Note: The product specifications are the main specs for the product (Will display in every variant page). You can add extra specs specific to this variant using 'Variant Specifications' tab."
                }
              >
                <Tabs
                  defaultValue={
                    isNewVariantPage ? 'variantSpecs' : 'productSpecs'
                  }
                  className="w-full"
                >
                  {!isNewVariantPage && (
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="productSpecs">
                        Product Specifications
                      </TabsTrigger>
                      <TabsTrigger value="variantSpecs">
                        Variant Specifications
                      </TabsTrigger>
                    </TabsList>
                  )}
                  <TabsContent value="productSpecs">
                    <div className="w-full flex flex-col gap-y-3">
                      <ClickToAddInputs
                        details={productSpecs}
                        setDetails={setProductSpecs}
                        initialDetail={{
                          name: '',
                          value: '',
                        }}
                        containerClassName="flex-1"
                        inputClassName="w-full"
                      />
                      {errors.product_specs && (
                        <span className="text-sm font-medium text-destructive">
                          {errors.product_specs.message}
                        </span>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="variantSpecs">
                    <div className="w-full flex flex-col gap-y-3">
                      <ClickToAddInputs
                        details={variantSpecs}
                        setDetails={setVariantSpecs}
                        initialDetail={{
                          name: '',
                          value: '',
                        }}
                        containerClassName="flex-1"
                        inputClassName="w-full"
                      />
                      {errors.variant_specs && (
                        <span className="text-sm font-medium text-destructive">
                          {errors.variant_specs.message}
                        </span>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </InputFieldset>
              {/* Questions*/}
              {!isNewVariantPage && (
                <InputFieldset label="Questions & Answers">
                  <div className="w-full flex flex-col gap-y-3">
                    <ClickToAddInputs
                      details={questions}
                      setDetails={setQuestions}
                      initialDetail={{
                        question: '',
                        answer: '',
                      }}
                      containerClassName="flex-1"
                      inputClassName="w-full"
                    />
                    {errors.questions && (
                      <span className="text-sm font-medium text-destructive">
                        {errors.questions.message}
                      </span>
                    )}
                  </div>
                </InputFieldset>
              )}
              {/* Is On Sale */}

              <InputFieldset
                label="Sale"
                description="Is your product on sale ?"
              >
                <div>
                  <FormField
                    control={form.control}
                    name="isSale"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          {/* <>
                                  <input
                                    type="checkbox"
                                    id="yes"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    hidden
                                  />
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </> */}
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-readonly
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <>
                    {form.getValues('isSale') ? (
                      <DateTimePicker name="saleEndDate" />
                    ) : null}
                  </>
                  {/* <span>Yes</span> */}
                </div>
              </InputFieldset>
              {/* Shipping fee method */}
              {!isNewVariantPage && (
                <InputFieldset label="Product shipping fee method">
                  <FormField
                    disabled={isPending}
                    control={form.control}
                    name="shippingFeeMethod"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          disabled={isPending}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select Shipping Fee Calculation method"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shippingFeeMethods.map((method) => (
                              <SelectItem
                                key={method.value}
                                value={method.value}
                              >
                                {method.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </InputFieldset>
              )}
              {/* Fee Shipping */}
              {!isNewVariantPage && (
                <InputFieldset
                  label="Free Shipping (Optional)"
                  description="Free Shipping Worldwide ?"
                >
                  <div>
                    <label
                      htmlFor="freeShippingForAll"
                      className="ml-5 flex items-center gap-x-2 cursor-pointer"
                    >
                      <FormField
                        control={form.control}
                        name="freeShippingForAllCountries"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <>
                                <input
                                  type="checkbox"
                                  id="freeShippingForAll"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  hidden
                                />
                                <Checkbox
                                  checked={field?.value}
                                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                  // @ts-ignore
                                  onCheckedChange={field.onChange}
                                />
                              </>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <span>Yes</span>
                    </label>
                  </div>
                  <div>
                    <p className="mt-4 text-sm text-main-secondary dark:text-gray-400 pb-3 flex">
                      <Dot className="-me-1" />
                      If not select the countries you want to ship this product
                      to for free
                    </p>
                  </div>
                  <div className="">
                    {!form.getValues().freeShippingForAllCountries && (
                      <div>
                        <FormField
                          control={form.control}
                          name="freeShippingCountriesIds"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <MultipleSelector
                                  {...field}
                                  // value={field?.value}
                                  // onChange={field.onChange}
                                  defaultOptions={countryOptions}
                                  placeholder="Select frameworks you like..."
                                  emptyIndicator={
                                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                      no results found.
                                    </p>
                                  }
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <p className="mt-4 text-sm text-main-secondary dark:text-gray-400 pb-3 flex">
                          <Dot className="-me-1" />
                          List of countries you offer free shipping for this
                          product :&nbsp;
                          {form.getValues().freeShippingCountriesIds &&
                            form.getValues().freeShippingCountriesIds.length ===
                              0 &&
                            'None'}
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {form
                            .getValues()
                            .freeShippingCountriesIds?.map((country, index) => (
                              <div
                                key={country.label}
                                className="text-xs inline-flex items-center px-3 py-1 bg-blue-200 text-blue-primary rounded-md gap-x-2"
                              >
                                <span>{country.label}</span>
                                <span
                                  className="cursor-pointer hover:text-red-500"
                                  onClick={() =>
                                    handleDeleteCountryFreeShipping(index)
                                  }
                                >
                                  x
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </InputFieldset>
              )}

              <Button type="submit" disabled={isPending}>
                {isPending
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
