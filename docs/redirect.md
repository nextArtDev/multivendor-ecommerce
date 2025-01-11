# Redirect Server actions in next-intl

```ts
export async function createStore(
  formData: FormData,
  path: string
): Promise<CreateStoreFormState> {
  const headerResponse = await headers()
  const locale = headerResponse.get('X-NEXT-INTL-LOCALE')
  ///....

   } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message],
        },
      }
    } else {
      return {
        errors: {
          _form: ['مشکلی پیش آمده، لطفا دوباره امتحان کنید!'],
        },
      }
    }
  }
  revalidatePath(path)
  redirect(`/${locale}/dashboard/seller/stores`)
}
```