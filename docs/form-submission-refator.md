
```ts
// types/form.ts
import { z } from 'zod'

export type FormErrors<T> = {
  [K in keyof T]?: string[]
} & {
  _form?: string[]
}

export type FormState<T> = {
  errors?: FormErrors<T>
  success?: boolean
}

// utils/form.ts
import { z } from 'zod'
import { toast } from 'your-toast-library'
import { FormErrors } from '@/types/form'

export function appendFormData<T extends Record<string, any>>(
  formData: FormData, 
  data: T, 
  booleanFields: (keyof T)[] = []
): FormData {
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    
    // Handle boolean fields
    if (booleanFields.includes(key as keyof T)) {
      formData.append(key, value ? 'true' : 'false')
      return
    }
    
    // Handle array fields (like images)
    if (Array.isArray(value) && value.length > 0) {
      value.forEach(item => {
        formData.append(key, item)
      })
      return
    }
    
    // Handle regular fields
    formData.append(key, String(value))
  })
  
  return formData
}

export function handleFormErrors<T>(
  form: any, 
  errors?: FormErrors<T>
): boolean {
  if (!errors) return false
  
  // Handle form-level errors
  if (errors._form) {
    toast.error(errors._form.join(' و '))
    return true
  }
  
  // Handle field-level errors
  for (const [field, messages] of Object.entries(errors)) {
    if (field === '_form' || !messages) continue
    
    form.setError(field, {
      type: 'custom',
      message: messages.join(' و ')
    })
    return true
  }
  
  return false
}

// hooks/useFormSubmit.ts
import { useState, useTransition } from 'react'
import { z } from 'zod'
import { toast } from 'your-toast-library'
import { appendFormData, handleFormErrors } from '@/utils/form'
import { FormState } from '@/types/form'

interface FormSubmitOptions<T, R> {
  form: any
  schema: z.ZodType<T>
  action: (formData: FormData, ...args: any[]) => Promise<FormState<R>>
  booleanFields?: (keyof T)[]
  onSuccess?: () => void
  actionArgs?: any[]
}

export function useFormSubmit<T extends Record<string, any>, R>({
  form,
  schema,
  action,
  booleanFields = [],
  onSuccess,
  actionArgs = []
}: FormSubmitOptions<T, R>) {
  const [isPending, startTransition] = useTransition()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (data: T) => {
    try {
      setIsSubmitting(true)
      const formData = appendFormData(new FormData(), data, booleanFields as string[])
      
      startTransition(async () => {
        try {
          const result = await action(formData, ...actionArgs)
          
          if (!handleFormErrors(form, result.errors)) {
            // No errors occurred
            onSuccess?.()
          }
        } catch (error) {
          // Handle redirect exceptions
          if (!(error instanceof Error && error.message.includes('NEXT_REDIRECT'))) {
            toast.error('مشکلی پیش آمده.')
          }
        } finally {
          setIsSubmitting(false)
        }
      })
    } catch (error) {
      setIsSubmitting(false)
      toast.error('مشکلی پیش آمده، لطفا دوباره امتحان کنید!')
    }
  }
  
  return {
    handleSubmit,
    isPending,
    isSubmitting
  }
}

// Example usage in your component
// components/CategoryForm.tsx
import { useFormSubmit } from '@/hooks/useFormSubmit'
import { createCategory, editCategory } from '@/actions/category'

// In your component:
const { handleSubmit, isPending } = useFormSubmit({
  form,
  schema: CategoryFormSchema,
  action: initialData?.id 
    ? (formData) => editCategory(formData, initialData.id as string, path)
    : (formData) => createCategory(formData, path),
  booleanFields: ['featured'],
  onSuccess: () => {
    // Handle success, e.g. redirect or show success message
  }
})

// Then in your form:
// <Form onSubmit={form.handleSubmit(handleSubmit)}>

// Server action example:
export async function createCategory(
  formData: FormData,
  path: string
): Promise<FormState<z.infer<typeof CategoryServerFormSchema>>> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')

  const result = CategoryServerFormSchema.safeParse({
    name: formData.get('name'),
    name_fa: formData.get('name_fa'),
    url: formData.get('url'),
    featured: formData.get('featured'),
    images: formData.getAll('images'),
  })

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    }
  }

  const session = await auth()
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return {
      errors: {
        _form: ['شما اجازه دسترسی ندارید!'],
      },
    }
  }
  
  // Rest of your logic...
  
  return { success: true }
}
```
