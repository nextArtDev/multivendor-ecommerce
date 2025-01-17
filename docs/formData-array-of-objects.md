# How to pass Array of objects to formData

## Question

its my zod validation for react hook form:

```ts
 sizes: z
    .object({
      size: z.string(),
      quantity: z
        .number()
        .min(1, { message: 'Quantity must be greater than 0.' }),
      price: z.number().min(0.01, { message: 'Price must be greater than 0.' }),
      discount: z.number().min(0).default(0),
    })
    .array()
    .min(1, 'Please provide at least one size.')
    .refine(
      (sizes) =>
        sizes.every((s) => s.size.length > 0 && s.price > 0 && s.quantity > 0),
      {
        message: 'All size inputs must be filled correctly.',
      }
    ),

//how can i append data to formData like this pattern:
  if (data.keywords && data.keywords.length > 0) {
      for (let i = 0; i < data.keywords.length; i++) {
        formData.append('keywords', data.keywords[i] as string | Blob)
      }
    }
// should get it on backend like this:
const result = ProductFormSchema.safeParse({
  sizes: formData.getAll('sizes')
})
```

## Answer

To append the sizes array data to FormData in a similar pattern, you can do it like this:

```typescript
if (data.sizes && data.sizes.length > 0) {
  data.sizes.forEach((size, index) => {
    // Option 1: Append each size object as JSON string
    formData.append('sizes', JSON.stringify(size));

    // OR Option 2: Append each property individually
    formData.append(`sizes[${index}][size]`, size.size);
    formData.append(`sizes[${index}][quantity]`, size.quantity.toString());
    formData.append(`sizes[${index}][price]`, size.price.toString());
    formData.append(`sizes[${index}][discount]`, size.discount.toString());
  });
}
```

Then on the backend, you'll need to parse it accordingly:

```typescript
// If using Option 1 (JSON strings)
const sizesData = formData.getAll('sizes').map(size => JSON.parse(size.toString()));

// OR if using Option 2 (individual properties)
const sizesCount = formData.getAll('sizes[0][size]').length;
const sizesData = Array.from({ length: sizesCount }, (_, i) => ({
  size: formData.get(`sizes[${i}][size]`),
  quantity: Number(formData.get(`sizes[${i}][quantity]`)),
  price: Number(formData.get(`sizes[${i}][price]`)),
  discount: Number(formData.get(`sizes[${i}][discount]`))
}));

const result = ProductFormSchema.safeParse({
  sizes: sizesData
});
```

Option 1 (using JSON.stringify) is simpler and more straightforward, but Option 2 might be more suitable if you need to handle file uploads or other complex data types within the size objects.

If you're using Express.js on the backend, you might need to use appropriate middleware (like `express.json()` or `multer`) to parse the FormData correctly.

Also, make sure your backend validation schema matches the structure of the data you're sending:

```typescript
const ProductFormSchema = z.object({
  sizes: z.array(z.object({
    size: z.string(),
    quantity: z.number(),
    price: z.number(),
    discount: z.number()
  }))
});
```

Remember that FormData will convert all values to strings, so you'll need to convert the numeric values back to numbers on the backend before validation.