'use client'

// React, Next.js imports
import Image from 'next/image'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useModal } from '@/providers/modal-provider'

// Lucide icons
import {
  BadgeCheck,
  BadgeMinus,
  Expand,
  MoreHorizontal,
  Trash,
} from 'lucide-react'

// Tanstack React Table
import CustomModal from '@/components/dashboard/custom-modal'
import StoreStatusSelect from '@/components/dashboard/forms/store-status-select'
import StoreSummary from '@/components/dashboard/store-summary'
import { deleteStore } from '@/lib/actions/dashboard/store'
import { AdminStoreType, StoreStatus } from '@/lib/types'
import { usePathname } from '@/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'

export const columns: ColumnDef<AdminStoreType>[] = [
  {
    accessorKey: 'cover',
    header: '',
    cell: ({ row }) => {
      // console.log({ row })
      return (
        <div className="relative h-full w-full rounded-xl overflow-hidden">
          <Image
            src={row.original?.cover?.url}
            alt=""
            width={150}
            height={150}
            className="rounded-full object-cover  "
          />
          <Image
            src={row.original?.logo?.url}
            alt=""
            width={100}
            height={100}
            className=" rounded-full object-cover shadow-2xl absolute top-1/2 -translate-y-1/2 left-4"
          />
        </div>
      )
    },
  },
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
  // {
  //   accessorKey: 'description',
  //   header: 'Description',
  //   cell: ({ row }) => {
  //     return (
  //       <span className="text-sm line-clamp-3">{row.original.description}</span>
  //     )
  //   },
  // },

  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      return <span>/{row.original.url}</span>
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <StoreStatusSelect
          storeId={row.original.id}
          status={row.original.status as StoreStatus}
        />
      )
    },
  },
  {
    accessorKey: 'featured',
    header: 'Featured',
    cell: ({ row }) => {
      return (
        <span className="text-muted-foreground flex justify-center">
          {row.original.featured ? (
            <BadgeCheck className="stroke-green-300" />
          ) : (
            <BadgeMinus />
          )}
        </span>
      )
    },
  },
  {
    accessorKey: 'open',
    header: '',
    cell: ({ row }) => {
      return <OpenButton store={row.original} />
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions storeId={rowData.id} />
    },
  },
]

// Define props interface for CellActions component
interface CellActionsProps {
  storeId: string
}

// CellActions component definition
const CellActions: React.FC<CellActionsProps> = ({ storeId }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { setOpen, setClose } = useModal()
  const path = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deleteAction, pending] = useActionState(
    deleteStore.bind(null, path, storeId as string),
    {
      errors: {},
    }
  )
  // Return null if rowData or rowData.id don't exist
  if (!storeId) return null

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
              <Trash size={15} /> Delete store
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
            This action cannot be undone. This will permanently delete the store
            and related data.
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
              {/* <input className="hidden" /> */}
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
const OpenButton: React.FC<{ store: AdminStoreType }> = ({ store }) => {
  const { setOpen } = useModal()

  return (
    <button
      className="font-sans flex justify-center gap-2 items-center mx-auto text-lg text-gray-50 bg-[#0A0D2D] backdrop-blur-md lg:font-semibold isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-blue-primary hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
      onClick={() => {
        setOpen(
          <CustomModal maxWidth="!max-w-3xl">
            <StoreSummary store={store} />
          </CustomModal>
        )
      }}
    >
      View
      <span className="w-7 h-7 rounded-full bg-white grid place-items-center">
        <Expand className="w-5 stroke-black" />
      </span>
    </button>
  )
}
