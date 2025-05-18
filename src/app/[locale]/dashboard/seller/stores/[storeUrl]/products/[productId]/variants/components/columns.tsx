'use client'

// React, Next.js imports
import { useActionState } from 'react'
import NextImage from 'next/image'

// UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Hooks and utilities

import { useModal } from '@/providers/modal-provider'

// Lucide icons
import { CopyPlus, FilePenLine, MoreHorizontal, Trash } from 'lucide-react'

// Queries

// Tanstack React Table
import { ColumnDef } from '@tanstack/react-table'

// Types

import Link from 'next/link'
// import { toast } from 'sonner'
// import { deleteProduct } from '@/lib/actions/dashboard/products'
import { StoreProductType } from '@/lib/types'
import { Color, Image, ProductVariant, Size } from '@prisma/client'
import { deleteProduct } from '@/lib/actions/dashboard/products'
import { usePathname } from '@/navigation'

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-y-3">
          {/* Product name */}
          <h1 className="font-bold truncate pb-3 border-b capitalize">
            {row.original.variantName}
          </h1>
          {/* Product variants */}
          <div className="relative flex flex-wrap gap-2">
            {/* {row.original.map(
              (
                variant: ProductVariant & { variantImage: Image[] | null } & {
                  colors: Color[]
                } & { sizes: Size[] }
              ) => ( */}
            <div key={row.original.id} className="flex flex-col gap-y-2 group">
              <div className="relative flex  cursor-pointer p-2">
                {row.original?.variantImage && (
                  <NextImage
                    src={row.original?.variantImage[0]?.url}
                    alt={`${row.original.variantName} image`}
                    width={1000}
                    height={1000}
                    className="max-w-24 h-24 rounded-md object-cover shadow-sm"
                  />
                )}
                {/* <Link
                  href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/${variant.id}`}
                >
                  <div className="w-[304px] h-full absolute top-0 left-0 bottom-0 right-0 z-0 rounded-sm bg-black/50 transition-all duration-150 hidden group-hover:block">
                    <FilePenLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                  </div>
                </Link> */}

                <div className="flex mt-2 gap-2 p-1">
                  <div className=" flex flex-wrap max-w-sm gap-2 rounded-md">
                    {row.original.colors.map((color: Color) => (
                      <span
                        key={color.name}
                        className="w-4 h-4 rounded-full shadow-2xl"
                        style={{ backgroundColor: color.name }}
                      />
                    ))}
                  </div>
                  <div>
                    <h1 className="max-w-40 capitalize text-sm">
                      {row.original.variantName}
                    </h1>

                    <div className="flex flex-wrap gap-2 max-w-72 mt-1">
                      {row.original.sizes.map((size: Size) => (
                        <span
                          key={size.size}
                          className="w-fit flex gap-2 p-1 rounded-md text-[11px] font-medium border-2 bg-white/10"
                        >
                          {size.size} - ({size.quantity}) - {size.price}$
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* )
            )} */}
          </div>
        </div>
      )
    },
  },

  // {
  //   accessorKey: 'offerTag',
  //   header: 'Offer',
  //   cell: ({ row }) => {
  //     const offerTag = row.original.offerTag
  //     return <span>{offerTag ? offerTag.name : '-'}</span>
  //   },
  // },
  // {
  //   accessorKey: 'brand',
  //   header: 'Brand',
  //   cell: ({ row }) => {
  //     return <span>{row.original.brand}</span>
  //   },
  // },

  // {
  //   accessorKey: 'new-variant',
  //   header: '',
  //   cell: ({ row }) => {
  //     return (
  //       <Link
  //         href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants/new`}
  //       >
  //         <CopyPlus className="hover:text-blue-200" />
  //       </Link>
  //     )
  //   },
  // },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions productId={rowData.id} />
    },
  },
]

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ productId }) => {
  // Hooks
  const { setClose } = useModal()
  // const [loading, setLoading] = useState(false)
  const path = usePathname()

  // const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deleteAction, pending] = useActionState(
    deleteProduct.bind(null, path, productId as string),
    {
      errors: {},
    }
  )
  if (!productId) return null

  // Return null if rowData or rowData.id don't exist

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete product
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the
            product and variants that exist inside product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={() => {
              setClose()
            }}
          >
            <form action={deleteAction}>
              <input className="hidden" />
              <Button
                disabled={pending}
                variant={'ghost'}
                type="submit"
                className="hover:bg-transparent active:bg-transparent w-full outline-none"
              >
                Delete
              </Button>
            </form>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
