'use client'
import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

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
import { PhoneInput } from '@/components/ui/phone-input'
import InputFileUpload from '@/components/shared/InputFileUpload'

import { Switch } from '@/components/ui/switch'
import { StoreFormSchema } from '@/lib/schemas/dashboard'
import { usePathname } from '@/navigation'
import { FC, useEffect, useTransition } from 'react'
import { Image, Store } from '@prisma/client'
import { AlertDialog } from '@/components/ui/alert-dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createStore, editStore } from '@/lib/actions/dashboard/store'

interface StoreDetailProps {
  initialData?: Store & { logo: Image | null } & { cover: Image[] | null }
}

const StoreDetails: FC<StoreDetailProps> = ({ initialData }) => {
  const path = usePathname()
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof StoreFormSchema>>({
    resolver: zodResolver(StoreFormSchema),
    defaultValues: {
      name: initialData?.name,
      name_fa: initialData?.name_fa || '',
      description: initialData?.description,
      description_fa: initialData?.description_fa || '',
      url: initialData?.url,
      featured: initialData?.featured,
      email: initialData?.email,
      phone: initialData?.phone,
      status: initialData?.status,
      cover: initialData?.cover
        ? initialData.cover.map((cover) => ({ url: cover.url }))
        : [],
      logo: initialData?.logo ? [{ url: initialData.logo.url }] : [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData?.name,
        name_fa: initialData?.name_fa || '',
        description: initialData?.description,
        description_fa: initialData?.description_fa || '',
        email: initialData?.email,
        phone: initialData?.phone,
        status: initialData?.status,
        cover: initialData?.cover
          ? initialData.cover.map((cover) => ({ url: cover.url }))
          : [],
        logo: initialData?.logo ? [{ url: initialData.logo.url }] : [],
        url: initialData?.url,
        featured: initialData?.featured,
      })
    }
  }, [initialData, form])

  const handleSubmit = async (data: z.infer<typeof StoreFormSchema>) => {
    // console.log({ data })
    const formData = new FormData()

    formData.append('name', data.name)
    formData.append('name_fa', data.name_fa || '')
    formData.append('description', data.description)
    formData.append('description_fa', data.description_fa || '')
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    formData.append('url', data.url)

    if (data.featured) {
      formData.append('featured', 'true')
    } else {
      formData.append('featured', 'false')
    }

    // if (data.cover && data.cover.length > 0) {
    //   for (let i = 0; i < data.cover.length; i++) {
    //     formData.append('cover', data.cover[i])
    //   }
    // }
    // if (data.logo && data.logo.length > 0) {
    //   for (let i = 0; i < data.logo.length; i++) {
    //     formData.append('logo', data.logo[i])
    //   }
    // }
    data.logo?.forEach((item) => {
      if (item instanceof File) {
        formData.append('logo', item)
      }
    })

    // data.cover?.forEach((item, index) => {
    //   if (item instanceof File) {
    //     formData.append(`cover[${index}]`, item)
    //   }
    // })
    if (data.cover && data.cover.length > 0) {
      for (let i = 0; i < data.cover.length; i++) {
        formData.append('cover', data.cover[i] as string | Blob)
      }
    }
    try {
      if (initialData) {
        // console.log({ data, initialData })

        startTransition(() => {
          editStore(
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
              } else if (res?.errors?.name_fa) {
                form.setError('name_fa', {
                  type: 'custom',
                  message: res?.errors.name_fa?.join(' و '),
                })
              } else if (res?.errors?.description) {
                form.setError('description', {
                  type: 'custom',
                  message: res?.errors.description?.join(' و '),
                })
              } else if (res?.errors?.description_fa) {
                form.setError('description_fa', {
                  type: 'custom',
                  message: res?.errors.description_fa?.join(' و '),
                })
              } else if (res?.errors?.email) {
                form.setError('email', {
                  type: 'custom',
                  message: res?.errors.email?.join(' و '),
                })
              } else if (res?.errors?.phone) {
                form.setError('phone', {
                  type: 'custom',
                  message: res?.errors.phone?.join(' و '),
                })
              } else if (res?.errors?.url) {
                form.setError('url', {
                  type: 'custom',
                  message: res?.errors.url?.join(' و '),
                })
              } else if (res?.errors?.status) {
                form.setError('status', {
                  type: 'custom',
                  message: res?.errors.status?.join(' و '),
                })
              } else if (res?.errors?.featured) {
                form.setError('featured', {
                  type: 'custom',
                  message: res?.errors.featured?.join(' و '),
                })
              } else if (res?.errors?.cover) {
                form.setError('cover', {
                  type: 'custom',
                  message: res?.errors.cover?.join(' و '),
                })
              } else if (res?.errors?.logo) {
                form.setError('logo', {
                  type: 'custom',
                  message: res?.errors.logo?.join(' و '),
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
          createStore(formData, path).then((res) => {
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
            } else if (res?.errors?.description) {
              form.setError('description', {
                type: 'custom',
                message: res?.errors.description?.join(' و '),
              })
            } else if (res?.errors?.description_fa) {
              form.setError('description_fa', {
                type: 'custom',
                message: res?.errors.description_fa?.join(' و '),
              })
            } else if (res?.errors?.email) {
              form.setError('email', {
                type: 'custom',
                message: res?.errors.email?.join(' و '),
              })
            } else if (res?.errors?.phone) {
              form.setError('phone', {
                type: 'custom',
                message: res?.errors.phone?.join(' و '),
              })
            } else if (res?.errors?.url) {
              form.setError('url', {
                type: 'custom',
                message: res?.errors.url?.join(' و '),
              })
            } else if (res?.errors?.status) {
              form.setError('status', {
                type: 'custom',
                message: res?.errors.status?.join(' و '),
              })
            } else if (res?.errors?.featured) {
              form.setError('featured', {
                type: 'custom',
                message: res?.errors.featured?.join(' و '),
              })
            } else if (res?.errors?.cover) {
              form.setError('cover', {
                type: 'custom',
                message: res?.errors.cover?.join(' و '),
              })
            } else if (res?.errors?.logo) {
              form.setError('logo', {
                type: 'custom',
                message: res?.errors.logo?.join(' و '),
              })
            } else if (res?.errors?._form) {
              toast.error(res?.errors._form?.join(' و '))
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
  return (
    <AlertDialog>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>
            {initialData?.id
              ? `Update ${initialData?.name} store information.`
              : ' Lets create a store. You can edit store later from the Stores table or the store page.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 max-w-3xl mx-auto py-10"
            >
              <div className="flex  flex-col md:flex-row justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name_fa"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Farsi Name</FormLabel>
                      <FormControl>
                        <Input placeholder="" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description_fa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farsi Description</FormLabel>
                    <FormControl>
                      <Input placeholder="" type="" {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start">
                    <FormLabel>Mobile Phone</FormLabel>
                    <FormControl className="w-full">
                      <PhoneInput
                        placeholder="09121111111"
                        {...field}
                        defaultCountry="IR"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                <InputFileUpload
                  name="logo"
                  label="Logo"
                  multiple={false}
                  className=""
                />
                <InputFileUpload name="cover" label="Cover" />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@gmail.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="/store-url" type="" {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex-1 flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                      </div>
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

                {/* <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="m@example.com">
                            m@example.com
                          </SelectItem>
                          <SelectItem value="m@google.com">
                            m@google.com
                          </SelectItem>
                          <SelectItem value="m@support.com">
                            m@support.com
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'loading...'
                  : initialData?.id
                  ? 'Save store information'
                  : 'Create store'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AlertDialog>
  )
}

export default StoreDetails
