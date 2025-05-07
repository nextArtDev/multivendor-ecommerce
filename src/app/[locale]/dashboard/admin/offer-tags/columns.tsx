'use client'

// React, Next.js imports
import { useActionState } from 'react'

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useModal } from '@/providers/modal-provider'

// Lucide icons
import { Edit, MoreHorizontal, Trash } from 'lucide-react'

// Tanstack React Table
import { ColumnDef } from '@tanstack/react-table'

// Prisma models
import CustomModal from '@/components/dashboard/custom-modal'
import OfferTagDetails from '@/components/dashboard/forms/offer-tags-details'
import { usePathname } from '@/navigation'
import { OfferTag } from '@prisma/client'
import { toast } from 'sonner'
import { deleteOfferTag } from '@/lib/actions/dashboard/offerTag'
import { getOfferTag } from '@/lib/queries/dashboard/offer-tags'

export const columns: ColumnDef<OfferTag>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <span className="font-extrabold text-lg capitalize">
          {row.original.name}
        </span>
      )
    },
  },

  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      return <span>/{row.original.url}</span>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions rowData={rowData} />
    },
  },
]

// Define props interface for CellActions component
interface CellActionsProps {
  rowData: OfferTag
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  // Hooks
  const { setOpen, setClose } = useModal()
  const path = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deleteAction, pending] = useActionState(
    deleteOfferTag.bind(null, path, rowData.id as string),
    {
      errors: {},
    }
  )

  // Return null if rowData or rowData.id don't exist
  if (!rowData || !rowData.id) return null

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
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                // Custom modal component
                <CustomModal>
                  {/* Offer tag component */}
                  <OfferTagDetails initialData={{ ...rowData }} />
                </CustomModal>,
                async () => {
                  return {
                    rowData: await getOfferTag(rowData?.id),
                  }
                }
              )
            }}
          >
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete offer tag
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
            This action cannot be undone. This will permanently delete the offer
            tag.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={async () => {
              toast('The category has been deleted.')

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
