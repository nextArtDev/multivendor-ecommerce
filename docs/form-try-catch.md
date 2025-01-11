# Using Try/Catch in form input validation

```ts
try {
      if (initialData) {
        startTransition(async () => {
          try {
            const res = await editStore(
              formData,
              initialData.id as string,
              path
            )
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            }  else if (res?.errors?._form) {
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
            const res = await createStore(formData, path)
            if (res?.errors?.name) {
              form.setError('name', {
                type: 'custom',
                message: res?.errors.name?.join(' و '),
              })
            }  else if (res?.errors?._form) {
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
```