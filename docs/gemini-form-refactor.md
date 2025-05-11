
## GEMINI Answer

Okay, this is a classic scenario where you want to reduce boilerplate and create more maintainable code. Let's refactor this step-by-step, focusing on creating reusable utilities for both the client-side form submission and the server-side action handling.

**Assumptions:**

1.  You're using `react-hook-form` on the client (implied by `form.setError`).
2.  `toast` is a notification library like `react-toastify` or `sonner`.
3.  `auth()` is your authentication utility (e.g., from NextAuth.js).
4.  `path` is for `revalidatePath`.

**Refactoring Strategy:**

1.  **Server-Side:**
    *   Create a generic `FormState` type.
    *   Create a higher-order function (HOF) or a utility function to wrap server actions. This wrapper will handle:
        *   Locale extraction (if always needed).
        *   `FormData` parsing based on a provided Zod schema.
        *   Authorization check (optional, configurable).
        *   Returning a standardized `FormState` response.

2.  **Client-Side:**
    *   Create a utility function to convert form data (from `react-hook-form`) into `FormData`.
    *   Create a generic submit handler function (or a custom hook) that:
        *   Takes the server action, form instance, data, and path.
        *   Handles `startTransition`.
        *   Calls the server action.
        *   Maps errors from `FormState` to `react-hook-form` errors.
        *   Handles general success/error toasts.
        *   Handles `NEXT_REDIRECT` errors.

---

**Step 1: Define Generic Types and Server-Side Utilities**

Create `lib/actions/utils.ts` (or a similar path):

```typescript
// lib/actions/utils.ts
import { z } from 'zod';
import { headers } from 'next/headers';
// Assuming auth() returns a session object or null
// import { auth } from '@/auth'; // Adjust path to your auth function

// --- Reusable FormState Type ---
export type ActionResponse<TData = any, TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  data?: TData;
  errors?: {
    _form?: string[]; // For general form errors
  } & Partial<Record<keyof z.infer<TSchema>, string[]>>; // Field-specific errors
  message?: string; // For success or general messages
};


// --- Server Action Wrapper ---
interface CreateServerActionOptions<TSchema extends z.ZodTypeAny, TData> {
  schema: TSchema;
  // Replace with your actual auth function and session type
  authCheck?: (session: any /* Replace with your Session type */) => boolean | Promise<boolean>;
  action: (
    validatedData: z.infer<TSchema>,
    formData: FormData, // Raw FormData if needed for files etc.
    session?: any /* Replace with your Session type */
  ) => Promise<ActionResponse<TData, TSchema>>;
  getLocale?: boolean; // If true, will try to get 'X-NEXT-INTL-LOCALE'
}

export async function createValidatedServerAction<TSchema extends z.ZodTypeAny, TData = any>(
  options: CreateServerActionOptions<TSchema, TData>
) {
  return async (formData: FormData, ...extraArgs: any[]): Promise<ActionResponse<TData, TSchema>> => {
    const { schema, authCheck, action, getLocale } = options;

    let locale: string | null = null;
    if (getLocale) {
      const headerResponse = await headers();
      locale = headerResponse.get('X-NEXT-INTL-LOCALE');
      // You might want to pass locale to the action if needed
    }

    // Construct an object from FormData to validate against the Zod schema
    // This needs to be smart about how Zod expects data (e.g., for files, booleans)
    // Zod schemas often use .preprocess() for FormData
    const rawData: Record<string, any> = {};
    schema.shape && Object.keys(schema.shape).forEach(key => {
      const value = formData.getAll(key); // Use getAll for potential arrays (like images)
      if (value.length === 0) {
        // Zod will handle undefined for optional fields.
        // If a field is required and not present, Zod will error.
        // Keep it undefined if not present.
      } else if (value.length === 1) {
        rawData[key] = value[0];
      } else {
        rawData[key] = value;
      }
    });
    // console.log("Raw data for Zod:", rawData);


    const validationResult = schema.safeParse(rawData);

    if (!validationResult.success) {
      console.error("Zod Validation Errors:", validationResult.error.flatten().fieldErrors);
      return {
        errors: validationResult.error.flatten().fieldErrors as ActionResponse<TData, TSchema>['errors'],
      };
    }

    let session: any = null; // Replace with your Session type
    if (authCheck) {
      // session = await auth(); // Your actual auth call
      // const isAuthorized = await authCheck(session);
      // if (!isAuthorized) {
      //   return {
      //     errors: { _form: ['شما اجازه دسترسی ندارید!'] }, // Or a generic "Unauthorized"
      //   };
      // }
      // For demonstration, let's mock this part until you integrate your auth()
      const mockSession = { user: { role: 'ADMIN' } }; // Example session
      session = mockSession;
      const isAuthorized = authCheck ? await authCheck(session) : true;
      if (!isAuthorized) {
        return {
          errors: { _form: ['شما اجازه دسترسی ندارید!'] },
        };
      }
    }
    
    // Pass validated data, raw formData (for files), and session to the core action logic
    return action(validationResult.data, formData, session, ...extraArgs);
  };
}

// --- Helper to extract locale (if you need it outside the wrapper) ---
export async function getRequestLocale(): Promise<string | null> {
  const headerResponse = await headers();
  return headerResponse.get('X-NEXT-INTL-LOCALE');
}
```

**Important for `createValidatedServerAction` `rawData` construction:**
The way `rawData` is constructed is crucial. Zod schemas for `FormData` often use `z.preprocess` to handle string-to-boolean conversion, string-to-number, or ensure files are correctly typed.
Example:
`featured: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean().optional())`
`images: z.preprocess((val) => (val ? (Array.isArray(val) ? val : [val]) : []), z.array(z.instanceof(File)).optional())`
The `rawData` construction above tries to be generic. If your `CategoryServerFormSchema` already has these preprocess steps, it should work well.

---

**Step 2: Refactor Your Server Action (`createCategory`)**

Modify your existing server action file (e.g., `app/actions/categoryActions.ts`):

```typescript
// app/actions/categoryActions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { prisma } from '@/lib/prisma'; // Your Prisma client
// import { auth } from '@/auth'; // Your auth function
import { createValidatedServerAction, ActionResponse } from '@/lib/actions/utils'; // Adjust path

// --- Define your Zod schema (as before, ensure preprocess is used for FormData) ---
// This schema is what createValidatedServerAction will use
const CategoryServerFormSchema = z.object({
  name: z.string().min(1, { message: 'نام الزامی است' }),
  name_fa: z.string().optional(),
  url: z.string().min(1, { message: 'URL الزامی است' }),
  featured: z.preprocess(
    (val) => String(val).toLowerCase() === 'true', // Handles 'true'/'false' strings from FormData
    z.boolean().optional()
  ),
  images: z.preprocess(
    (val) => (val ? (Array.isArray(val) ? val.filter(f => f instanceof File && f.size > 0) : (val instanceof File && val.size > 0 ? [val] : [])) : []),
    z.array(z.instanceof(File)).optional() // Assuming images are files
    // If images can also be strings (e.g. URLs for existing images), adjust schema:
    // z.array(z.union([z.instanceof(File), z.string()])).optional()
  ),
  // Add other fields as necessary
});

type CategoryFormData = z.infer<typeof CategoryServerFormSchema>;

// --- Define an auth check function (specific to this action or generic) ---
// Replace 'any' with your actual Session type from your auth library
const isAdmin = async (session: any /* Replace with Session type */): Promise<boolean> => {
  return !!session?.user && session.user.role === 'ADMIN';
};


// --- Core logic for creating a category ---
async function createCategoryLogic(
  data: CategoryFormData,
  formData: FormData, // Raw FormData if you need to access files directly
  session?: any // Session object, if authCheck is used
  // path parameter is now passed as an extra arg to the wrapped action
  // path: string // This will be an extra argument
): Promise<ActionResponse<{ id: string }, typeof CategoryServerFormSchema>> {
  // The path parameter is not directly passed here by createValidatedServerAction
  // It will be an argument to the exported action, see below.
  // We'll handle path and revalidation/redirect in the final exported function.

  // Example: Accessing files from raw FormData if needed (though Zod should handle it)
  // const imageFiles = formData.getAll('images') as File[];

  try {
    // console.log('Validated data:', data);
    // console.log('User performing action:', session?.user?.id);

    // Your Prisma logic here
    // const newCategory = await prisma.category.create({
    //   data: {
    //     name: data.name,
    //     name_fa: data.name_fa,
    //     url: data.url,
    //     featured: data.featured,
    //     // Handle image uploads here (e.g., save to S3, get URLs)
    //     // For simplicity, let's assume images are not saved in this example
    //   },
    // });

    // MOCK IMPLEMENTATION
    const newCategory = { id: 'mock-category-id', ...data };
    console.log('Mock category created:', newCategory);
    // End of mock implementation

    // Revalidation and redirect are typically done *after* successful DB operation
    // We will handle this in the final exported function that also takes 'path'

    return {
      data: { id: newCategory.id },
      message: 'دسته بندی با موفقیت ایجاد شد.',
    };
  } catch (error) {
    console.error('Error creating category:', error);
    // Check for Prisma-specific errors or other known errors
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (error.code === 'P2002') { // Unique constraint violation
    //     return { errors: { _form: ['دسته بندی با این نام یا URL قبلا ثبت شده است.'] } };
    //   }
    // }
    return {
      errors: { _form: ['خطایی در ایجاد دسته بندی رخ داد. لطفا دوباره تلاش کنید.'] },
    };
  }
}

// --- Export the wrapped server action ---
// The exported function will take (formData: FormData, path: string)
export const createCategory = async (
  formData: FormData,
  path: string // path for revalidation
): Promise<ActionResponse<{ id: string }, typeof CategoryServerFormSchema>> => {
  const action = createValidatedServerAction({
    schema: CategoryServerFormSchema,
    authCheck: isAdmin, // Pass your auth check function
    action: (validatedData, rawFormData, session) =>
      createCategoryLogic(validatedData, rawFormData, session), // Pass only necessary args
    getLocale: true, // Example: if you need locale
  });

  const result = await action(formData); // Call the HOF-generated action

  if (result.data && !result.errors) {
    revalidatePath(path);
    // redirect(path); // Or redirect to a different page, e.g., the new category's page
    // For create, usually redirect to a list or the new item's page.
    // For edit, usually revalidatePath is enough, or redirect back to the edit page with a success message.
    // The redirect might throw NEXT_REDIRECT, which the client needs to handle.
    // Consider returning a success message and letting client handle navigation for create.
  }
  return result;
};


// --- Example for editCategory ---
// Assume initialDataId is passed to the server action
async function editCategoryLogic(
  data: CategoryFormData,
  formData: FormData,
  session: any, // Session object
  categoryId: string // Extra argument
): Promise<ActionResponse<{ id: string }, typeof CategoryServerFormSchema>> {
  // console.log('Editing category:', categoryId, 'with data:', data);
  // Your Prisma update logic here
  // const updatedCategory = await prisma.category.update({
  //   where: { id: categoryId },
  //   data: { ... }
  // });

  // MOCK IMPLEMENTATION
  const updatedCategory = { id: categoryId, ...data };
  console.log('Mock category updated:', updatedCategory);
  // End of mock implementation

  return {
    data: { id: updatedCategory.id },
    message: 'دسته بندی با موفقیت ویرایش شد.',
  };
  // Error handling similar to createCategoryLogic
}

export const editCategory = async (
  formData: FormData,
  categoryId: string,
  path: string
): Promise<ActionResponse<{ id: string }, typeof CategoryServerFormSchema>> => {
  const action = createValidatedServerAction({
    schema: CategoryServerFormSchema, // Potentially a different schema for edit if fields differ
    authCheck: isAdmin,
    // The action now receives categoryId as an extra argument
    action: (validatedData, rawFormData, session, id) =>
      editCategoryLogic(validatedData, rawFormData, session, id as string),
  });

  // Pass categoryId as an extra argument to the HOF-generated action
  const result = await action(formData, categoryId);

  if (result.data && !result.errors) {
    revalidatePath(path);
    // For edit, often you stay on the page or redirect back to the list.
    // If you redirect, ensure client handles NEXT_REDIRECT.
    // Example: redirect(`/admin/categories/${categoryId}/edit?success=true`);
  }
  return result;
};

```

**Explanation for `createCategory` and `editCategory` structure:**
The `createValidatedServerAction` returns a function that expects `(formData: FormData, ...extraArgs: any[])`.
So, `path` (for `createCategory`) and `categoryId, path` (for `editCategory`) are not directly part of the `actionLogic`'s signature when defined. Instead, the outer exported functions (`createCategory`, `editCategory`) handle receiving these specific arguments, call the HOF-generated action, and then perform `revalidatePath` or `redirect` based on the result.

---

**Step 3: Client-Side Utilities and Refactored Form Submission**

Create `lib/formUtils.ts` or `hooks/useActionHandler.ts`:

```typescript
// lib/formUtils.ts
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner'; // Or your toast library
import { ActionResponse } from '@/lib/actions/utils'; // Adjust path
import React from 'react'; // For startTransition

// --- Helper to convert RHF data to FormData ---
// This handles nested objects/arrays if necessary, but your example is flat.
export function objectToFormData(
  obj: Record<string, any>,
  // Optional: for handling FileList, specific transformations, etc.
  // For now, simple conversion.
  formData = new FormData(),
  parentKey?: string
): FormData {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const propName = parentKey ? `${parentKey}[${key}]` : key;
      const value = obj[key];

      if (value === null || value === undefined) {
        // Skip null/undefined, or append as empty string if required by backend
        // formData.append(propName, '');
        continue;
      }

      if (value instanceof FileList) {
        for (let i = 0; i < value.length; i++) {
          formData.append(propName, value[i]); // Appends as array: images, images, ...
        }
      } else if (value instanceof File) {
        formData.append(propName, value);
      } else if (Array.isArray(value)) {
        // For arrays of strings or simple values (not files)
        // If it's an array of files, FileList handling above is better.
        // This part might need adjustment based on how you handle array fields other than files.
        value.forEach((item, index) => {
          // If items are objects, you might need recursive call:
          // objectToFormData(item, formData, `${propName}[${index}]`);
          // For simple arrays (like array of strings for tags):
          formData.append(`${propName}`, item); // Or `${propName}[${index}]` if backend expects indexed
        });
      } else if (typeof value === 'boolean') {
        formData.append(propName, value ? 'true' : 'false');
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        // For nested objects, if any. Your current data is flat.
        // objectToFormData(value, formData, propName);
        // For now, assuming flat data or specific handling (like JSON stringify)
        // formData.append(propName, JSON.stringify(value));
        console.warn(`Object found at key ${propName}, not appending directly. Handle as needed.`);
      }
       else {
        formData.append(propName, String(value));
      }
    }
  }
  return formData;
}


// --- Generic Submit Handler ---
interface SubmitHandlerOptions<TFormSchema extends z.ZodTypeAny, TServerResponseData> {
  // RHF's form object
  form: UseFormReturn<z.infer<TFormSchema>>;
  // The server action function
  action: (formData: FormData, ...args: any[]) => Promise<ActionResponse<TServerResponseData, TFormSchema>>;
  // Extra arguments for the server action (e.g., ID for edit, path for revalidate)
  actionArgs?: any[];
  // Zod schema for client-side data (data passed to this handler)
  formDataSchema: TFormSchema;
  // Callback on successful submission (after server returns success and no errors)
  onSuccess?: (data?: TServerResponseData) => void;
  // Callback on error (after server returns errors or an exception occurs)
  onError?: (error?: any) => void;
  // Success toast message (can be a function receiving server response data)
  successToast?: string | ((data?: TServerResponseData) => string);
  // Error toast message (can be a function receiving server error response)
  errorToast?: string | ((errorResponse?: ActionResponse<TServerResponseData, TFormSchema>) => string);
}

export function createSubmitHandler<TFormSchema extends z.ZodTypeAny, TServerResponseData = any>(
  options: SubmitHandlerOptions<TFormSchema, TServerResponseData>
) {
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (clientData: z.infer<TFormSchema>) => {
    const {
      form,
      action,
      actionArgs = [],
      onSuccess,
      onError,
      successToast = 'عملیات با موفقیت انجام شد.',
      errorToast = 'مشکلی پیش آمده، لطفا دوباره امتحان کنید!',
    } = options;

    // Client-side validation with the same schema (or a client-specific one)
    // react-hook-form usually handles this via resolver, but an extra check here can be useful
    // Or assume data is already validated by RHF resolver.

    const formData = objectToFormData(clientData);
    // For debugging:
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

    startTransition(async () => {
      try {
        const res = await action(formData, ...actionArgs);

        if (res?.errors) {
          Object.entries(res.errors).forEach(([key, messages]) => {
            if (messages && messages.length > 0) {
              form.setError(key as any, { // `as any` because key could be _form
                type: 'server',
                message: messages.join(' و '),
              });
            }
          });
          if (res.errors._form && res.errors._form.length > 0) {
            const toastMsg = typeof errorToast === 'function' ? errorToast(res) : res.errors._form.join(' و ');
            toast.error(toastMsg);
          } else if (typeof errorToast === 'function' && Object.keys(res.errors).length > 0) {
            // Generic error toast if field errors exist but no _form error
            toast.error(errorToast(res));
          }
          onError?.(res);
        } else if (res?.data) {
          const toastMsg = typeof successToast === 'function' ? successToast(res.data) : successToast;
          toast.success(res.message || toastMsg);
          onSuccess?.(res.data);
          // form.reset(); // Optionally reset form on success
        } else {
          // Unexpected response structure
          const toastMsg = typeof errorToast === 'function' ? errorToast(res) : errorToast;
          toast.error(res?.message || toastMsg);
          onError?.(res);
        }
      } catch (error: any) {
        // Handle NEXT_REDIRECT error (doesn't need a toast)
        if (error?.message?.includes('NEXT_REDIRECT')) {
          // This error is expected when redirect() is called, let Next.js handle it.
          // It will typically manifest as the page actually redirecting.
          // If you `throw error` here, it might be caught by an ErrorBoundary.
          // Often, no specific action is needed here as the redirect will occur.
          return; 
        }
        
        console.error('Submission error:', error);
        const toastMsg = typeof errorToast === 'function' ? errorToast() : errorToast;
        toast.error(toastMsg);
        onError?.(error);
      }
    });
  };

  return { handleSubmit, isPending };
}
```
**Note on `objectToFormData`:**
The provided `objectToFormData` is a basic version. For complex nested objects or arrays of objects, it would need to be more sophisticated (e.g., using recursion and naming conventions like `parent[child]` or `parent[0][child]`). Your current `CategoryFormSchema` data seems relatively flat, so this should work. The `images` field, if it's a `FileList` from an `<input type="file" multiple>`, will be handled correctly by appending each file.

---

**Step 4: Use the Refactored Utilities in Your Form Component**

```tsx
// YourFormComponent.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePathname } from 'next/navigation'; // Or however you get the current path
// import { toast } from 'sonner'; // Already handled by createSubmitHandler

import { createCategory, editCategory } from '@/app/actions/categoryActions'; // Adjust path
import { createSubmitHandler, objectToFormData } from '@/lib/formUtils'; // Adjust path

// Client-side Zod schema (can be same as server or slightly different)
// This is what react-hook-form will use for validation.
const CategoryClientFormSchema = z.object({
  name: z.string().min(1, 'نام الزامی است'),
  name_fa: z.string().optional(),
  url: z.string().min(1, 'URL الزامی است'),
  featured: z.boolean().optional().default(false),
  images: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(), // FileList for client
  // If you also want to handle existing image URLs (strings) for edit:
  // images: z.union([
  //   typeof window === 'undefined' ? z.any() : z.instanceof(FileList),
  //   z.array(z.string()) // For URLs
  // ]).optional(),
});
type CategoryClientFormData = z.infer<typeof CategoryClientFormSchema>;

interface YourFormProps {
  initialData?: CategoryClientFormData & { id?: string }; // And other fields from DB
  // Example: initialData could be { id: '123', name: 'Test', name_fa: 'تست', url: '/test', featured: true, images: undefined }
}

export function YourCategoryForm({ initialData }: YourFormProps) {
  const path = usePathname(); // For revalidation

  const form = useForm<CategoryClientFormData>({
    resolver: zodResolver(CategoryClientFormSchema),
    defaultValues: initialData || {
      name: '',
      name_fa: '',
      url: '',
      featured: false,
      images: undefined, // Or new FileList() if input type file
    },
  });

  const { handleSubmit: handleRHFSubmit, formState: { isSubmitting, errors } } = form;

  // --- Using the generic submit handler for CREATE ---
  const { handleSubmit: handleCreateSubmit, isPending: isCreatePending } =
    createSubmitHandler<typeof CategoryClientFormSchema, { id: string }>({
      form: form,
      formDataSchema: CategoryClientFormSchema, // Schema for data passed to objectToFormData
      action: createCategory, // The server action
      actionArgs: [path], // Extra args for the server action (path for revalidation)
      onSuccess: (data) => {
        console.log('Category created with ID:', data?.id);
        form.reset(); // Reset form on successful creation
        // router.push('/admin/categories'); // Or navigate elsewhere
      },
      successToast: (data) => `دسته بندی با ID: ${data?.id} با موفقیت ایجاد شد.`,
      // errorToast is default or can be customized
    });

  // --- Using the generic submit handler for EDIT ---
  const { handleSubmit: handleEditSubmit, isPending: isEditPending } =
    createSubmitHandler<typeof CategoryClientFormSchema, { id: string }>({
      form: form,
      formDataSchema: CategoryClientFormSchema,
      action: editCategory,
      actionArgs: [initialData?.id as string, path], // id and path for edit
      onSuccess: (data) => {
        console.log('Category updated:', data?.id);
        // Optionally refetch data or update UI
      },
      successToast: 'دسته بندی با موفقیت ویرایش شد.',
      // This will only be called if initialData.id is present
    });

  const onSubmit = (data: CategoryClientFormData) => {
    if (initialData?.id) {
      // console.log("Submitting EDIT data:", data);
      handleEditSubmit(data);
    } else {
      // console.log("Submitting CREATE data:", data);
      handleCreateSubmit(data);
    }
  };
  
  const currentIsPending = initialData?.id ? isEditPending : isCreatePending;

  return (
    <form onSubmit={handleRHFSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...form.register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      <div>
        <label htmlFor="name_fa">Name (FA)</label>
        <input id="name_fa" {...form.register('name_fa')} />
        {errors.name_fa && <p>{errors.name_fa.message}</p>}
      </div>
      <div>
        <label htmlFor="url">URL</label>
        <input id="url" {...form.register('url')} />
        {errors.url && <p>{errors.url.message}</p>}
      </div>
      <div>
        <input type="checkbox" id="featured" {...form.register('featured')} />
        <label htmlFor="featured">Featured</label>
        {errors.featured && <p>{errors.featured.message}</p>}
      </div>
      <div>
        <label htmlFor="images">Images</label>
        <input type="file" id="images" multiple {...form.register('images')} />
        {errors.images && <p>{(errors.images as any).message}</p>}
      </div>

      {/* Display _form errors (general server errors) */}
      {errors._form && <p style={{color: 'red'}}>{(errors._form as any).message}</p>}


      <button type="submit" disabled={currentIsPending}>
        {currentIsPending ? 'در حال ارسال...' : (initialData?.id ? 'ویرایش دسته بندی' : 'ایجاد دسته بندی')}
      </button>
    </form>
  );
}
```

**Key Changes and Benefits:**

1.  **DRY Principle:** Significantly reduces repeated code for validation, auth, error handling, and FormData creation.
2.  **Type Safety:** Generics help maintain type safety throughout the process.
3.  **Separation of Concerns:**
    *   Server action wrappers (`createValidatedServerAction`) handle common server-side tasks.
    *   Core action logic (`createCategoryLogic`, `editCategoryLogic`) focuses purely on the business task (DB interaction).
    *   Client-side submit handlers (`createSubmitHandler`) manage form state, transitions, and UI feedback.
4.  **Maintainability:** Easier to update or debug one part of the system (e.g., auth logic, error mapping) without affecting others.
5.  **Flexibility:** The `createSubmitHandler` and `createValidatedServerAction` are configurable for different needs (e.g., different auth checks, success/error behaviors).
6.  **Clearer Server Actions:** Server actions become more focused on their primary task, with boilerplate handled by the wrapper.
7.  **Improved Client-Side Form Handling:** The `createSubmitHandler` centralizes the logic for interacting with server actions and updating the UI.

This refactoring provides a robust and scalable pattern for your Next.js forms and server actions. Remember to adjust paths and types (like your `Session` type) to match your project structure.