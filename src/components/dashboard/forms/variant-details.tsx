'use client'
import { zodResolver } from '@hookform/resolvers/zod'

// import InputFileUpload from '@/components/shared/InputFileUpload'
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
import { Switch } from '@/components/ui/switch'
import { createNewVariant, editVariant } from '@/lib/actions/dashboard/products'
import { VariantFormSchema } from '@/lib/schemas/dashboard'
import { usePathname } from '@/navigation'
import { Color, Image, ProductVariant, Size, Spec } from '@prisma/client'
import { NumberInput } from '@tremor/react'
import { useTheme } from 'next-themes'
import { FC, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import ClickToAddInputs from '../click-to-add'
import { ImageInput } from '../image-input'
import InputFieldset from '../input-fieldset'
// import { useQueryState } from 'nuqs'
import { DateTimePicker } from '@/components/shared/date-time-picker'
import { TagsInput } from '@/components/shared/tag-input'

interface VariantDetailsProps {
  // data?: Product & {
  //   variants: (ProductVariant & { images: Image[] } & { sizes: Size[] } & {
  //     colors: Color[]
  //   })[]
  // } & { category: { id: string } } & { store: { id: string } } & {
  //   cover: Image[] | null
  // }
  data?:
    | ProductVariant & { variantImage: Image[] | null } & {
        colors: Color[] | null
      } & { sizes: Size[] | null } & { specs: Spec[] | null }

  productId: string
}

const VariantDetails: FC<VariantDetailsProps> = ({ data, productId }) => {
  // console.log(data?.colors)
  const variantId = data?.id
  const path = usePathname()

  const [isPending, startTransition] = useTransition()

  // Jodit editor refs
  // const productDescEditor = useRef(null)
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

  // State for product variant specs
  // const [variantSpecs, setVariantSpecs] = useState<
  //   { name: string; value: string }[]
  // >(data?.variantSpecs, setVariantSpecs || [{ name: '', value: '' }])
  const [variantSpecs, setVariantSpecs] = useState<
    { name: string; value: string }[]
  >(
    data?.specs
      ? data?.specs
          .filter(
            (specs): specs is NonNullable<typeof specs> => specs !== undefined
          )
          .map(({ name, value }) => ({ name, value }))
      : [{ name: '', value: '' }]
  )

  const form = useForm<z.infer<typeof VariantFormSchema>>({
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      variantName: data?.variantName,
      variantDescription: data?.variantDescription || '',
      variantName_fa: data?.variantName_fa || '',
      variantDescription_fa: data?.variantDescription_fa || '',
      variantImage: data?.variantImage || [],
      keywords: [data?.keywords],
      keywords_fa: [data?.keywords_fa || ''],
      sku: data?.sku,
      // colors: data?.colors,
      colors: data?.colors?.map((clr) => {
        return {
          color: clr?.name,
        }
      }),
      sizes: data?.sizes
        ? data.sizes.map(({ size, quantity, price, discount }) => ({
            size,
            quantity,
            price,
            discount,
          }))
        : undefined,
      specs: data?.specs ? data.specs.map((spec) => spec) : undefined,

      isSale: data?.isSale || false,
      weight: data?.weight,
      saleEndDate:
        data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })

  const errors = form.formState.errors
  console.log({ errors })

  // // Loading status based on form submission
  // const isPending = form.formState.isSubmitting

  useEffect(() => {
    if (data) {
      form.reset({
        variantName: data?.variantName,
        variantDescription: data?.variantDescription || '',
        variantName_fa: data?.variantName_fa || '',
        variantDescription_fa: data?.variantDescription_fa || '',
        variantImage: data?.variantImage || [],

        sku: data?.sku,
        // colors: data?.colors,
        colors: data?.colors?.map((clr) => {
          return {
            color: clr?.name,
          }
        }),
        sizes: data?.sizes
          ? data.sizes.map(({ size, quantity, price, discount }) => ({
              size,
              quantity,
              price,
              discount,
            }))
          : undefined,
        specs: data?.specs ? data.specs.map((spec) => spec) : undefined,
        keywords: data?.keywords.split(','),
        keywords_fa: data?.keywords_fa?.split(',') || [],
        isSale: data?.isSale || false,
        weight: data?.weight,
        saleEndDate:
          data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
      })
    }
  }, [data, form])

  const handleSubmit = async (data: z.infer<typeof VariantFormSchema>) => {
    const formData = new FormData()

    // console.log({ data })

    formData.append('variantName', data.variantName)
    formData.append('variantDescription', data.variantDescription || '')

    formData.append('variantName_fa', data.variantName_fa || '')
    formData.append('variantDescription_fa', data.variantDescription_fa || '')

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

    formData.append('sku', data.sku || '')

    formData.append('weight', String(data.weight))

    if (data.keywords && data.keywords.length > 0) {
      for (let i = 0; i < data.keywords.length; i++) {
        formData.append('keywords', data.keywords[i] as string | Blob)
      }
    }

    if (data.variantImage && data.variantImage.length > 0) {
      for (let i = 0; i < data.variantImage.length; i++) {
        formData.append('variantImage', data.variantImage[i] as string | Blob)
      }
    }

    if (data.specs && data.specs.length > 0) {
      data.specs.forEach((size) => {
        formData.append('specs', JSON.stringify(size))
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

    startTransition(async () => {
      if (variantId) {
        try {
          const res = await editVariant(formData, variantId, productId, path)
          if (res?.errors?.variantName) {
            form.setError('variantName', {
              type: 'custom',
              message: res?.errors.variantName?.join(' و '),
            })
          } else if (res?.errors?.variantDescription) {
            form.setError('variantDescription', {
              type: 'custom',
              message: res?.errors.variantDescription?.join(' و '),
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
          } else if (res?.errors?.variantImage) {
            form.setError('variantImage', {
              type: 'custom',
              message: res?.errors.variantImage?.join(' و '),
            })
          } else if (res?.errors?.sku) {
            form.setError('sku', {
              type: 'custom',
              message: res?.errors.sku?.join(' و '),
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
          } else if (res?.errors?.specs) {
            form.setError('specs', {
              type: 'custom',
              message: res?.errors.specs?.join(' و '),
            })
          } else if (res?.errors?.isSale) {
            form.setError('isSale', {
              type: 'custom',
              message: res?.errors.isSale?.join(' و '),
            })
          } else if (res?.errors?.weight) {
            form.setError('weight', {
              type: 'custom',
              message: res?.errors.weight?.join(' و '),
            })
          } else if (res?.errors?.saleEndDate) {
            form.setError('saleEndDate', {
              type: 'custom',
              message: res?.errors.saleEndDate?.join(' و '),
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
      } else {
        try {
          const res = await createNewVariant(formData, productId, path)
          if (res?.errors?.variantName) {
            form.setError('variantName', {
              type: 'custom',
              message: res?.errors.variantName?.join(' و '),
            })
          } else if (res?.errors?.variantDescription) {
            form.setError('variantDescription', {
              type: 'custom',
              message: res?.errors.variantDescription?.join(' و '),
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
          } else if (res?.errors?.variantImage) {
            form.setError('variantImage', {
              type: 'custom',
              message: res?.errors.variantImage?.join(' و '),
            })
          } else if (res?.errors?.sku) {
            form.setError('sku', {
              type: 'custom',
              message: res?.errors.sku?.join(' و '),
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
          } else if (res?.errors?.specs) {
            form.setError('specs', {
              type: 'custom',
              message: res?.errors.specs?.join(' و '),
            })
          } else if (res?.errors?.isSale) {
            form.setError('isSale', {
              type: 'custom',
              message: res?.errors.isSale?.join(' و '),
            })
          } else if (res?.errors?.weight) {
            form.setError('weight', {
              type: 'custom',
              message: res?.errors.weight?.join(' و '),
            })
          } else if (res?.errors?.saleEndDate) {
            form.setError('saleEndDate', {
              type: 'custom',
              message: res?.errors.saleEndDate?.join(' و '),
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
      }
    })
    // }
    // } catch {
    //   toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    // }
  }

  useEffect(() => {
    form.setValue('colors', colors)
    form.setValue('sizes', sizes)
    form.setValue('specs', variantSpecs)
  }, [colors, form, sizes, variantSpecs])
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
          <CardTitle>{`Edit variant ${data?.variantName}`}</CardTitle>
          <CardDescription>
            {data?.productId && data.id
              ? `Update ${data?.variantName} variant information.`
              : ' Lets create a variant. You can edit variant later from the variant page.'}
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
                  name="variantImage"
                  label="Variant Image"
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
              <InputFieldset label="Sizes,  Prices, Disocunts">
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
              <InputFieldset label="Description">
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
              </InputFieldset>
              {/* Category - SubCategory - offer*/}

              {/* Brand, Sku, Weight */}
              <InputFieldset label={'Sku, Weight'}>
                <div className="flex flex-col lg:flex-row gap-4">
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
                {/* <div className="w-60 h-60">
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
                </div> */}
                <div className="w-full flex-1 space-y-3">
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem className="relative flex-1">
                        <FormLabel>variant Keywords</FormLabel>
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
              <InputFieldset label="specs" description={''}>
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
                  {errors.specs && (
                    <span className="text-sm font-medium text-destructive">
                      {errors.specs.message}
                    </span>
                  )}
                </div>
              </InputFieldset>

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

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : data?.productId && data.id
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

export default VariantDetails
