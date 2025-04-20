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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Hooks and utilities

import { useModal } from '@/providers/modal-provider'

// Lucide icons
import {
  CopyPlus,
  FilePenLine,
  MoreHorizontal,
  SquareStack,
  Trash,
} from 'lucide-react'

// Queries

// Tanstack React Table
import { ColumnDef } from '@tanstack/react-table'

// Types

import Link from 'next/link'
// import { toast } from 'sonner'
// import { deleteProduct } from '@/lib/actions/dashboard/products'
import { StoreProductType } from '@/lib/types'
import { deleteProduct } from '@/lib/actions/dashboard/products'
import { usePathname } from '@/navigation'
import { format } from 'date-fns-jalali'

export const columns: ColumnDef<StoreProductType>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => {
      return <span>{row.original.code}</span>
    },
  },
  {
    accessorKey: 'startDate',
    header: 'StartDate',
    cell: ({ row }) => {
      return <span>{format(row.original.startDate, 'Pp HH:mm:ss')}</span>
    },
  },
  {
    accessorKey: 'endDate',
    header: 'EndDate',
    cell: ({ row }) => {
      return <span>{format(row.original.endDate, 'Pp HH:mm:ss')}</span>
    },
  },

  {
    accessorKey: 'discount',
    header: 'Discount',
    cell: ({ row }) => {
      return <span>{row.original.discount}</span>
    },
  },

  // {
  //   id: 'actions',
  //   cell: ({ row }) => {
  //     const rowData = row.original

  //     return (
  //       <CellActions
  //         productId={rowData.id}
  //         href={`/dashboard/seller/stores/${row.original.store.url}/products/${row.original.id}/variants`}
  //       />
  //     )
  //   },
  // },
]

// Define props interface for CellActions component
interface CellActionsProps {
  productId: string
  href: string
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ productId, href }) => {
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
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href={href}>
              <DropdownMenuItem className="flex gap-2">
                <SquareStack size={15} /> Variants
              </DropdownMenuItem>
            </Link>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
                <Trash size={15} /> Delete product
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuGroup>
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
