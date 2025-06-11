<!--  OfferTagsLinks -->

```ts
import { useMediaQuery } from 'react-responsive'

// Custom hook to calculate split point
function useBreakpoints() {
  const mobile = useMediaQuery({ query: '(max-width: 640px)' })
  const sm = useMediaQuery({ query: '(min-width: 640px)' })
  const md = useMediaQuery({ query: '(min-width: 768px)' })
  const lg = useMediaQuery({ query: '(min-width: 1024px)' })
  const xl = useMediaQuery({ query: '(min-width: 1536px)' })

  if (xl) return 7
  if (lg) return 6
  if (md) return 4
  if (sm) return 3
  if (mobile) return 2

  return 1 // Default split point
}
```