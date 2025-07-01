
# (https://codemint-gamma.vercel.app/blog/react-query)

## Introduction

React Query is a powerful library that simplifies data fetching and state management in React applications. When combined with Next.js Server Actions, it creates a robust foundation for handling server-side operations. This guide will walk you through setting up and implementing this powerful combination.
Required Installations

First, let's set up the necessary dependencies:

# Clone the Starter Code

git clone https://github.com/MUKE-coder/react-query-starter-template.git rq-complete

cd rq-complete && pnpm install

# Create a neon database and Populate the DATABASE URL In the env

# Migrate the schema
npx prisma db push && pnpm run dev

# Install React Query and its peer dependencies
npm install @tanstack/react-query@latest @tanstack/react-query-devtools@latest

# If you haven't already, install Next.js
npm install next@latest react@latest react-dom@latest

Initializing React Query

Let's look at two approaches to initialize React Query in your Next.js application.
Basic Initialization

Create a new provider component in app/providers/ReactQueryProvider.tsx:
```ts
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

```

Advanced Initialization with Caching

Here's a version with 15-minute caching and additional configuration:
```ts

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const [queryClient] = useState(() => new QueryClient());
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15 * 60 * 1000, // 15 minutes
            gcTime: 30 * 60 * 1000, // 30 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Note, typically gcTime should be longer than staleTime. Here's why:
  // staleTime determines how long data is considered "fresh" before React Query will trigger a background refetch
  // gcTime determines how long inactive data is kept in the cache before being removed entirely

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

Add the provider to your root layout in app/layout.tsx:

import ReactQueryProvider from "./providers/ReactQueryProvider";

```ts

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
```

Default Settings

Here's a comprehensive configuration of default query settings:

```ts

const [queryClient] = useState(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 15 * 60 * 1000, // 15 minutes - how long data stays fresh
          gcTime: 30 * 60 * 1000, // 30 minutes - how long inactive data is kept
          refetchOnWindowFocus: false, // don't refetch when window regains focus
          retry: 1, // number of retry attempts on failure
          retryDelay: 3000, // 3 seconds between retry attempts
          refetchOnMount: "always", // refetch on component mount
          refetchOnReconnect: true, // refetch when reconnecting network
          enabled: true, // query starts fetching immediately
          networkMode: "online", // 'online' | 'always' | 'offlineFirst'
          queryFn: undefined, // default query function (usually set per query)
          throwOnError: false, // don't throw errors to error boundary
          select: undefined, // transform function for the data
          suspense: false, // don't use React Suspense
          placeholderData: undefined, // temporary data while loading
          structuralSharing: true, // enable structural sharing between query results
        },
      },
    })
);
```
Each setting controls specific behavior:

Data freshness:

    staleTime: How long data is considered fresh
    gcTime: How long to keep inactive data in cache

Refetch behavior:

    refetchOnWindowFocus: Whether to refetch when window regains focus
    refetchOnMount: When to refetch when component mounts
    refetchOnReconnect: Whether to refetch when network reconnects

Error handling:

    retry: Number of retry attempts
    retryDelay: Delay between retries
    throwOnError: Whether to propagate errors to error boundary

Network and data:

    networkMode: How queries behave with network status
    select: Transform function for the returned data
    placeholderData: Temporary data while loading
    structuralSharing: Optimize re-renders through structural sharing

Type Definitions and Server Actions
Base Types

Let's start by defining our core types that will be used throughout the application:
```ts
// types.ts
type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  imageUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Server action return types
type QueriesResponse = {
  data: Contact[];
  error?: string;
};

// For single contact queries
type SingleQueryResponse = {
  data: Contact | null;
  error?: string;
};

// For mutation operations
type MutationResponse = {
  success: boolean;
  data?: Contact;
  error?: string;
};

Server Actions Implementation

Create a new file for your server actions (app/actions/contacts.ts):

// app/actions/contacts.ts
"use server";

import { db } from "@/lib/db";

export async function getContacts(): Promise<QueriesResponse> {
  try {
    const contacts = await db.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { data: contacts };
  } catch (error) {
    return { data: [], error: "Failed to fetch contacts" };
  }
}

export async function getContact(id: string): Promise<SingleQueryResponse> {
  try {
    const contact = await db.contact.findUnique({
      where: { id },
    });
    return { data: contact };
  } catch (error) {
    return { data: null, error: "Failed to fetch contact" };
  }
}

export async function createContact(
  data: Omit<Contact, "id" | "createdAt" | "updatedAt">
): Promise<MutationResponse> {
  try {
    const contact = await db.contact.create({ data });
    return { success: true, data: contact };
  } catch (error) {
    return { success: false, error: "Failed to create contact" };
  }
}

export async function updateContact(
  id: string,
  data: Partial<Contact>
): Promise<MutationResponse> {
  try {
    const contact = await db.contact.update({
      where: { id },
      data,
    });
    return { success: true, data: contact };
  } catch (error) {
    return { success: false, error: "Failed to update contact" };
  }
}

export async function deleteContact(id: string): Promise<MutationResponse> {
  try {
    await db.contact.delete({
      where: { id },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete contact" };
  }
}
```

React Query Hooks

Now let's create custom hooks to use these server actions with React Query:

```ts

// app/hooks/useContacts.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
} from "@/app/actions/contacts";

export function useContacts() {
  const queryClient = useQueryClient();

  // Query for fetching all contacts
  const contactsQuery = useQuery({
    queryKey: ["contacts"],
    queryFn: getContacts,
  });

  // Create contact mutation
  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  // Update contact mutation
  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Contact> }) =>
      updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    },
  });

  return {
    // Queries
    contacts: contactsQuery.data?.data ?? [],
    isLoading: contactsQuery.isLoading,
    error: contactsQuery.error || contactsQuery.data?.error,

    // Mutations
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,

    // Mutation states
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
  };
}

// Hook for fetching a single contact
export function useContact(id: string) {
  const queryClient = useQueryClient();
  const contactQuery = useQuery({
    queryKey: ["contact", id],
    queryFn: () => getContactById(id),
    select: (response) => ({
      contact: response.data,
      error: response.error,
    }),
  });
  return {
    contact: contactQuery.data?.contact,
    error: contactQuery.error || contactQuery.data?.error,
    isLoading: contactQuery.isLoading,
  };
}

Example Usage with Error Handling

"use client";

import { useContacts } from "@/app/hooks/useContacts";

export function ContactActions() {
  const { createContact, isCreating, error: createError } = useContacts();

  const handleCreate = async (formData: FormData) => {
    try {
      await createContact({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });
    } catch (error) {
      console.error("Failed to create contact:", error);
    }
  };

  return (
    <div>
      {createError && <div className="error">{createError}</div>}
      <form action={handleCreate}>
        {/* Form fields */}
        <button disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Contact"}
        </button>
      </form>
    </div>
  );
}

// ## DeTAIL Page
export default function ContactDetailPage({ id }: { id: string }) {
  const { contact, isLoading, error } = useContact(id);
  console.log(contact, id);
  if (isLoading) {
    return (
      <>
        <Sidebar count={0} />
        <main className="flex-1 ml-64 flex items-center justify-center min-h-96">
          <div className="">
            <p>Loading...</p>
          </div>
        </main>
      </>
    );
  }
  if (error) {
    return <div>Error: {error as string}</div>;
  }
  if (!contact) {
    return notFound();
  }
  return (
    <>
      <Sidebar count={0} />
      <main className="flex-1 ml-64">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl">
                {contact.name[0]}
              </div>
              <h1 className="text-2xl font-semibold">{contact.name}</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/contacts/${contact.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <DeleteButton id={contact.id} />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                Contact details
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-24 text-sm">Email</div>
                  <div>{contact.email}</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24 text-sm">Phone</div>
                  <div>{contact.phone}</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-24 text-sm">Image URL</div>
                  <div>{contact.imageUrl || "N/A"}</div>
                </div>
                {contact.notes && (
                  <div className="flex gap-2">
                    <div className="w-24 text-sm">Notes</div>
                    <div>{contact.notes}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
```

This part of the blog post covers the core implementation details. Would you like me to continue with Part 3, which will cover advanced patterns like optimistic updates and error handling strategies?

--------------------
--------------------

## Gemini Answer (https://gemini.google.com/app/10586e446d29ba6e)

You've highlighted a critical point: you **don't want to use route handlers** and prefer to stick with Server Actions for your data fetching. This is a perfectly valid architectural choice in Next.js 15+, and the framework is designed to support it. However, it does introduce specific considerations when integrating with client-side libraries like TanStack Query.

Let's break down the potential "issue" when using Server Actions for data fetching with TanStack Query in a `'use client'` component, and why it might lead to "too much loading" or "never showing products."

### The Core Issue: Client-Side Fetching vs. Server-Side Hydration

When you put a Server Action call inside the `queryFn` of `useQuery` within a `'use client'` component, like this:

```typescript
// ProductReviews.tsx ('use client')
import { useQuery } from '@tanstack/react-query';
import { getProductFilteredReviews } from './queries'; // This is your 'use server' function

const ProductReviews: FC<Props> = ({ /* ... */ }) => {
  // ...
  const { data, isFetching, isPending, isLoading } = useQuery({
    queryKey: ['get-products-review', /* ... */],
    queryFn: () => getProductFilteredReviews(/* ... */), // <-- Calling Server Action here
  });
  // ...
}
```

**What happens at a high level:**

1.  **Server-Side Rendering (SSR) / Static Site Generation (SSG) of the Parent (Server) Component:** Next.js renders the initial HTML for your page on the server. If `ProductReviews` is a client component, Next.js renders a placeholder for it in the initial HTML. **At this stage, your `getProductFilteredReviews` Server Action is NOT executed by TanStack Query.** The `useQuery` hook only runs *after* hydration on the client.
2.  **Client-Side Hydration:** The browser downloads the JavaScript bundle. React "hydrates" your client components.
3.  **`useQuery` Hook Execution:** Once `ProductReviews` component hydrates and mounts on the client, the `useQuery` hook finally runs.
4.  **Server Action Call from Client:** The `queryFn` `() => getProductFilteredReviews(...)` is executed. This call then initiates an **RPC (Remote Procedure Call) request** *from the client-side JavaScript back to your Next.js server* to execute the `getProductFilteredReviews` Server Action.
5.  **Server Action Execution:** The Next.js server receives the RPC, executes `getProductFilteredReviews` (which queries your database via Prisma), and sends the result back to the client.
6.  **Data Received & Rendered:** TanStack Query receives the data, updates its cache, and triggers a re-render of `ProductReviews`, now displaying the products.

**Why this leads to "too much loading" or "never showing them":**

  * **Initial Client-Side Fetch Delay:** The primary reason for the "long time" loading is that the data fetching doesn't start until the client-side JavaScript has downloaded, parsed, executed, and the component has hydrated. This introduces a noticeable delay compared to if the data was prefetched on the server and immediately available. During this delay, your component will show its initial loading state (`isPending` or `isLoading`).
  * **No Server-Side Initial Data:** Since the data isn't fetched as part of the initial server render of *this specific client component's data*, TanStack Query's cache on the client starts empty for this `queryKey`. This means `isLoading` will be `true` for the first fetch.
  * **Serialization/Deserialization Overhead (RPC):** While generally efficient, the RPC mechanism for Server Actions involves serializing arguments on the client, sending them over the network, deserializing them on the server, executing the function, serializing the result, sending it back, and deserializing it on the client. For very frequent or very large data transfers, this can add cumulative overhead compared to a pure `fetch` call to a simple JSON API.
  * **Network Latency:** Every time your filters or pagination change, you're initiating a new RPC call to the server. Network latency for each of these round trips contributes to the perceived loading time. If your server is geographically distant from your users, this effect is amplified.
  * **Potential for Bottlenecks:** If your `getProductFilteredReviews` action is complex or slow on the server (e.g., inefficient Prisma queries, large data sets), that server-side execution time adds directly to the client's perceived loading time.
  * **"Never Show Them":** This specific phrase suggests a more severe issue, potentially related to:
      * **Errors in the Server Action:** If `getProductFilteredReviews` throws an unhandled error, the RPC might fail, and `useQuery` will set `isError` to true, and `data` will remain `undefined`. You're catching the error (`console.log(error)`) but returning `undefined` from the catch block, which means `data` will always be `undefined` if an error occurs.
      * **Incorrect Query Keys:** If your `queryKey` doesn't match precisely what TanStack Query expects for a particular piece of data, it might always consider it a new query and refetch. (Though your current `queryKey` seems appropriate for its dependencies).
      * **Race Conditions/Unexpected State:** Less likely with `useQuery` but possible if there are other state management interactions or if `searchParams` updates are asynchronous in a way that causes issues.
      * **Prisma/Database Issues:** Is your database connection stable? Are queries timing out?

### How to Mitigate "Too Much Loading" without Route Handlers

Since you want to avoid Route Handlers, the primary solution is to leverage Next.js's Server Components and TanStack Query's **Hydration** feature. This shifts the *initial* data fetching burden from the client to the server, providing an instant user experience.

**The Strategy: Fetch on Server, Hydrate on Client**

1.  **Server Component (e.g., `app/product/[slug]/page.tsx`):**

      * This component will run on the server.
      * It will create a `QueryClient` instance.
      * It will **`prefetchQuery`** the data using your `getProductFilteredReviews` Server Action. Since this is happening in a Server Component, `getProductFilteredReviews` is executed directly on the server (no RPC overhead for *this initial fetch*).
      * It will then `dehydrate` the `QueryClient`'s state.
      * It will render your `ProductReviews` Client Component, wrapping it in `HydrationBoundary` and passing the dehydrated state.

2.  **Client Component (`ProductReviews.tsx`):**

      * This component will consume the data from the hydrated TanStack Query cache.
      * Its `useQuery` hook will find the prefetched data in the cache and render it immediately (`data` will be available, `isLoading` will be `false` initially).
      * **Subsequent fetches** (when filters/pagination change) will then trigger the RPC calls to your Server Action from the client, as they do now. This is where the network latency for re-fetches will still apply, but the *initial* load will be fast.

**Detailed Example for Hydration (Re-iterating and emphasizing this):**

**A. Create a `QueryProvider` Client Component (if you don't have one):**
This sets up the `QueryClientProvider` for your entire client-side app.

```typescript
// app/QueryProvider.tsx ('use client')
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching on first mount.
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: Always make a new query client
    return makeQueryClient();
  } else {
    // Browser: Make a new query client if we don't already have one
    // This is to make sure we don't accidentally share query clients across requests
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**B. Update your Root Layout (`app/layout.tsx`):**

```typescript
// app/layout.tsx
import { QueryProvider } from './QueryProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

**C. Modify your Server Component (`app/product/[slug]/page.tsx`):**

```typescript
// app/product/[slug]/page.tsx (Server Component)
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import ProductReviews from '@/components/ProductReviews'; // Your client component
import { getProductFilteredReviews } from '@/components/ProductReviews/queries'; // Your 'use server' function
import { getProductDetails } from '@/lib/product-data'; // Example: A function to get initial product info

export default async function ProductPage({ params, searchParams }) {
  const productId = params.slug;

  // Fetch initial product details (e.g., rating, numReviews, variants)
  const productDetails = await getProductDetails(productId); // This would be your server-side function

  // --- TanStack Query Server-Side Prefetching ---
  const queryClient = new QueryClient(); // New QueryClient for each request

  // Extract initial filter/sort/page values from searchParams for the prefetch
  const sorter = searchParams.sort as 'latest' | 'oldest' | 'highest' || undefined;
  const hasImages = searchParams.hasImages === 'true';
  const page = Number(searchParams.page) || 1;
  const FilterRating = Number(searchParams.rating) || undefined;
  const pageSize = 4; // Ensure this matches your client component's default

  const filters = {
    rating: FilterRating,
    hasImages: hasImages,
  };
  const sort = sorter ? { orderBy: sorter } : undefined;

  // Prefetch the reviews data using your Server Action
  await queryClient.prefetchQuery({
    queryKey: ['get-products-review', productId, sorter, hasImages, page, FilterRating],
    queryFn: () => getProductFilteredReviews(
      productId,
      filters,
      sort,
      page,
      pageSize
    ),
  });
  // --- End of Prefetching ---

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductReviews
        product={productDetails.product} // Pass server-fetched data
        rating={productDetails.rating}
        variant={productDetails.variants}
        numReviews={productDetails.numReviews}
      />
    </HydrationBoundary>
  );
}
```

**D. Your `ProductReviews.tsx` (Client Component):**
(This largely remains the same, but it will now leverage the hydrated cache)

```typescript
// ProductReviews.tsx ('use client')
import { FC, useState } from 'react'
import ProductPageReviewsSkeletonLoader from '../skeleton/reviews'
import RatingCard from './rating-card'
import ReviewsFilters from './review-filters'
import ReviewsSort from './sort'
import RatingStatisticsCard from './rating-statistics'
import ReviewCard from './review-card'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { DotLoader } from 'react-spinners'
import Pagination from '../pagination'
import ReviewDetails from './review-details'
import { getProductFilteredReviews } from './queries' // Your 'use server' function

// ... (defaultData, interfaces)

const ProductReviews: FC<Props> = ({
  product,
  rating,
  variant,
  numReviews,
}) => {
  const [averageRating, setAverageRating] = useState<number>(rating)
  const searchParams = useSearchParams()

  const sorter = searchParams.get('sort')
  const hasImages = searchParams.get('hasImages')
  const page = Number(searchParams.get('page')) || 1; // Default to 1
  const FilterRating = Number(searchParams.get('rating'));
  const pageSize = 4; // Keep consistent with server-side prefetch

  const sort = { orderBy: sorter as 'latest' | 'oldest' | 'highest' }
  const filters = {
    rating: FilterRating ? +FilterRating : undefined,
    hasImages: hasImages === 'true' ? true : false,
  }

  const { data, isFetching, isPending, isLoading, isError, error } = useQuery({
    queryKey: ['get-products-review', product.id, sorter, hasImages, page, FilterRating],
    queryFn: () =>
      getProductFilteredReviews(
        product.id,
        filters,
        sort,
        page,
        pageSize
      ),
    // Crucially, if you don't return totalReviewsCount, pagination will still be broken.
    // If you return an error in your server action, data will be undefined, and isError will be true.
  })

  // console.log("ProductReviews client state:", { data, isFetching, isPending, isLoading, isError, error });

  if (isError) {
    // Handle error gracefully, e.g., show an error message
    console.error("Error fetching reviews:", error);
    return <div>Error loading reviews. Please try again.</div>;
  }

  return (
    <div className="pt-6" id="reviews">
      {/* Show skeleton loader if data is not available (only on initial load before hydration, or if prefetch failed) */}
      {isPending && !data ? (
        <ProductPageReviewsSkeletonLoader numReviews={numReviews} />
      ) : (
        <div>
          {/* Title */}
          <div className="h-12">
            <h2 className="text-primary text-2xl font-bold">
              Custom Reviews ({data?.statistics.totalReviews || 0})
            </h2>
          </div>
          {/* Statistics */}
          <div className="w-full">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <RatingCard rating={averageRating} />
              {data?.statistics && (
                <RatingStatisticsCard
                  statistics={data.statistics.ratingStatistics}
                />
              )}
            </div>
          </div>
          <>
            <div className="space-y-6">
              <ReviewsFilters stats={data?.statistics} />
              <ReviewsSort />
            </div>
            {/* Reviews */}
            {isFetching && data ? ( // Only show spinner if refetching and data is present
              <div className="h-24 w-full flex items-center justify-center">
                <DotLoader color="#f5f5f5" />
              </div>
            ) : (
              <div className="mt-6  grid md:grid-cols-2 gap-4">
                {!!data?.reviews?.length ? (
                  <>
                    <div className="flex flex-col gap-3">
                      {data?.reviews
                        .slice(0, Math.ceil(data?.reviews?.length / 2))
                        .map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            product={product}
                          />
                        ))}
                    </div>
                    <div className="flex flex-col gap-3">
                      {data?.reviews
                        .slice(Math.ceil(data?.reviews?.length / 2))
                        .map((review) => (
                          <ReviewCard
                            key={review.id}
                            review={review}
                            product={product}
                          />
                        ))}
                    </div>
                  </>
                ) : (
                  <>No Reviews yet.</>
                )}
              </div>
            )}
            {/* Pagination - Requires totalReviewsCount from getProductFilteredReviews */}
            {data?.totalReviewsCount !== undefined && (
              <Pagination
                currentPage={page}
                totalPages={Math.ceil(data.totalReviewsCount / pageSize)}
              />
            )}
          </>
        </div>
      )}
      <div className="mt-10">
        <ReviewDetails
          productId={product.id}
          variantsInfo={variant}
          reviews={data?.reviews} // Consider how you want to update this after a new review
          setAverageRating={setAverageRating}
        />
      </div>
    </div>
  )
}

export default ProductReviews
```

**E. Update your `getProductFilteredReviews` to return `totalReviewsCount` and handle errors gracefully:**

```typescript
// queries.ts ('use server')
import { prisma } from '@/lib/prisma';
import { getRatingStatistics } from '../../lib/queries/review';
import { SortOrder } from '../../lib/queries/product';

// ... (types)

export const getProductFilteredReviews = async (
  productId: string,
  filters: { rating?: number; hasImages?: boolean },
  sort: { orderBy: 'latest' | 'oldest' | 'highest' } | undefined,
  page: number = 1,
  pageSize: number = 4
) => {
  const reviewFilter: any = {
    productId,
  };

  if (filters.rating) {
    reviewFilter.rating = filters.rating; // Exact rating match, or adjust to range if needed
  }

  if (filters.hasImages) {
    reviewFilter.images = {
      some: {},
    };
  }

  const sortOption: { createdAt?: SortOrder; rating?: SortOrder } =
    sort && sort.orderBy === 'latest'
      ? { createdAt: 'desc' }
      : sort && sort.orderBy === 'oldest'
      ? { createdAt: 'asc' }
      : { rating: 'desc' }; // Default to highest rating

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  try {
    const statistics = await getRatingStatistics(productId);

    // Get total count of reviews matching filters (before pagination)
    const totalReviewsCount = await prisma.review.count({
      where: reviewFilter,
    });

    const reviews = await prisma.review.findMany({
      where: reviewFilter,
      include: {
        images: true,
        user: {
          include: {
            image: true,
          },
        },
      },
      orderBy: sortOption,
      skip,
      take,
    });

    return { reviews, statistics, totalReviewsCount }; // Crucially return totalReviewsCount
  } catch (error) {
    console.error('Error in getProductFilteredReviews:', error);
    // Return a structured error response or default data
    // Returning default data prevents `data` from being `undefined` on the client.
    return {
      reviews: [],
      statistics: defaultData, // Assuming defaultData is defined elsewhere
      totalReviewsCount: 0,
      error: 'Failed to load reviews.', // Add an error message
    };
  }
};
```

### Addressing "Never Show Them"

If products *never* show up, even after a long time, and your network tab shows no successful fetch, then:

1.  **Server Action Execution Failure:** The RPC call to `getProductFilteredReviews` might be failing entirely.
      * Check your server logs for errors from `getProductFilteredReviews`.
      * Ensure the path to `queries.ts` is correct and it's truly a `'use server'` file.
      * Could there be a firewall or network configuration blocking RPC calls? (Less likely for a local dev setup, but possible in deployment).
2.  **Unhandled Errors in `getProductFilteredReviews`:** As noted, if `getProductFilteredReviews` throws an error and the `catch` block doesn't return a valid structure, `data` in `useQuery` will remain `undefined`. Add robust error handling to `getProductFilteredReviews` to return sensible defaults or an error message.
3.  **Incorrect `queryKey`:** While yours seems fine, a mismatch between the `queryKey` used for prefetching and the `queryKey` used in `useQuery` on the client would prevent hydration, forcing a client-side fetch.
4.  **Infinite Loop/Bad State:** Check if any `useEffect` or `useState` updates in your component are inadvertently triggering an infinite loop of re-renders or search param changes, leading to constant refetches that never complete.

By implementing server-side prefetching and hydration, you'll ensure that the initial render is fast and the user sees content immediately. Subsequent filtering and pagination will still involve client-side RPC calls to your Server Action, but the *initial blank screen* issue should be resolved.