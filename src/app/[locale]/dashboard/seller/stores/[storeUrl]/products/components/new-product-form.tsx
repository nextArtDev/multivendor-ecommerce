'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import InputFileUpload from '@/components/shared/InputFileUpload'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import JoditEditor from 'jodit-react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import {
  createNewProduct,
  createProduct,
  editProduct,
} from '@/lib/actions/dashboard/products'
import { NewProductFormSchema } from '@/lib/schemas/dashboard'
import { ProductWithVariantType } from '@/lib/types'
import { usePathname } from '@/navigation'
import {
  Category,
  Country,
  FreeShipping,
  FreeShippingCountry,
  Image,
  OfferTag,
  Product,
  Province,
  Question,
  ShippingFeeMethod,
  Spec,
} from '@prisma/client'
import { Dot } from 'lucide-react'
import { useTheme } from 'next-themes'
import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react'

// import { useQueryState } from 'nuqs'
import MultipleSelector, { Option } from '@/components/shared/multiple-selector'
import { getSubCategoryByCategoryId } from '@/lib/actions/dashboard/categories'
import { useQuery } from '@tanstack/react-query'
import InputFieldset from '@/components/dashboard/input-fieldset'
import ClickToAddInputs from '@/components/dashboard/click-to-add'
import RichTextEditor from '@/components/dashboard/text-editor/react-text-editor'
import ClickToAddInputsRHF from '@/components/dashboard/click-to-add'
import { getCityByProvinceId } from '@/lib/actions/province'

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

interface ProductFormProps {
  // data?: Product & {
  //   variants: (ProductVariant & { images: Image[] } & { sizes: Size[] } & {
  //     colors: Color[]
  //   })[]
  // } & { category: { id: string } } & { store: { id: string } } & {
  //   cover: Image[] | null
  // }
  //   data?: Partial<ProductWithVariantType>
  data?: Partial<
    Product & { images: Image[] | null } & { specs: Spec[] | null } & {
      questions: Question[] | null
    } & {
      freeShipping:
        | (FreeShipping & { eligibaleCountries: FreeShippingCountry[] | null })
        | null
    }
  >
  categories: Category[]
  storeUrl: string
  offerTags: OfferTag[]
  countries: Country[]
  provinces?: Province[]
  // subCategories?: SubCategory[]
}

const ProductForm: FC<ProductFormProps> = ({
  data,
  categories,
  offerTags,
  storeUrl,
  countries,
  provinces,
  // subCategories,
}) => {
  // console.log(data)

  const path = usePathname()

  const [isPending, startTransition] = useTransition()
  const [provinceNameForShopping, setProvinceNameForShopping] = useState('')

  // const [productSpecs, setProductSpecs] = useState<
  //   { name: string; value: string }[]
  // >(
  //   data?.specs
  //     ? data?.specs
  //         .filter(
  //           (specs): specs is NonNullable<typeof specs> => specs !== undefined
  //         )
  //         .map(({ name, value }) => ({ name, value }))
  //     : [{ name: '', value: '' }]
  // )
  // const [questions, setQuestions] = useState<
  //   { question: string; answer: string }[]
  // >(
  //   data?.questions
  //     ? data.questions
  //         .filter(
  //           (questions): questions is NonNullable<typeof questions> =>
  //             questions !== undefined
  //         )
  //         .map(({ question, answer }) => ({
  //           question,
  //           answer,
  //         }))
  //     : [{ question: '', answer: '' }]
  // )

  const form = useForm<z.infer<typeof NewProductFormSchema>>({
    resolver: zodResolver(NewProductFormSchema),
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

      // product_specs: data?.specs || [],
      // questions: data?.questions || [],
      product_specs: data?.specs?.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })) ?? [{ name: '', value: '' }],
      questions: data?.questions?.map((question) => ({
        question: question.question,
        answer: question.answer,
      })) ?? [{ question: '', answer: '' }],

      freeShippingForAllCountries: data?.freeShippingForAllCountries,
      freeShippingCountriesIds:
        data?.freeShipping?.eligibaleCountries?.map((fsh) => {
          return {
            value: fsh.id,
            label: fsh.id,
          }
        }) || [],
      shippingFeeMethod: data?.shippingFeeMethod,
    },
  })

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control: form.control,
    name: 'product_specs',
  })
  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: 'questions',
  })

  const { data: SubCategories, isPending: isPendingCategory } = useQuery({
    queryKey: ['subCateByCat', form.watch().categoryId],
    queryFn: () => getSubCategoryByCategoryId(form.watch().categoryId),
  })
  const {
    data: citiesForFreeShipping,
    isPending: isPendingCitiesForFreeShipping,
  } = useQuery({
    queryKey: ['province-for-shipping', provinceNameForShopping],
    queryFn: () => getCityByProvinceId(provinceNameForShopping),
    enabled: !!provinceNameForShopping,
  })
  // console.log({ citiesForFreeShipping })
  const errors = form.formState.errors
  console.log({ errors })
  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        name_fa: data?.name_fa || '',
        description: data?.description,
        description_fa: data?.description_fa || '',

        images: data?.images ? data?.images.map((img) => img.url) : [],

        categoryId: data?.categoryId,
        offerTagId: data?.offerTagId || '',
        subCategoryId: data?.subCategoryId,
        brand: data?.brand,

        product_specs:
          data.specs?.map((spec) => ({ name: spec.name, value: spec.value })) ??
          [],

        questions:
          data?.questions?.map((q) => ({
            question: q.question,
            answer: q.answer,
          })) ?? [],

        freeShippingForAllCountries: data?.freeShippingForAllCountries,
        freeShippingCountriesIds:
          data?.freeShipping?.eligibaleCountries?.map((fsh) => {
            return {
              value: fsh.id,
              label: fsh.id,
            }
          }) || [],
        shippingFeeMethod: data?.shippingFeeMethod,
      })
    }
  }, [data, form])

  const handleSubmit = async (values: z.infer<typeof NewProductFormSchema>) => {
    const formData = new FormData()

    console.log({ values })
    formData.append('name', values.name)
    formData.append('description', values.description)

    formData.append('name_fa', values.name_fa || '')
    formData.append('description_fa', values.description_fa || '')

    // formData.append('images',values.images)
    // formData.append('variantImage',values.variantImage)
    formData.append('categoryId', values.categoryId)
    formData.append('subCategoryId', values.subCategoryId)
    formData.append('offerTagId', (values.offerTagId as string) || '')
    formData.append('brand', values.brand || '')

    formData.append('shippingFeeMethod', values.shippingFeeMethod || [])
    // if (data?.freeShippingForAllCountries) {
    //   formData.append('freeShippingForAllCountries', 'true')
    // }
    // formData.append(
    //   'freeShippingCountriesIds',
    //   values.freeShippingCountriesIds || []
    // )
    if (data?.freeShippingForAllCountries) {
      formData.append('freeShippingForAllCountries', 'true')
    } else {
      formData.append(
        'freeShippingForAllCountries',
        String(values.freeShippingForAllCountries) || 'false'
      )
    }
    // if (
    //   values.freeShippingCountriesIds &&
    //   values.freeShippingCountriesIds.length > 0
    // ) {
    //   values.freeShippingCountriesIds.forEach((id, index) => {
    //     const res = {
    //       value:id.value,
    //       label:id.label
    //     }
    //     // Append the 'value' property of the country object
    //     formData.append(`freeShippingCountriesIds`, {...res})
    //   })
    // }

    if (
      values.freeShippingCountriesIds &&
      values.freeShippingCountriesIds.length > 0
    ) {
      for (let i = 0; i < values.freeShippingCountriesIds.length; i++) {
        formData.append(
          'freeShippingCountriesIds',
          values.freeShippingCountriesIds[i].value
        )
      }
    }
    if (values.images && values.images.length > 0) {
      for (let i = 0; i < values.images.length; i++) {
        formData.append('images', values.images[i] as string | Blob)
      }
    }

    if (values.questions && values.questions.length > 0) {
      values.questions.forEach((questions) => {
        if (
          questions.question.trim() !== '' ||
          questions.answer.trim() !== ''
        ) {
          formData.append('questions', JSON.stringify(questions))
        }
      })
    }

    if (values.product_specs && values.product_specs.length > 0) {
      values.product_specs.forEach((spec) => {
        if (spec.name.trim() !== '' || spec.value.trim() !== '') {
          // Ensure non-empty product_specs
          formData.append('product_specs', JSON.stringify(spec))
        }
      })
    }

    try {
      if (data) {
        startTransition(async () => {
          try {
            const res = await editProduct(formData, data.id as string, path)
            // console.log({ res })
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
            } else if (res?.errors?.product_specs) {
              form.setError('product_specs', {
                type: 'custom',
                message: res?.errors.product_specs?.join(' و '),
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
      } else {
        startTransition(async () => {
          try {
            const res = await createNewProduct(formData, storeUrl, path)
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
            } else if (res?.errors?.product_specs) {
              form.setError('product_specs', {
                type: 'custom',
                message: res?.errors.product_specs?.join(' و '),
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

  const countryOptions: Option[] = countries.map((c) => ({
    label: c.name,
    value: c.id,
  }))
  const cityOptions: Option[] = citiesForFreeShipping?.map((c) => ({
    label: c.name,
    value: c.id,
  }))

  const handleDeleteCountryFreeShipping = (index: number) => {
    const currentValues = form.getValues().freeShippingCountriesIds
    const updatedValues = currentValues.filter((_, i) => i !== index)
    form.setValue('freeShippingCountriesIds', updatedValues)
  }
  const handleDeleteCityFreeShipping = (index: number) => {
    const currentValues = form.getValues().freeShippingCityIds
    const updatedValues = currentValues.filter((_, i) => i !== index)
    form.setValue('freeShippingCityIds', updatedValues)
  }

  useEffect(() => {
    form.resetField('freeShippingCityIds')
    // form.setValue('questions', questions)
  }, [provinceNameForShopping])
  // useEffect(() => {
  //   form.setValue('product_specs', productSpecs)
  //   form.setValue('questions', questions)
  // }, [form, productSpecs, questions])

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a new product</CardTitle>
          <CardDescription>
            {data?.id
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
              <div className="w-60 h-60 mb-16">
                <InputFileUpload
                  className="w-full"
                  // initialDataImages={
                  //   data?.variantImage ? data?.variantImage : []
                  // }
                  initialDataImages={
                    data?.images
                      ? data.images.filter(
                          (image): image is NonNullable<typeof image> =>
                            image !== undefined
                        )
                      : []
                  }
                  name="images"
                  label="images"
                />
              </div>

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
                  "Note: The product description is the main description for the product (Will display in every variant page). You can add an extra description specific to this variant using 'Variant description' tab."
                }
              >
                <FormField
                  disabled={isPending}
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        {/* <JoditEditor
                          {...field}
                          ref={productDescEditor}
                          config={config}
                          value={form.getValues().description}
                          onChange={(content) => {
                            form.setValue('description', content)
                          }}
                        /> */}
                        <RichTextEditor
                          {...field}
                          // config={config}

                          content={field.value}
                          onChange={field.onChange}
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
              {/* Category - SubCategory - offer*/}

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
              <InputFieldset label={'Brand, Sku, Weight'}>
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
                </div>
              </InputFieldset>

              {/* Product and variant specs*/}
              <InputFieldset
                label="Specifications"
                description={
                  "Note: The product specifications are the main specs for the product (Will display in every variant page). You can add extra specs specific to this variant using 'Variant Specifications' tab."
                }
              >
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputsRHF
                    fields={specFields}
                    name="product_specs"
                    control={form.control}
                    register={form.register}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    onAppend={() => appendSpec({ name: '', value: '' })}
                    onRemove={removeSpec}
                    initialDetailSchema={{ name: '', value: '' }}
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
              {/* Questions*/}

              <InputFieldset label="Questions & Answers">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputsRHF
                    fields={questionFields}
                    name="questions"
                    control={form.control}
                    register={form.register}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    onAppend={() =>
                      appendQuestion({ question: '', answer: '' })
                    }
                    onRemove={removeQuestion}
                    initialDetailSchema={{ question: '', answer: '' }}
                    // details={questions}
                    // setDetails={setQuestions}
                    // initialDetail={{
                    //   question: '',
                    //   answer: '',
                    // }}
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

              {/* Shipping fee method */}

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

              {/* Fee Shipping */}

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
                                placeholder="Select country you like..."
                                emptyIndicator={
                                  <p className="text-center text-lg leading-10  ">
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
                <div className=" flex gap-2">
                  <Select
                    onValueChange={(v) => setProvinceNameForShopping(v)}
                    defaultValue={provinceNameForShopping}
                    value={provinceNameForShopping}
                  >
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a Province" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces?.map((province) => (
                        <SelectItem
                          key={province.id}
                          value={province.id.toString()}
                        >
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <FormField
                      control={form.control}
                      name="freeShippingCityIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <MultipleSelector
                              disabled={
                                isPendingCitiesForFreeShipping &&
                                !provinceNameForShopping
                              }
                              {...field}
                              // value={field?.value}
                              // onChange={field.onChange}
                              defaultOptions={cityOptions}
                              placeholder="Select City"
                              emptyIndicator={
                                <p className="text-center text-lg leading-10  ">
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
                      List of cities you offer free shipping for this product
                      :&nbsp;
                      {form.getValues().freeShippingCityIds &&
                        form.getValues().freeShippingCityIds.length === 0 &&
                        'None'}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {form
                        .getValues()
                        .freeShippingCityIds?.map((country, index) => (
                          <div
                            key={country.label}
                            className="text-xs inline-flex items-center px-3 py-1 rounded-md gap-x-2"
                          >
                            <span>{country.label}</span>
                            <span
                              className="cursor-pointer hover:text-red-500"
                              onClick={() =>
                                handleDeleteCityFreeShipping(index)
                              }
                            >
                              x
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </InputFieldset>

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : data?.id
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

export default ProductForm
