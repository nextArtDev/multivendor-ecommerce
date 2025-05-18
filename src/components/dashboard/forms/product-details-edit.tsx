'use client'
import { zodResolver } from '@hookform/resolvers/zod'

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
import JoditEditor from 'jodit-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { editProduct } from '@/lib/actions/dashboard/products'

import { ProductWithVariantType } from '@/lib/types'
import { usePathname } from '@/navigation'
import { Category, Country, OfferTag, ShippingFeeMethod } from '@prisma/client'
import { NumberInput } from '@tremor/react'
import { Dot } from 'lucide-react'
import { useTheme } from 'next-themes'
import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import ClickToAddInputs from '../click-to-add'
import InputFieldset from '../input-fieldset'
// import { useQueryState } from 'nuqs'
import MultipleSelector, { Option } from '@/components/shared/multiple-selector'
import { getSubCategoryByCategoryId } from '@/lib/actions/dashboard/categories'
import { useQuery } from '@tanstack/react-query'
import { ProductEditFormSchema } from '@/lib/schemas/dashboard'
import { TagsInput } from '@/components/shared/tag-input'

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

const ProductDetailsEdit: FC<ProductDetailProps> = ({
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

  // Jodit configuration
  const { theme } = useTheme()

  const config = useMemo(
    () => ({
      theme: theme === 'dark' ? 'dark' : 'default',
    }),
    [theme]
  )

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

  const form = useForm<z.infer<typeof ProductEditFormSchema>>({
    resolver: zodResolver(ProductEditFormSchema),
    defaultValues: {
      name: data?.name,
      name_fa: data?.name_fa || '',
      description: data?.description,
      description_fa: data?.description_fa || '',

      images: data?.images || [],

      categoryId: data?.categoryId,
      offerTagId: data?.offerTagId || undefined,
      subCategoryId: data?.subCategoryId,
      brand: data?.brand,
      sku: data?.sku,
      // colors: data?.colors,

      product_specs: data?.product_specs,

      keywords: data?.keywords,
      keywords_fa: data?.keywords_fa,
      questions: data?.questions,

      weight: data?.weight,

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

        images: data.images,

        categoryId: data?.categoryId,
        offerTagId: data?.offerTagId,
        subCategoryId: data?.subCategoryId,
        brand: data?.brand,
        sku: data?.sku,

        product_specs: data?.product_specs,

        keywords: data?.keywords,
        keywords_fa: data?.keywords_fa,
        questions: data?.questions,

        weight: data?.weight,
        freeShippingForAllCountries: data?.freeShippingForAllCountries,
        freeShippingCountriesIds: data?.freeShippingCountriesIds || [],
        shippingFeeMethod: data?.shippingFeeMethod,
      })
    }
  }, [data, form])

  const handleSubmit = async (
    values: z.infer<typeof ProductEditFormSchema>
  ) => {
    const formData = new FormData()

    // console.log({ data })
    formData.append('name', values.name)
    formData.append('description', values.description)

    formData.append('name_fa', values.name_fa || '')
    formData.append('description_fa', values.description_fa || '')

    formData.append('categoryId', values.categoryId)
    formData.append('subCategoryId', values.subCategoryId)
    formData.append('offerTagId', (values.offerTagId as string) || '')

    formData.append('brand', values.brand || '')
    formData.append('sku', values.sku || '')

    formData.append('weight', String(values.weight))

    // formData.append('colors',values.colors || [])
    // formData.append('sizes',values.sizes || [])
    // if (data.product_specs &&values.product_specs.length > 0) {
    //   for (let i = 0; i <values.product_specs.length; i++) {
    //     formData.append('product_specs',values.product_specs[i] as string | Blob)
    //   }
    // }
    if (values.keywords && values.keywords.length > 0) {
      for (let i = 0; i < values.keywords.length; i++) {
        formData.append('keywords', values.keywords[i] as string | Blob)
      }
    }

    formData.append('shippingFeeMethod', values.shippingFeeMethod || [])
    if (data?.freeShippingForAllCountries) {
      formData.append('freeShippingForAllCountries', 'true')
    }

    if (values.images && values.images.length > 0) {
      for (let i = 0; i < values.images.length; i++) {
        formData.append('images', values.images[i] as string | Blob)
      }
    }

    if (values.questions && values.questions.length > 0) {
      values.questions.forEach((question) => {
        formData.append('question', JSON.stringify(question))
      })
    }

    try {
      startTransition(async () => {
        try {
          console.log(data?.productId)
          const res = await editProduct(formData, data?.id as string, path)
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
          } else if (res?.errors?.images) {
            form.setError('images', {
              type: 'custom',
              message: res?.errors.images?.join(' و '),
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
          } else if (res?.errors?.product_specs) {
            form.setError('product_specs', {
              type: 'custom',
              message: res?.errors.product_specs?.join(' و '),
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
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
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
    form.setValue('product_specs', productSpecs)

    form.setValue('questions', questions)
  }, [form, productSpecs, questions])
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
          <CardTitle>{'Edit product'}</CardTitle>
          <CardDescription>
            {`Update ${data?.name} product information.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Name   */}
              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
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
              </InputFieldset>
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
                              <SelectItem key={category.id} value={category.id}>
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

              {/* Brand, Sku, Weight */}
              <InputFieldset
                label={isNewVariantPage ? 'Sku, Weight' : 'Brand, Sku, Weight'}
              >
                <div className="flex flex-col lg:flex-row gap-4">
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
                            min={1}
                            step={1}
                            className="!shadow-none rounded-md !text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

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
              <InputFieldset
                label="Specifications"
                description={
                  isNewVariantPage
                    ? ''
                    : "Note: The product specifications are the main specs for the product (Will display in every variant page). You can add extra specs specific to this variant using 'Variant Specifications' tab."
                }
              >
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
              </InputFieldset>
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
                            <SelectItem key={method.value} value={method.value}>
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
                  <p className="mt-4 text-sm pb-3 flex">
                    <Dot className="-me-1" />
                    If not select the countries you want to ship this product to
                    for free
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
                                  <p className="text-center text-lg leading-10">
                                    no results found.
                                  </p>
                                }
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <p className="mt-4 text-sm  pb-3 flex">
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
                              className="text-xs inline-flex items-center px-3 py-1 rounded-md gap-x-2"
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

export default ProductDetailsEdit
