'use client'

// React
import { FC, useEffect, useState } from 'react'

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

import { useRouter } from '@/navigation'
import { useToast } from '@/hooks/use-toast'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { cn } from '@/lib/utils'
import ImageSlider from '@/components/shared/ImageSlider'
import { upsertCategory } from '@/lib/queries/dashboard'

interface CategoryDetailsProps {
  data?: Category & { images: Image[] }
}

const CategoryDetails: FC<CategoryDetailsProps> = ({ data }) => {
  const [files, setFiles] = useState<File[]>([])

  // Initializing necessary hooks
  const { toast } = useToast() // Hook for displaying toast messages
  const router = useRouter() // Hook for routing

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(CategoryFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      name: data?.name,
      images: data?.images ? [{ url: data?.images }] : [],
      url: data?.url,
      featured: data?.featured,
    },
  })

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting

  // Reset form values when data changes
  useEffect(() => {
    if (data) {
      form.reset({
        name: data?.name,
        images: [{ url: data?.images }],
        url: data?.url,
        featured: data?.featured,
      })
    }
  }, [data, form])

  // Submit handler for form submission
  const handleSubmit = async (values: z.infer<typeof CategoryFormSchema>) => {
    console.log({ values })
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
            {data?.id
              ? `Update ${data?.name} category information.`
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
                  <div className="h-96 md:h-[450px] overflow-hidden rounded-md">
                    <AspectRatio ratio={1 / 1} className="relative h-full">
                      <ImageSlider urls={validUrls} />
                    </AspectRatio>
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
                            انتخاب عکس
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment

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
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'loading...'
                  : data?.id
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
