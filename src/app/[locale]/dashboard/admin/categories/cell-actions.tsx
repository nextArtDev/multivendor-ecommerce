import { usePathname } from '@/navigation'
import CategoryDetails from '@/components/dashboard/forms/category-details'
import { ModalData, useModal } from '@/providers/modal-provider'
import CustomModal from '@/components/dashboard/custom-modal'
import { useToast } from '@/hooks/use-toast'
import { getCategoryById } from '@/lib/queries/dashboard'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'
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
import { Category, Image } from '@prisma/client'

import { useActionState } from 'react'
import { deleteCategory } from '@/lib/actions/dashboard/categories'

interface CellActionsProps {
  rowData: Category & { images: Image[] }
}

// CellActions component definition
export const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  // Hooks
  const { setOpen, setClose } = useModal()
  const path = usePathname()
  const { toast } = useToast()

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, deleteAction, pending] = useActionState(
    deleteCategory.bind(null, path, rowData.id as string),
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
              try {
                setOpen(
                  <CustomModal>
                    <CategoryDetails initialData={rowData} />
                  </CustomModal>,
                  async () => {
                    const data = await getCategoryById(rowData.id)
                    return {
                      rowData: data,
                    }
                  }
                )
              } catch (error) {
                console.error('Error:', error)
              }
            }}
          >
            {/* <Link
              className="flex items-center gap-2"
              href={`/dashboard/admin/categories/new/${rowData.id}`}
            >
            </Link> */}
            <Edit size={15} />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
              <Trash size={15} /> Delete category
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
            category and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            className="bg-destructive hover:bg-destructive mb-2 text-white"
            onClick={() => {
              toast({
                title: 'Deleted category',
                description: 'The category has been deleted.',
              })

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
