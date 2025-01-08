'use client'

// React
import { FC, useEffect, useState, useTransition } from 'react'

// Prisma model
import { Category, Image } from '@prisma/client'

// Form handling utilities
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// Schema
import { CategoryFormSchema } from '@/lib/schemas/dashboard'

// UI Components
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Queries

// Utils
import { v4 } from 'uuid'

import { usePathname, useRouter } from '@/navigation'
import { useToast } from '@/hooks/use-toast'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import ImageSlider from '@/components/shared/ImageSlider'
import { upsertCategory } from '@/lib/queries/dashboard'
import { X } from 'lucide-react'
import {
  createCategory,
  editCategory,
} from '@/lib/actions/dashboard/categories'
import { toast } from 'sonner'

interface CategoryDetailsProps {
  initialData?: Category & { images: Image[] }
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ initialData }) => {
  const [files, setFiles] = useState<File[]>([])

  // Initializing necessary hooks

  const router = useRouter() // Hook for routing
  const path = usePathname()
  const [isPending, startTransition] = useTransition()
  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(CategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: initialData?.name,
      images: initialData?.images ? [{ url: initialData?.images }] : [],
      url: initialData?.url,
      featured: initialData?.featured,
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
        images: [{ url: initialData?.images }],
        url: initialData?.url,
        featured: initialData?.featured,
      })
    }
  }, [initialData, form])

  // Submit handler for form submission
  const handleSubmit = async (data: z.infer<typeof CategoryFormSchema>) => {
    // console.log({ data })
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('url', data.url)

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
          editCategory(
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
          createCategory(formData, path)
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
            .catch(() => toast.error('مشکلی پیش آمده.'))
        })
      }
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }

    // try {
    //   // Upserting category data
    //   const response = await upsertCategory({
    //     id: data?.id ? data.id : v4(),
    //     name: values.name,
    //     images: values.images[0].url,
    //     url: values.url,
    //     featured: values.featured,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   })
    //   // Displaying success message
    //   toast({
    //     title: data?.id
    //       ? 'Category has been updated.'
    //       : `Congratulations! '${response?.name}' is now created.`,
    //   })
    //   // Redirect or Refresh data
    //   if (data?.id) {
    //     router.refresh()
    //   } else {
    //     router.push('/dashboard/admin/categories')
    //   }
    // } catch (error: unknown) {
    //   // Handling form submission errors
    //   toast({
    //     variant: 'destructive',
    //     title: 'Oops!',
    //     description: error?.toString(),
    //   })
    // }
  }

  const validUrls =
    // initialData && initialData.images
    //   ? (initialData.images.map((img) => img.url).filter(Boolean) as string[])
    //   :
    files.map((file) => URL.createObjectURL(file)).filter(Boolean) as string[]

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>
            {initialData?.id
              ? `Update ${initialData?.name} category information.`
              : ' Lets create a category. You can edit category later from the categories table or the category page.'}
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
                    <FormLabel>Category name</FormLabel>
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
                    <FormLabel>Category url</FormLabel>
                    <FormControl>
                      <Input placeholder="/category-url" {...field} />
                    </FormControl>
                    <FormMessage />
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
                        This Category will appear on the home page
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : initialData?.id
                  ? 'Save category information'
                  : 'Create category'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default CategoryDetails
