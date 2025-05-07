'use client'

// React
import { FC, useEffect, useTransition } from 'react'

// Prisma model
import { OfferTag } from '@prisma/client'

// Form handling utilities
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

// Utils

import { createOfferTag, editOfferTag } from '@/lib/actions/dashboard/offerTag'
import { OfferTagFormSchema } from '@/lib/schemas/dashboard'
import { usePathname } from '@/navigation'
import { toast } from 'sonner'

interface OfferTagDetailsProps {
  initialData?: OfferTag
}

const OfferTagDetails: FC<OfferTagDetailsProps> = ({ initialData }) => {
  const path = usePathname()
  const [isLoading, startTransition] = useTransition()

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof OfferTagFormSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(OfferTagFormSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from initialData (if available)
      name: initialData?.name,
      url: initialData?.url,
    },
  })

  // Loading status based on form submission
  // const isLoading = form.formState.isSubmitting

  // Reset form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name,
        url: initialData?.url,
      })
    }
  }, [initialData, form])

  // Submit handler for form submission
  const handleSubmit = async (data: z.infer<typeof OfferTagFormSchema>) => {
    const formData = new FormData()

    formData.append('name', data.name)

    formData.append('url', data.url)

    try {
      if (initialData) {
        startTransition(async () => {
          try {
            const res = await editOfferTag(
              formData,
              initialData.id as string,
              path
            )
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
            }
          } catch (error) {
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
            const res = await createOfferTag(formData, path)
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
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

  // router.push('/dashboard/admin/offer-tags')

  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Offer Tag Information</CardTitle>
          <CardDescription>
            {initialData?.id
              ? `Update ${initialData?.name} offer tag information.`
              : ' Lets create an offer tag. You can edit offer tag later from the offer tags table or the offer tag page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Offer tag name</FormLabel>
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
                    <FormLabel>Offer tag url</FormLabel>
                    <FormControl>
                      <Input placeholder="/offer-tag-url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'loading...'
                  : initialData?.id
                  ? 'Save offer tag information'
                  : 'Create offer tag'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default OfferTagDetails
