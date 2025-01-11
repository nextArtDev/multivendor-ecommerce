# Image Input

## Schema

```ts
import * as z from 'zod'
import { zfd } from 'zod-form-data'

const imageSchema = z.union([
  zfd
    .file()
    .refine((file) => file.size < 5000000, {
      message: "File can't be bigger than 5MB.",
    })
    .refine(
      (file) =>
        ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(
          file.type
        ),
      {
        message: 'File format must be either jpg, jpeg lub png.',
      }
    ),
  z.object({
    url: z.string(),
  }),
])


// In Schema
 images: z.array(imageSchema).optional(),
```

## react-hook-form

```ts
// array
images: initialData?.images
        ? initialData.images.map((image) => ({ url: image.url }))
        : [],


// Single Image
logo: initialData?.logo ? [{ url: initialData.logo.url }] : [],
```

## Appending to formData

```ts
//array 

 if (data.images && data.images.length > 0) {
   for (let i = 0; i < data.images.length; i++) {
     formData.append('cover', data.images[i] as string | Blob)
   }
 }

 // single

 data.logo?.forEach((item) => {
      if (item instanceof File) {
        formData.append('logo', item)
      }
    })
```

## Components

```ts
 <InputFileUpload
                initialDataImages={initialData?.images || []}
                name="images"
                label="Images"
              />
```