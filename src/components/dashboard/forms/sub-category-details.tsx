'use client'

// React
import { FC, useEffect, useState, useTransition } from 'react'

// Prisma model
import { Category, Image, SubCategory } from '@prisma/client'

// Form handling utilities
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Schema
import { SubCategoryFormSchema } from '@/lib/schemas/dashboard'

// UI Components
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
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

import ImageSlider from '@/components/shared/ImageSlider'
import { AspectRatio } from '@/components/ui/aspect-ratio'

import { cn } from '@/lib/utils'
import { usePathname } from '@/navigation'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  createSubCategory,
  editSubCategory,
} from '@/lib/actions/dashboard/subCategories'

interface SubCategoryDetailsProps {
  initialData?: SubCategory & { images: Image[] }
  categories: Partial<Category>[]
}

const SubCategoryDetails: FC<SubCategoryDetailsProps> = ({
  initialData,
  categories,
}) => {
  const [files, setFiles] = useState<File[]>([])

  // Initializing necessary hooks

  // const router = useRouter() // Hook for routing
  const path = usePathname()
  const [isPending, startTransition] = useTransition()
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof SubCategoryFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(SubCategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: initialData?.name,
      name_fa: initialData?.name_fa || undefined,
      images: initialData?.images ? [{ url: initialData?.images }] : [],
      url: initialData?.url,
      featured: initialData?.featured,
      categoryId: initialData?.categoryId,
    },
  })

  //    const [deleteState, deleteAction] = useFormState(
  //      deleteCategory.bind(
  //        null,
  //        path,
  //        params.storeId as string,
  //        categoryId as string
  //      ),
  //      {
  //        errors: {},
  //      }
  //    )

  // Reset form values when data changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name,
        name_fa: initialData?.name_fa || undefined,
        images: [{ url: initialData?.images }],
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

    if (data.featured) {
      formData.append('featured', 'true')
    } else {
      formData.append('featured', 'false')
    }

    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i])
      }
    }
    try {
      if (initialData) {
        // console.log({ data, initialData })

        startTransition(() => {
          editSubCategory(
            formData,

            initialData.id as string,
            path
          )
            .then((res) => {
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
              // if (res?.success) {
              //    toast.success(toastMessage)
              // }
            })
            // TODO: fixing Through Error when its ok
            // .catch(() => toast.error('مشکلی پیش آمده.'))
            .catch(() => console.log('مشکلی پیش آمده.'))
        })
      } else {
        startTransition(() => {
          createSubCategory(formData, path).then((res) => {
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
              form.setError('root', {
                type: 'custom',
                message: res?.errors?._form?.join(' و '),
              })
            }
            // if (res?.success) {
            //    toast.success(toastMessage)
            // }
          })

          // .catch(() => toast.error('مشکلی پیش آمده.'))
          //   toast.success('دسته‌بندی ایجاد شد.')
        })
      }
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }

  const validUrls =
    initialData && initialData.images
      ? (initialData.images.map((img) => img.url).filter(Boolean) as string[])
      : (files
          .map((file) => URL.createObjectURL(file))
          .filter(Boolean) as string[])

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
              <div className="col-span-2 lg:col-span-4 max-w-md ">
                {files.length > 0 ? (
                  <div className="relative overflow-hidden h-60  w-60 rounded-md">
                    <AspectRatio ratio={1 / 1} className="relative ">
                      <ImageSlider urls={validUrls} />
                    </AspectRatio>
                    <Button
                      size={'icon'}
                      onClick={() => {
                        setFiles([])
                        form.setValue('images', [])
                      }}
                      className="absolute top-2 left-2 z-20"
                    >
                      <X className="text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field: { onChange }, ...field }) => (
                      <FormItem>
                        <FormLabel className="mx-auto cursor-pointer bg-transparent rounded-xl flex flex-col justify-center gap-4 items-center border-2 border-black/20 dark:border-white/20 border-dashed w-full h-24 shadow  ">
                          {/* <FileUp size={42} className=" " /> */}
                          <span
                            className={cn(buttonVariants({ variant: 'ghost' }))}
                          >
                            Upload Images
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            multiple={true}
                            disabled={form.formState.isSubmitting}
                            {...field}
                            onChange={async (event) => {
                              // Triggered when user uploaded a new file
                              // FileList is immutable, so we need to create a new one
                              const dataTransfer = new DataTransfer()

                              // Add old images
                              if (files) {
                                Array.from(files).forEach((image) =>
                                  dataTransfer.items.add(image)
                                )
                              }

                              // Add newly uploaded images
                              Array.from(event.target.files!).forEach((image) =>
                                dataTransfer.items.add(image)
                              )

                              // Validate and update uploaded file
                              const newFiles = dataTransfer.files

                              setFiles(Array.from(newFiles))

                              onChange(newFiles)
                            }}
                          />
                        </FormControl>

                        {/* <FormMessage className="dark:text-rose-400" /> */}
                        <FormMessage>
                          {form.getFieldState('images')?.error?.message}
                        </FormMessage>
                      </FormItem>
                    )}
                  />
                )}
              </div>
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
                              placeholder="یک بیلبورد را انتخاب کنید"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
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
                        checked={field.value}
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
