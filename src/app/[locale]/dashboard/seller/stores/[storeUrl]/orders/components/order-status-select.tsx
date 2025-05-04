import { OrderStatus } from '@/app/[locale]/(store)/goshop/types'
import { updateOrderGroupStatus } from '@/lib/actions/dashboard/order'

import { FC, useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import OrderStatusTag from './order-status'
import { usePathname } from '@/navigation'

interface Props {
  storeId: string
  groupId: string
  status: OrderStatus
}

const OrderStatusSelect: FC<Props> = ({ groupId, status, storeId }) => {
  const [newStatus, setNewStatus] = useState<OrderStatus>(status)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  // Options
  const options = Object.values(OrderStatus).filter((s) => s !== newStatus)
  const path = usePathname()
  const formRef = useRef<HTMLFormElement>(null)
  // Handle click
  // const handleClick = async (selectedStatus: OrderStatus) => {
  //   try {
  //     const response = await updateOrderGroupStatus(
  //       storeId,
  //       groupId,
  //       selectedStatus
  //     )
  //     if (response) {
  //       setNewStatus(response as OrderStatus)
  //       setIsOpen(false)
  //     }
  //   } catch (error: unknown) {
  //     toast.error(error.toString())
  //   }
  // }
  useEffect(() => {
    if (formRef.current) {
      formRef.current.requestSubmit()
    }
  }, [newStatus])
  const [_, deleteAction, pending] = useActionState(
    updateOrderGroupStatus.bind(null, path, storeId as string, groupId),
    {
      errors: {},
    }
  )
  return (
    <div className="relative">
      {/* Current status */}
      <div
        className="cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <OrderStatusTag status={newStatus} />
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50   border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[140px]">
          <form ref={formRef} action={deleteAction}>
            {options.map((option) => (
              <div key={option}>
                <button
                  disabled={pending}
                  className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setNewStatus(option)}
                  // onClick={() => handleClick(option)}
                >
                  <OrderStatusTag status={option} />
                </button>
                <input
                  disabled={pending}
                  className="hidden"
                  name="status"
                  value={newStatus}
                  onChange={() => setNewStatus(option)}
                />
              </div>
            ))}
          </form>
        </div>
      )}
    </div>
  )
}

export default OrderStatusSelect
