'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'

export default function QueryProviders({ children }: { children: ReactNode }) {
  // Use useState instead of useRef for better SSR handling
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent automatic refetching on window focus during development
            refetchOnWindowFocus: false,
            // Retry failed requests
            retry: 3,
            // Consider data stale after 5 minutes
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Add DevTools for debugging - remove in production */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
