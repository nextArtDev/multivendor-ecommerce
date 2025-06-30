## useQuey

```ts
  const {
    data: variant,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['get-variants-by-slug', product.id, variantSlugParam],
    queryFn: () => getVariantBySlugAndProductId(product.id, variantSlugParam!),
    enabled: !!variantSlugParam && !!product.id, // Only run query if we have required params
    retry: 3, // Retry failed requests 3 times
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
```