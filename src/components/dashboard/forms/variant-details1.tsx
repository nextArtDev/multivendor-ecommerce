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
import { FieldArrayWithId, useFieldArray, useForm } from 'react-hook-form'
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

import { ImageInput } from '../image-input'
import InputFieldset from '../input-fieldset'
// import { useQueryState } from 'nuqs'
import { DateTimePicker } from '@/components/shared/date-time-picker'
import { TagsInput } from '@/components/shared/tag-input'
import RichTextEditor from '../text-editor/react-text-editor'
import ClickToAddInputsRHF from '../click-to-add'

interface VariantDetailsProps {
  data?: ProductVariant & { variantImage: Image[] | null } & {
    colors: Color[] | null
  } & { sizes: Size[] | null } & { specs: Spec[] | null }
  productId: string
}

const VariantDetails: FC<VariantDetailsProps> = ({ data, productId }) => {
  const variantId = data?.id
  const path = usePathname()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof VariantFormSchema>>({
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      variantName: data?.variantName ?? '',
      variantDescription: data?.variantDescription || '',
      variantName_fa: data?.variantName_fa || '',
      variantDescription_fa: data?.variantDescription_fa || '',
      variantImage: data?.variantImage || [],
      keywords: data?.keywords ? data.keywords.split(',') : [],
      keywords_fa: data?.keywords_fa ? data.keywords_fa.split(',') : [],
      sku: data?.sku ?? '',
      colors: data?.colors?.map((clr) => ({ color: clr.name })) ?? [
        { color: '' },
      ],
      sizes: data?.sizes?.map(({ size, price, quantity, discount }) => ({
        size,
        price,
        quantity,
        discount,
      })) ?? [{ size: '', quantity: 1, price: 1000, discount: 0 }],
      specs: data?.specs?.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })) ?? [{ name: '', value: '' }],
      isSale: data?.isSale || false,
      weight: data?.weight ?? 0,
      saleEndDate:
        data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control: form.control,
    name: 'colors',
  })

  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: 'sizes',
  })

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control: form.control,
    name: 'specs',
  })

  // Effect to reset form when 'data' prop changes (for editing)
  useEffect(() => {
    if (data) {
      form.reset({
        variantName: data.variantName ?? '',
        variantDescription: data.variantDescription || '',
        variantName_fa: data.variantName_fa || '',
        variantDescription_fa: data.variantDescription_fa || '',
        variantImage: data.variantImage || [],
        sku: data.sku ?? '',
        colors: data.colors?.map((clr) => ({ color: clr.name })) ?? [], // Reset to empty if no data colors
        sizes:
          data.sizes?.map(({ size, quantity, price, discount }) => ({
            size,
            quantity,
            price,
            discount,
          })) ?? [], // Reset to empty if no data sizes
        specs:
          data.specs?.map((spec) => ({ name: spec.name, value: spec.value })) ??
          [], // Reset to empty if no data specs
        keywords: data.keywords ? data.keywords.split(',') : [],
        keywords_fa: data.keywords_fa ? data.keywords_fa.split(',') : [],
        isSale: data.isSale || false,
        weight: data.weight ?? 0,
        saleEndDate:
          data.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
      })
    } else {
      // For create mode, ensure default structure (or rely on useForm's defaultValues)
      form.reset({
        variantName: '',
        variantDescription: '',
        variantName_fa: '',
        variantDescription_fa: '',
        variantImage: [],
        sku: '',
        colors: [{ color: '' }],
        sizes: [{ size: '', quantity: 1, price: 1000, discount: 0 }],
        specs: [{ name: '', value: '' }],
        keywords: [],
        keywords_fa: [],
        isSale: false,
        weight: 0,
        saleEndDate: new Date(new Date().setHours(0, 0, 0, 0)),
      })
    }
  }, [data, form.reset])

  const handleSubmit = async (values: z.infer<typeof VariantFormSchema>) => {
    const formData = new FormData()

    // console.log({ data })

    formData.append('variantName', values.variantName)
    formData.append('variantDescription', values.variantDescription || '')

    formData.append('variantName_fa', values.variantName_fa || '')
    formData.append('variantDescription_fa', values.variantDescription_fa || '')

    if (values.isSale) {
      formData.append('isSale', 'true')
    }
    const saleEndDate =
      values?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0))

    const saleEndDateString =
      saleEndDate instanceof Date ? saleEndDate.toISOString() : saleEndDate
    // formData.append(
    //   'saleEndDate',
    //   data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0))
    // )
    formData.append('saleEndDate', saleEndDateString)

    formData.append('sku', values.sku || '')

    formData.append('weight', String(values.weight))

    if (values.keywords && values.keywords.length > 0) {
      for (let i = 0; i < values.keywords.length; i++) {
        formData.append('keywords', values.keywords[i] as string | Blob)
      }
    }

    if (values.variantImage && values.variantImage.length > 0) {
      for (let i = 0; i < values.variantImage.length; i++) {
        formData.append('variantImage', values.variantImage[i] as string | Blob)
      }
    }

    // Append arrays correctly (React Hook Form provides them as proper arrays)
    if (values.colors && values.colors.length > 0) {
      values.colors.forEach((color) => {
        if (color.color.trim() !== '') {
          // Ensure non-empty colors are sent
          formData.append('colors', JSON.stringify(color))
        }
      })
    }
    if (values.sizes && values.sizes.length > 0) {
      values.sizes.forEach((size) => {
        if (size.size.trim() !== '') {
          // Ensure non-empty sizes are sent
          formData.append('sizes', JSON.stringify(size))
        }
      })
    }
    if (values.specs && values.specs.length > 0) {
      values.specs.forEach((spec) => {
        if (spec.name.trim() !== '' || spec.value.trim() !== '') {
          // Ensure non-empty specs
          formData.append('specs', JSON.stringify(spec))
        }
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
            ;(
              Object.keys(res.errors) as Array<keyof typeof res.errors>
            ).forEach((key) => {
              if (key !== '_form' && res.errors![key]) {
                form.setError(key as any, {
                  type: 'custom',
                  message: res.errors![key]?.join(' و '),
                })
              }
            })
          } else if (!res?.errors) {
            // toast.success("Variant updated successfully!"); // Optional success message
          }
        } catch (error) {
          if (
            !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
          ) {
            toast.error('مشکلی پیش آمده در ویرایش.')
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
            ;(
              Object.keys(res.errors) as Array<keyof typeof res.errors>
            ).forEach((key) => {
              if (key !== '_form' && res.errors![key]) {
                form.setError(key as any, {
                  type: 'custom',
                  message: res.errors![key]?.join(' و '),
                })
              }
            })
          } else if (!res?.errors) {
            // toast.success("Variant created successfully!"); // Optional success message
          }
        } catch (error) {
          if (
            !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
          ) {
            toast.error('مشکلی پیش آمده .')
          }
        }
      }
    })
  }
  const addMainVariantColor = (newColorValue: string) => {
    const exists = colorFields.some((cf) => cf.color === newColorValue)
    if (!exists && newColorValue && newColorValue.trim() !== '') {
      appendColor({ color: newColorValue })
    } else if (exists) {
      toast.info(`Color ${newColorValue} already exists.`)
    }
  }
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
                {/* <ImageInput
                  name="variantImage" // RHF name for the image field itself
                  label="Variant Image"
                  // If ImageInput needs to interact with the `colors` FieldArray:
                  // colorFields={colorFields}
                  // appendColor={appendColor}
                  // removeColor={removeColor}
                  // setValue={form.setValue} // To set color associations if any
                /> */}
                <ImageInput
                  name="variantImage"
                  label="Variant Images"
                  initialDataImages={data?.variantImage}
                  mainVariantColors={
                    colorFields as unknown as FieldArrayWithId<
                      any,
                      'colors',
                      'id'
                    >[]
                  }
                  addMainVariantColor={addMainVariantColor}
                />

                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                  <ClickToAddInputsRHF
                    fields={colorFields}
                    name="colors"
                    control={form.control}
                    register={form.register}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    onAppend={() => appendColor({ color: '' })}
                    onRemove={removeColor}
                    initialDetailSchema={{ color: '' }}
                    header="Colors"
                    colorPicker
                  />
                  {form.formState.errors.colors && (
                    <span className="text-sm font-medium text-destructive">
                      {form.formState.errors.colors.message ||
                        form.formState.errors.colors.root?.message}
                    </span>
                  )}
                </div>
              </div>
              {/* sizes */}
              <InputFieldset label="Sizes, Prices, Discounts">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputsRHF
                    fields={sizeFields}
                    name="sizes"
                    control={form.control}
                    register={form.register}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    onAppend={() =>
                      appendSize({
                        size: '',
                        quantity: 1,
                        price: 1000,
                        discount: 0,
                      })
                    }
                    onRemove={removeSize}
                    initialDetailSchema={{
                      size: '',
                      quantity: 1,
                      price: 1000,
                      discount: 0,
                    }}
                  />
                  {form.formState.errors.sizes && (
                    <span className="text-sm font-medium text-destructive">
                      {form.formState.errors.sizes.message ||
                        form.formState.errors.sizes.root?.message}
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
                        <RichTextEditor
                          {...field}
                          content={field.value || ''}
                          onChange={field.onChange}
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
              <InputFieldset label="Specs">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddInputsRHF
                    fields={specFields}
                    name="specs"
                    control={form.control}
                    register={form.register}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    onAppend={() => appendSpec({ name: '', value: '' })}
                    onRemove={removeSpec}
                    initialDetailSchema={{ name: '', value: '' }}
                  />
                  {form.formState.errors.specs && (
                    <span className="text-sm font-medium text-destructive">
                      {form.formState.errors.specs.message ||
                        form.formState.errors.specs.root?.message}
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
