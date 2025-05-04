import ProductStatusTag from '@/app/[locale]/(store)/goshop/components/product-status'
import { ProductStatus } from '@/app/[locale]/(store)/goshop/types'
import { updateOrderItemStatus } from '@/lib/actions/dashboard/order'
import { usePathname } from '@/navigation'
import { useRouter } from 'next/navigation'
import { FC, useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  storeId: string
  orderItemId: string
  status: ProductStatus
}

const ProductStatusSelect: FC<Props> = ({ orderItemId, status, storeId }) => {
  const [newStatus, setNewStatus] = useState<ProductStatus>(status)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [needsSubmission, setNeedsSubmission] = useState(false)
  // Options
  const options = Object.values(ProductStatus).filter((s) => s !== newStatus)

  const path = usePathname()
  const formRef = useRef<HTMLFormElement>(null)
  // Handle click
  // const handleClick = async (selectedStatus: ProductStatus) => {
  //   try {
  //     const response = await updateOrderItemStatus(
  //       storeId,
  //       orderItemId,
  //       selectedStatus
  //     )
  //     if (response) {
  //       setNewStatus(response as ProductStatus)
  //       setIsOpen(false)
  //     }
  //   } catch (error: any) {
  //     toast.error(error.toString())
  //   }
  // }
  useEffect(() => {
    if (needsSubmission && formRef.current) {
      formRef.current.requestSubmit()
      setNeedsSubmission(false)
    }
  }, [newStatus, needsSubmission])

  const [ActionState, updateOrderItemAction, pending] = useActionState(
    updateOrderItemStatus.bind(null, path, storeId as string, orderItemId),
    {
      errors: {},
    }
  )
  console.log({ ActionState })
  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ProductStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[170px]">
          <form ref={formRef} action={updateOrderItemAction}>
            <input
              id="statusInput"
              type="hidden"
              name="status"
              value={newStatus} // This will be set dynamically when submitting
            />
            {options.map((option) => (
              <button
                type="submit"
                key={option}
                className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                onClick={() => {
                  setNewStatus(option)
                }}
              >
                <ProductStatusTag status={option} />
              </button>
            ))}
          </form>
        </div>
      )}
    </div>
  )
}

export default ProductStatusSelect
