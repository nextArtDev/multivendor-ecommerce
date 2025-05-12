'use client'

// React
import { FC, useEffect, useTransition } from 'react'

// Prisma model
import { Image, SubCategory } from '@prisma/client'

// Form handling utilities
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Schema
import { SubCategoryFormSchema } from '@/lib/schemas/dashboard'

// UI Components
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Queries

// Utils

import InputFileUpload from '@/components/shared/InputFileUpload'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createSubCategory,
  editSubCategory,
} from '@/lib/actions/dashboard/subCategories'
import { usePathname } from '@/navigation'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { allCategories } from '@/lib/queries/dashboard/category'

interface SubCategoryDetailsProps {
  initialData?: SubCategory & { images: Image[] }
  // categories: Partial<Category>[]
}

const SubCategoryDetails: FC<SubCategoryDetailsProps> = ({
  initialData,
  // categories,
}) => {
  // Initializing necessary hooks

  // const router = useRouter() // Hook for routing
  const path = usePathname()

  const [isPending, startTransition] = useTransition()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => allCategories(),
  })
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof SubCategoryFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(SubCategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: initialData?.name,
      name_fa: initialData?.name_fa || undefined,
      images: initialData?.images
        ? initialData.images.map((image) => ({ url: image.url }))
        : [],
      url: initialData?.url,
      featured: initialData?.featured,
      categoryId: initialData?.categoryId,
    },
  })

  // Reset form values when data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name,
        name_fa: initialData?.name_fa || undefined,
        images: initialData?.images
          ? initialData.images.map((image) => ({ url: image.url }))
          : [],
        url: initialData?.url,
        featured: initialData?.featured,
        categoryId: initialData?.categoryId,
      })
    }
  }, [initialData, form])

  // Submit handler for form submission
  const handleSubmit = async (data: z.infer<typeof SubCategoryFormSchema>) => {
    // console.log({ data })
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('name_fa', data.name_fa || '')
    formData.append('url', data.url)
    formData.append('categoryId', data.categoryId)

    if (!initialData) {
      if (data.featured) {
        formData.append('featured', 'true')
      } else {
        formData.append('featured', 'false')
      }
    } else {
      if (data.featured) {
        formData.append('featured', true.toString())
      } else {
        formData.append('featured', false.toString())
      }
    }

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i] as string | Blob)
      }
    }
    try {
      if (initialData) {
        // console.log({ data, initialData })

        startTransition(async () => {
          try {
            const res = await editSubCategory(
              formData,

              initialData.id as string,
              path
            )

            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.images) {
              form.setError('images', {
                type: 'custom',
                message: res?.errors.images?.join(' و '),
              })
            } else if (res?.errors?.name_fa) {
              form.setError('name_fa', {
                type: 'custom',
                message: res?.errors.name_fa?.join(' و '),
              })
            } else if (res?.errors?.categoryId) {
              form.setError('categoryId', {
                type: 'custom',
                message: res?.errors.categoryId?.join(' و '),
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
            const res = await createSubCategory(formData, path)
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
            } else if (res?.errors?.images) {
              form.setError('images', {
                type: 'custom',
                message: res?.errors.images?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
              })
            } else if (res?.errors?.featured) {
              form.setError('featured', {
                type: 'custom',
                message: res?.errors.featured?.join(' و '),
              })
            } else if (res?.errors?.categoryId) {
              form.setError('categoryId', {
                type: 'custom',
                message: res?.errors.categoryId?.join(' و '),
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
          <CardTitle>Sub Category Information</CardTitle>
          <CardDescription>
            {initialData?.id
              ? `Update ${initialData?.name} sub category information.`
              : ' Lets create a sub category. You can edit sub category later from the categories table or the sub category page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <InputFileUpload
                initialDataImages={initialData?.images || []}
                name="images"
                label="Images"
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Sub Category name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name="name_fa"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>نام فارسی زیردسته</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isPending}
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Sub Category url</FormLabel>
                    <FormControl>
                      <Input placeholder="/sub-category-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className=" bg-background">
                    <FormControl>
                      <Select
                        dir="rtl"
                        disabled={isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              defaultValue={field.value}
                              placeholder="Select a Category"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id!}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Select a Category</FormLabel>
                      <FormDescription>
                        This Sub Category will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured</FormLabel>
                      <FormDescription>
                        This Sub Category will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : initialData?.id
                  ? 'Save sub category information'
                  : 'Create sub category'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default SubCategoryDetails
