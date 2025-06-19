'use client'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
// import { AddReviewSchema } from "@/lib/schemas";
// import {
//   ProductVariantDataType,
//   RatingStatisticsType,
//   ReviewDetailsType,
//   ReviewWithImageType,
// } from "@/lib/types";
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'

// import ReactStars from 'react-rating-stars-component'
import { z } from 'zod'
// import Select from '@/components/ui/select'
// import Input from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PulseLoader } from 'react-spinners'

// import { upsertReview } from '@/queries/review'
import { ProductVariantDataType } from '../../types'
import {
  RatingStatisticsType,
  ReviewWithImageType,
} from '../../lib/queries/review'
import { createReview, ReviewDetailsType } from '../../lib/actions/review'
import { AddReviewSchema } from '../../lib/schemas/review'
import { Rating } from '@/components/shared/rating'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import InputFileUpload from '@/components/shared/InputFileUpload'
import Select from '../select'
import { usePathname } from '@/navigation'

export default function ReviewDetails({
  productId,
  data,
  variantsInfo,
  setReviews,
  reviews,
  setStatistics,
  setAverageRating,
}: {
  productId: string
  data?: ReviewDetailsType
  variantsInfo: ProductVariantDataType[]
  reviews: ReviewWithImageType[]
  setReviews: Dispatch<SetStateAction<ReviewWithImageType[]>>
  setStatistics: Dispatch<SetStateAction<RatingStatisticsType>>
  setAverageRating: Dispatch<SetStateAction<number>>
}) {
  // State for selected Variant
  const [activeVariant, setActiveVariant] = useState<ProductVariantDataType>(
    variantsInfo?.[0]
  )
  const path = usePathname()
  // console.log({ variantsInfo })

  // State for sizes
  const [sizes, setSizes] = useState<{ name: string; value: string }[]>([])

  // Form hook for managing form state and validation
  const form = useForm<z.infer<typeof AddReviewSchema>>({
    mode: 'onChange', // Form validation mode
    resolver: zodResolver(AddReviewSchema), // Resolver for form validation
    defaultValues: {
      // Setting default form values from data (if available)
      variantName: data?.variant || activeVariant?.variantName,
      variantImage:
        data?.variantImage?.[0]?.url || activeVariant?.variantImage?.[0]?.url,
      // variantImage: activeVariant?.variantImage,
      //   ? activeVariant.variantImage.map((image) => ({ url: image.url }))
      //   : [],
      rating: data?.rating || 0,
      size: data?.size || '',
      review: data?.review || '',
      quantity: data?.quantity || undefined,
      images: data?.images
        ? data.images.map((image) => ({ url: image.url }))
        : [],
      color: data?.color,
    },
  })

  // Loading status based on form submission
  const isLoading = form.formState.isSubmitting

  // Errors
  const errors = form.formState.errors

  // Submit handler for form submission
  const handleSubmit = async (data: z.infer<typeof AddReviewSchema>) => {
    console.log({ data })
    const formData = new FormData()

    formData.append('variant', data.variantName)
    formData.append('variantName', data.variantName)
    formData.append('variantImage', data.variantImage)
    formData.append('quantity', data.quantity)
    formData.append('rating', data.rating.toString())
    formData.append('review', data.review)
    formData.append('size', data.size)
    formData.append('color', data.color)
    if (data.images && data.images.length > 0) {
      for (let i = 0; i < data.images.length; i++) {
        formData.append('images', data.images[i] as string | Blob)
      }
    }
    // console.log({ values })

    try {
      // if (data) {
      //   // startTransition(async () => {
      //   //   try {
      //   //     const res = await createReview(
      //   //       formData,
      //   //       data.id as string,
      //   //       path
      //   //     )
      //   //     if (res?.errors?.name) {
      //   //       form.setError('name', {
      //   //         type: 'custom',
      //   //         message: res?.errors.name?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.name_fa) {
      //   //       form.setError('name_fa', {
      //   //         type: 'custom',
      //   //         message: res?.errors.name_fa?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.description) {
      //   //       form.setError('description', {
      //   //         type: 'custom',
      //   //         message: res?.errors.description?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.description_fa) {
      //   //       form.setError('description_fa', {
      //   //         type: 'custom',
      //   //         message: res?.errors.description_fa?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.email) {
      //   //       form.setError('email', {
      //   //         type: 'custom',
      //   //         message: res?.errors.email?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.phone) {
      //   //       form.setError('phone', {
      //   //         type: 'custom',
      //   //         message: res?.errors.phone?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.url) {
      //   //       form.setError('url', {
      //   //         type: 'custom',
      //   //         message: res?.errors.url?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.status) {
      //   //       form.setError('status', {
      //   //         type: 'custom',
      //   //         message: res?.errors.status?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.featured) {
      //   //       form.setError('featured', {
      //   //         type: 'custom',
      //   //         message: res?.errors.featured?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.cover) {
      //   //       form.setError('cover', {
      //   //         type: 'custom',
      //   //         message: res?.errors.cover?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?.logo) {
      //   //       form.setError('logo', {
      //   //         type: 'custom',
      //   //         message: res?.errors.logo?.join(' و '),
      //   //       })
      //   //     } else if (res?.errors?._form) {
      //   //       toast.error(res?.errors._form?.join(' و '))
      //   //     }
      //   //   } catch (error) {
      //   //     // This will catch the NEXT_REDIRECT error, which is expected
      //   //     // when the redirect happens
      //   //     if (
      //   //       !(
      //   //         error instanceof Error &&
      //   //         error.message.includes('NEXT_REDIRECT')
      //   //       )
      //   //     ) {
      //   //       toast.error('مشکلی پیش آمده.')
      //   //     }
      //   //   }
      //   // })
      // } else {
      startTransition(async () => {
        try {
          const res = await createReview(formData, productId, path)
          if (res?.errors?.variantImage) {
            form.setError('variantImage', {
              type: 'custom',
              message: res?.errors.variantImage?.join(' و '),
            })
          } else if (res?.errors?.quantity) {
            form.setError('quantity', {
              type: 'custom',
              message: res?.errors.quantity?.join(' و '),
            })
          } else if (res?.errors?.rating) {
            form.setError('rating', {
              type: 'custom',
              message: res?.errors.rating?.join(' و '),
            })
          } else if (res?.errors?.review) {
            form.setError('review', {
              type: 'custom',
              message: res?.errors.review?.join(' و '),
            })
          } else if (res?.errors?.size) {
            form.setError('size', {
              type: 'custom',
              message: res?.errors.size?.join(' و '),
            })
          } else if (res?.errors?.color) {
            form.setError('color', {
              type: 'custom',
              message: res?.errors.color?.join(' و '),
            })
          } else if (res?.errors?.images) {
            form.setError('images', {
              type: 'custom',
              message: res?.errors.images?.join(' و '),
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
      })
      // }
    } catch {
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }

  // const response = await upsertReview(productId, {
  //   id: data?.id || v4(),
  //   variant: values.variantName,
  //   variantImage: values.variantImage,
  //   images: values.images,
  //   quantity: values.quantity,
  //   rating: values.rating,
  //   review: values.review,
  //   size: values.size,
  //   color: values.color,
  // })
  // if (response.review.id) {
  //   const rev = reviews.filter((rev) => rev.id !== response.review.id)
  //   setReviews([...rev, response.review])
  //   setStatistics(response.statistics)
  //   setAverageRating(response.rating)
  //   toast.success(response.message)
  // }

  // } catch (error: any) {
  //   // Handling form submission errors
  //   toast.error(error.toString())
  // }
  // }
  const variants = variantsInfo?.map((v) => ({
    name: v.variantName,
    value: v.variantName,
    image: v.variantImage[0],
    colors: v.colors.map((c) => c.name).join(','),
  }))

  useEffect(() => {
    form.setValue('size', '')
    const name = form.getValues().variantName
    const variant = variantsInfo?.find((v) => v.variantName === name)
    if (variant) {
      const sizes_data = variant.sizes.map((s) => ({
        name: s.size,
        value: s.size,
      }))
      setActiveVariant(variant)
      if (sizes) setSizes(sizes_data)
      form.setValue('color', variant.colors.map((c) => c.name).join(','))
      form.setValue('variantImage', variant.variantImage?.[0].url)
    }
  }, [form.getValues().variantName])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('quantity', e.target.value)
  }

  return (
    <div>
      <div className="p-4 bg-muted-foreground rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex flex-col space-y-4">
              {/* Title */}
              <div className="pt-4">
                <h1 className="font-bold text-2xl">Add a review</h1>
              </div>
              {/* Form items */}
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center gap-x-2">
                          <Rating
                            value={field.value}
                            onChange={field.onChange}
                            allowHalf
                            //  disabled={loading}
                            tooltips={[
                              'Poor',
                              'Fair',
                              'Good',
                              'Very Good',
                              'Excellent',
                            ]}
                          />
                          <span>
                            ( {form.getValues().rating.toFixed(1)} out of 5.0)
                          </span>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="w-full flex flex-wrap gap-4">
                  <div className="w-full sm:w-fit">
                    <FormField
                      control={form.control}
                      name="variantName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              options={variants}
                              placeholder="Select product"
                              subPlaceholder="Please select a product"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="flex-1  ">
                        <FormControl>
                          <Select
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            options={sizes}
                            placeholder="Select size"
                            subPlaceholder="Please select a size"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            name="quantity"
                            type="number"
                            placeholder="Quantity (Optional)"
                            onChange={handleInputChange}
                            value={field.value ? field.value.toString() : ''} // Handle undefined gracefully
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          className="min-h-32 p-4 w-full rounded-xl focus:outline-none ring-1 ring-[transparent] focus:ring-[#11BE86]"
                          placeholder="Write your review..."
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                {/* <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem className="w-full xl:border-r">
                      <FormControl>
                      
                        <ImageUploadStore
                          value={field.value.map((image) => image.url)}
                          disabled={isLoading}
                          onChange={(url) => {
                            setImages((prevImages) => {
                              const updatedImages = [...prevImages, { url }]
                              if (updatedImages.length <= 3) {
                                field.onChange(updatedImages)
                                return updatedImages
                              } else {
                                return prevImages
                              }
                            })
                          }}
                          onRemove={(url) =>
                            field.onChange([
                              ...field.value.filter(
                                (current) => current.url !== url
                              ),
                            ])
                          }
                          maxImages={3}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
                <InputFileUpload
                  className="w-full"
                  initialDataImages={data?.images || []}
                  name="images"
                  label="Images"
                />
              </div>
              <div className="space-y-2 text-destructive">
                {errors.rating && <p>{errors.rating.message}</p>}
                {errors.size && <p>{errors.size.message}</p>}
                {errors.review && <p>{errors.review.message}</p>}
              </div>
              <div className="w-full flex justify-end">
                <Button type="submit" className="w-36 h-12">
                  {isLoading ? (
                    <PulseLoader size={5} color="#fff" />
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
