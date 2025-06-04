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
// import JoditEditor from 'jodit-react' // Assuming RichTextEditor is used instead
import { useForm, useFieldArray, Controller } from 'react-hook-form' // Import useFieldArray and Controller
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
// import { useTheme } from 'next-themes' // Not used in the provided snippet
import {
  FC,
  useEffect,
  /* useMemo, useRef, */ useState,
  useTransition,
} from 'react' // Removed unused imports
// import ClickToAddInputs from '../click-to-add' // This will be the refactored version
// Placeholder for refactored ClickToAddInputs
import { ImageInput } from '../image-input'
import InputFieldset from '../input-fieldset'
import { DateTimePicker } from '@/components/shared/date-time-picker'
import { TagsInput } from '@/components/shared/tag-input'
import RichTextEditor from '../text-editor/react-text-editor'
import ClickToAddRHFInputs from '../click-to-add'

interface VariantDetailsProps {
  data?:
    | ProductVariant & { variantImage: Image[] | null } & {
        colors: Color[] | null // Keep this for data prop type
      } & { sizes: Size[] | null } & { specs: Spec[] | null }
  productId: string
}

// Define the shape of your form values, including field arrays
type VariantFormValues = z.infer<typeof VariantFormSchema>

const VariantDetails: FC<VariantDetailsProps> = ({ data, productId }) => {
  const variantId = data?.id
  const path = usePathname()
  const [isPending, startTransition] = useTransition()

  // REMOVE useState for colors, sizes, specs
  // const [colors, setColors] = useState(...)
  // const [sizes, setSizes] = useState(...)
  // const [variantSpecs, setVariantSpecs] = useState(...)

  const form = useForm<VariantFormValues>({
    // Use the defined type
    resolver: zodResolver(VariantFormSchema),
    defaultValues: {
      variantName: data?.variantName || '',
      variantDescription: data?.variantDescription || '',
      variantName_fa: data?.variantName_fa || '',
      variantDescription_fa: data?.variantDescription_fa || '',
      variantImage: data?.variantImage || [],
      keywords: data?.keywords ? data.keywords.split(',') : [],
      keywords_fa: data?.keywords_fa ? data.keywords_fa.split(',') : [],
      sku: data?.sku || '',
      colors: data?.colors?.map((clr) => ({ color: clr.name })) ?? [
        { color: '' },
      ], // Default to one empty color if no data
      sizes: data?.sizes?.map((s) => ({
        size: s.size,
        price: s.price,
        quantity: s.quantity,
        discount: s.discount,
      })) ?? [{ size: '', quantity: 1, price: 1000, discount: 0 }], // Default for sizes
      specs: data?.specs?.map((spec) => ({
        name: spec.name,
        value: spec.value,
      })) ?? [{ name: '', value: '' }], // Default for specs
      isSale: data?.isSale || false,
      weight: data?.weight || 0,
      saleEndDate:
        data?.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
    },
  })

  const { control } = form // Get control from RHF

  // Field array for Colors
  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: 'colors',
  })

  // Field array for Sizes
  const {
    fields: sizeFields,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control,
    name: 'sizes',
  })

  // Field array for Specs
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: 'specs',
  })

  const errors = form.formState.errors
  // console.log({ errors }) // Keep for debugging if needed

  useEffect(() => {
    if (data) {
      form.reset({
        variantName: data.variantName || '',
        variantDescription: data.variantDescription || '',
        variantName_fa: data.variantName_fa || '',
        variantDescription_fa: data.variantDescription_fa || '',
        variantImage: data.variantImage || [],
        sku: data.sku || '',
        colors: data.colors?.map((clr) => ({ color: clr.name })) ?? [], // Use ?? [] if data.colors can be null/undefined
        sizes:
          data.sizes?.map((s) => ({
            size: s.size,
            price: s.price,
            quantity: s.quantity,
            discount: s.discount,
          })) ?? [],
        specs:
          data.specs?.map((spec) => ({ name: spec.name, value: spec.value })) ??
          [],
        keywords: data.keywords ? data.keywords.split(',') : [],
        keywords_fa: data.keywords_fa ? data.keywords_fa.split(',') : [],
        isSale: data.isSale || false,
        weight: data.weight || 0,
        saleEndDate:
          data.saleEndDate || new Date(new Date().setHours(0, 0, 0, 0)),
      })
    } else {
      // Reset to initial empty/default state for "create" mode
      form.reset({
        variantName: '',
        variantDescription: '',
        variantName_fa: '',
        variantDescription_fa: '',
        variantImage: [],
        sku: '',
        colors: [{ color: '' }], // Default with one empty item
        sizes: [{ size: '', quantity: 1, price: 1000, discount: 0 }], // Default with one empty item
        specs: [{ name: '', value: '' }], // Default with one empty item
        keywords: [],
        keywords_fa: [],
        isSale: false,
        weight: 0,
        saleEndDate: new Date(new Date().setHours(0, 0, 0, 0)),
      })
    }
  }, [data, form.reset]) // form.reset is stable, so data is the main dependency

  const handleSubmit = async (values: VariantFormValues) => {
    // values are from RHF
    const formData = new FormData()

    formData.append('variantName', values.variantName)
    formData.append('variantDescription', values.variantDescription || '')
    formData.append('variantName_fa', values.variantName_fa || '')
    formData.append('variantDescription_fa', values.variantDescription_fa || '')

    if (values.isSale) {
      formData.append('isSale', 'true')
    }
    // Ensure saleEndDate is a string
    const saleEndDateString =
      values.saleEndDate instanceof Date
        ? values.saleEndDate.toISOString()
        : new Date().toISOString()
    formData.append('saleEndDate', saleEndDateString)

    formData.append('sku', values.sku || '')
    formData.append('weight', String(values.weight))

    if (values.keywords && values.keywords.length > 0) {
      values.keywords.forEach((kw) => formData.append('keywords', kw))
    }
    if (values.keywords_fa && values.keywords_fa.length > 0) {
      values.keywords_fa.forEach((kw_fa) =>
        formData.append('keywords_fa', kw_fa)
      )
    }

    if (values.variantImage && values.variantImage.length > 0) {
      for (let i = 0; i < values.variantImage.length; i++) {
        // Assuming variantImage items can be File objects or existing image URLs (strings)
        const img = values.variantImage[i]
        if (typeof img === 'string') {
          // if it's a URL of an existing image
          formData.append(`variantImage[${i}]`, img)
        } else if (img instanceof File) {
          // if it's a new File object
          formData.append('variantImageFiles', img) // Or handle as per backend expectation
        } else if ((img as any).url && typeof (img as any).url === 'string') {
          // If it's an object like { url: string }
          formData.append(`variantImage[${i}]`, (img as any).url)
        }
      }
    }

    // Append arrays directly from RHF values
    if (values.specs && values.specs.length > 0) {
      values.specs.forEach((spec) =>
        formData.append('specs', JSON.stringify(spec))
      )
    }
    if (values.sizes && values.sizes.length > 0) {
      values.sizes.forEach((size) =>
        formData.append('sizes', JSON.stringify(size))
      )
    }
    if (values.colors && values.colors.length > 0) {
      values.colors.forEach((color) =>
        formData.append('colors', JSON.stringify(color))
      )
    }

    // console.log({ valuesFromRHF: values }) // For debugging
    startTransition(async () => {
      try {
        const action = variantId ? editVariant : createNewVariant
        const params = variantId
          ? [formData, variantId, productId, path]
          : [formData, productId, path]
        // @ts-ignore // TODO: Fix type for params if possible
        const res = await action(...params)

        if (res?.errors) {
          // Handle specific field errors
          Object.keys(res.errors).forEach((key) => {
            const fieldKey = key as keyof VariantFormValues
            if (
              form.setError &&
              typeof fieldKey === 'string' &&
              res?.errors[key]
            ) {
              form.setError(fieldKey, {
                type: 'custom',
                message: res?.errors[key]?.join(' و '),
              })
            }
          })
          if (res.errors._form) {
            toast.error(res.errors._form.join(' و '))
          }
        } else if (!variantId && res?.success) {
          // Assuming createNewVariant returns success
          toast.success('Variant created successfully!')
          // Optionally redirect or reset form further
        } else if (variantId && res?.success) {
          // Assuming editVariant returns success
          toast.success('Variant updated successfully!')
        }
      } catch (error) {
        if (
          !(error instanceof Error && error.message.includes('NEXT_REDIRECT'))
        ) {
          toast.error('An unexpected error occurred.')
          console.error('Submission error:', error)
        }
      }
    })
  }

  // REMOVE this useEffect, RHF handles values internally through useFieldArray
  // useEffect(() => {
  //   form.setValue('colors', colors)
  //   form.setValue('sizes', sizes)
  //   form.setValue('specs', variantSpecs)
  // }, [colors, form, sizes, variantSpecs])

  // --- ImageInput and ColorPalette Interaction ---
  // The `ImageInput` props `colors` and `setColors` need careful handling.
  // If `ImageInput` is supposed to *add* to the variant's colors (e.g., from palette extraction),
  // it should use `appendColor` from the `useFieldArray` for colors.
  // For simplicity in this refactor, I'm assuming `ImageInput` might display these colors
  // or use them for naming, but not directly modify them using the old `setColors`.
  // If it needs to add colors, `appendColor` should be passed down.
  // For now, we'll pass `colorFields` to `ImageInput` if it needs to read them,
  // and `appendColor` if it needs to add to them. This depends on ImageInput's internals.

  // Let's assume `ImageInput` might want to *suggest* colors based on image analysis,
  // and clicking a suggestion adds it to the form's `colors` field array.
  // The `ColorPalette` component takes `setColors`. This should become `appendColor`.

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {data?.id
              ? `Edit variant ${data?.variantName}`
              : 'Create New Variant'}
          </CardTitle>
          <CardDescription>
            {data?.id
              ? `Update ${data?.variantName} variant information.`
              : 'Lets create a variant. You can edit variant later from the variant page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <div className="flex flex-col gap-y-6 xl:flex-row">
                {/*
                  TODO: Adapt ImageInput.
                  If ImageInput needs to *add* colors (e.g. from palette), it should use `appendColor`.
                  If it only reads colors, `colorFields` can be passed.
                  This depends on how ImageInput and ColorPalette are designed to interact.
                  For now, I'll remove the problematic `colors` and `setColors` props.
                  You'll need to refactor ImageInput to work with RHF or pass appendColor.
                */}
                <ImageInput
                  name="variantImage" // This should be a RHF Controller field
                  label="Variant Image"
                  colors={colorFields} // If ImageInput just reads them
                  onAddColorFromPalette={(colorValue) =>
                    appendColor({ color: colorValue })
                  } // Example
                />
                <div className="w-full flex flex-col gap-y-3 xl:pl-5">
                  <ClickToAddRHFInputs // Using the placeholder for the refactored component
                    fields={colorFields}
                    append={appendColor}
                    remove={removeColor}
                    control={control}
                    name="colors"
                    initialDetail={{ color: '' }}
                    header="Colors"
                    colorPicker // Prop for ClickToAddRHFInputs if it handles conditional rendering of color picker
                  />
                  {errors.colors && (
                    <span className="text-sm font-medium text-destructive">
                      {/* @ts-ignore TODO: type this error message access */}
                      {errors.colors.message || errors.colors.root?.message}
                    </span>
                  )}
                </div>
              </div>

              <InputFieldset label="Sizes, Prices, Discounts">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddRHFInputs
                    fields={sizeFields}
                    append={appendSize}
                    remove={removeSize}
                    control={control}
                    name="sizes"
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
                      {/* @ts-ignore TODO: type this error message access */}
                      {errors.sizes.message || errors.sizes.root?.message}
                    </span>
                  )}
                </div>
              </InputFieldset>

              <InputFieldset label="Name">
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    disabled={isPending}
                    control={control}
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
                  {/* TODO: Add variantName_fa if it's part of the schema and UI */}
                </div>
              </InputFieldset>

              <InputFieldset label="Description">
                <FormField
                  disabled={isPending}
                  control={control}
                  name="variantDescription"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <RichTextEditor
                          {...field}
                          content={field.value || ''} // Ensure content is string
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* TODO: Add variantDescription_fa if it's part of the schema and UI */}
              </InputFieldset>

              <InputFieldset label={'Sku, Weight'}>
                <div className="flex flex-col lg:flex-row gap-4">
                  <FormField
                    disabled={isPending}
                    control={control}
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
                    control={control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <NumberInput
                            value={field.value} // Use value for controlled component
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

              <div className="w-full flex-1 space-y-3 py-14">
                {' '}
                {/* Simplified keywords section */}
                <FormField
                  control={control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem className="relative flex-1">
                      <FormLabel>Variant Keywords</FormLabel>
                      <FormControl>
                        <TagsInput
                          maxItems={10}
                          value={field.value || []}
                          onValueChange={field.onChange}
                          placeholder="Enter your tags"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* TODO: Add keywords_fa if it's part of the schema and UI */}
              </div>

              <InputFieldset label="Specs">
                <div className="w-full flex flex-col gap-y-3">
                  <ClickToAddRHFInputs
                    fields={specFields}
                    append={appendSpec}
                    remove={removeSpec}
                    control={control}
                    name="specs"
                    initialDetail={{ name: '', value: '' }}
                    containerClassName="flex-1"
                    inputClassName="w-full"
                  />
                  {errors.specs && (
                    <span className="text-sm font-medium text-destructive">
                      {/* @ts-ignore TODO: type this error message access */}
                      {errors.specs.message || errors.specs.root?.message}
                    </span>
                  )}
                </div>
              </InputFieldset>

              <InputFieldset
                label="Sale"
                description="Is your product on sale ?"
              >
                <div className="flex items-center gap-4">
                  {' '}
                  {/* Flex container for switch and date picker */}
                  <FormField
                    control={control}
                    name="isSale"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            aria-readonly={isPending}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('isSale') && ( // Watch the RHF value
                    <Controller // Use Controller for DateTimePicker
                      control={control}
                      name="saleEndDate"
                      render={({ field }) => (
                        <DateTimePicker
                          value={field.value}
                          onChange={field.onChange}
                          // name="saleEndDate" // name prop might not be needed if using Controller
                        />
                      )}
                    />
                  )}
                </div>
                {errors.saleEndDate && (
                  <span className="text-sm font-medium text-destructive">
                    {errors.saleEndDate.message}
                  </span>
                )}
              </InputFieldset>

              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Loading...'
                  : data?.id
                  ? 'Save Variant Information'
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
