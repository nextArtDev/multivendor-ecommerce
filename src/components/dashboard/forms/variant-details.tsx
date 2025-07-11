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
import ClickToAddInputs from '../click-to-add'
import { ImageInput } from '../image-input'
import InputFieldset from '../input-fieldset'
// import { useQueryState } from 'nuqs'
import { DateTimePicker } from '@/components/shared/date-time-picker'
import { TagsInput } from '@/components/shared/tag-input'
import RichTextEditor from '../text-editor/react-text-editor'
import ClickToAddInputsRHF from '../click-to-add'

// Define the type for the items in the 'colors' field array directly or infer from Zod
export type VariantColorFormItem = { id?: string; color: string }

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
      variantImage:
        data?.variantImage?.map((img) => ({
          url: img.url,
          file: undefined,
          id: img.id,
        })) || [], // Adapt structure if needed
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
      saleEndDate: data?.saleEndDate
        ? new Date(data.saleEndDate)
        : new Date(new Date().setHours(0, 0, 0, 0)),
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

  useEffect(() => {
    if (data) {
      form.reset({
        variantName: data.variantName ?? '',
        variantDescription: data.variantDescription || '',
        variantName_fa: data.variantName_fa || '',
        variantDescription_fa: data.variantDescription_fa || '',
        variantImage:
          data.variantImage?.map((img) => ({
            url: img.url,
            file: undefined,
            id: img.id,
          })) || [],
        sku: data.sku ?? '',
        colors: data.colors?.map((clr) => ({ color: clr.name })) ?? [],
        sizes:
          data.sizes?.map(({ size, quantity, price, discount }) => ({
            size,
            quantity,
            price,
            discount,
          })) ?? [],
        specs:
          data.specs?.map((spec) => ({ name: spec.name, value: spec.value })) ??
          [],
        keywords: data.keywords ? data.keywords.split(',') : [],
        keywords_fa: data.keywords_fa ? data.keywords_fa.split(',') : [],
        isSale: data.isSale || false,
        weight: data.weight ?? 0,
        saleEndDate: data.saleEndDate
          ? new Date(data.saleEndDate)
          : new Date(new Date().setHours(0, 0, 0, 0)),
      })
    } else {
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
    console.log({ values })
    const formData = new FormData()

    formData.append('variantName', values.variantName)
    formData.append('variantDescription', values.variantDescription || '')
    formData.append('variantName_fa', values.variantName_fa || '')
    formData.append('variantDescription_fa', values.variantDescription_fa || '')

    if (values.isSale) formData.append('isSale', 'true')
    const saleEndDateValue =
      values.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0))
    formData.append(
      'saleEndDate',
      saleEndDateValue instanceof Date
        ? saleEndDateValue.toISOString()
        : saleEndDateValue
    )

    formData.append('sku', values.sku || '')
    formData.append('weight', String(values.weight || 0))

    values.keywords?.forEach((kw) => formData.append('keywords', kw))
    values.keywords_fa?.forEach((kw) => formData.append('keywords_fa', kw))

    if (values.variantImage && values.variantImage.length > 0) {
      for (let i = 0; i < values.variantImage.length; i++) {
        formData.append('variantImage', values.variantImage[i] as string | Blob)
      }
    }

    values.colors?.forEach((color) => {
      if (color.color && color.color.trim() !== '') {
        formData.append('colors', JSON.stringify(color))
      }
    })
    values.sizes?.forEach((size) => {
      if (size.size && size.size.trim() !== '') {
        formData.append('sizes', JSON.stringify(size))
      }
    })
    values.specs?.forEach((spec) => {
      if (
        (spec.name && spec.name.trim() !== '') ||
        (spec.value && spec.value.trim() !== '')
      ) {
        formData.append('specs', JSON.stringify(spec))
      }
    })

    startTransition(async () => {
      try {
        const action = variantId ? editVariant : createNewVariant
        const response = variantId
          ? // @ts-ignore
            await action(formData, variantId, productId, path)
          : // @ts-ignore
            await action(formData, productId, path)

        if (response?.errors) {
          if (response.errors._form) {
            toast.error(response.errors._form.join(' و '))
          }
          ;(
            Object.keys(response.errors) as Array<keyof typeof response.errors>
          ).forEach((key) => {
            if (key !== '_form' && response.errors![key]) {
              // For array fields, RHF might need errors like 'colors.root' or 'colors[0].color'
              // Adjust if your server action provides indexed errors for arrays.
              form.setError(key as any, {
                type: 'custom',
                message: response.errors![key]?.join(' و '),
              })
            }
          })
        } else if (response?.success || !response?.errors) {
          // Success is implicit if no errors and redirect happens, or if success message is present
          toast.success(
            response?.success ||
              (variantId ? 'Variant updated!' : 'Variant created!')
          )
          // Redirect is handled by server action
        }
      } catch (error) {
        if (
          !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
        ) {
          toast.error('An unexpected error occurred.')
          console.error(error)
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
      {' '}
      {/* Assuming AlertDialog is used as a general wrapper or for potential modals */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {variantId
              ? `Edit Variant: ${data?.variantName || ''}`
              : 'Create New Variant'}
          </CardTitle>
          <CardDescription>
            {variantId
              ? `Update information for ${data?.variantName || 'the variant'}.`
              : 'Provide details for the new variant.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6" // Increased spacing
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="space-y-4">
                  <ClickToAddInputsRHF
                    fields={
                      colorFields as unknown as FieldArrayWithId<
                        any,
                        'colors',
                        'id'
                      >[]
                    }
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
                        (form.formState.errors.colors as any)?.root?.message}
                    </span>
                  )}
                </div>
              </div>

              <InputFieldset label="Sizes, Prices, Discounts">
                <ClickToAddInputsRHF
                  fields={
                    sizeFields as unknown as FieldArrayWithId<
                      any,
                      'sizes',
                      'id'
                    >[]
                  }
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
                      (form.formState.errors.sizes as any)?.root?.message}
                  </span>
                )}
              </InputFieldset>

              <InputFieldset label="Names">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="variantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Name (English)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Red T-Shirt Large"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="variantName_fa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Variant Name (Farsi)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثال: تیشرت قرمز بزرگ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

              <InputFieldset label="Descriptions">
                <FormField
                  control={form.control}
                  name="variantDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (English)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="variantDescription_fa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Farsi)</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </InputFieldset>

              <InputFieldset label="SKU & Weight">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Stock Keeping Unit"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
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

              <InputFieldset label="Keywords">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="keywords_fa"
                    render={({ field }) => (
                      <FormItem className="relative flex-1">
                        <FormLabel>variant Keywords</FormLabel>
                        <FormControl>
                          <TagsInput
                            maxItems={10}
                            value={field?.value || []}
                            onValueChange={field.onChange}
                            placeholder="اضافه کردن تا ۱۰ کلمه کلیدی"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </InputFieldset>

              <InputFieldset label="Specifications">
                <ClickToAddInputsRHF
                  fields={
                    specFields as unknown as FieldArrayWithId<
                      any,
                      'specs',
                      'id'
                    >[]
                  }
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
                      (form.formState.errors.specs as any)?.root?.message}
                  </span>
                )}
              </InputFieldset>

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
                </div>
              </InputFieldset>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full md:w-auto"
              >
                {isPending
                  ? 'Saving...'
                  : variantId
                  ? 'Update Variant'
                  : 'Create Variant'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default VariantDetails
