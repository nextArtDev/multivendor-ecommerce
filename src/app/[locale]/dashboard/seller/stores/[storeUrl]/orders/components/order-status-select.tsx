import OrderStatusTag from '@/app/[locale]/(store)/goshop/components/order-page/order-status'
import { OrderStatus } from '@/app/[locale]/(store)/goshop/types'
import { updateOrderGroupStatus1 } from '@/lib/actions/dashboard/order'

import { FC, useState } from 'react'
import { toast } from 'sonner'

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

  // Handle click
  const handleClick = async (selectedStatus: OrderStatus) => {
    try {
      const response = await updateOrderGroupStatus1(
        storeId,
        groupId,
        selectedStatus
      )
      if (response) {
        setNewStatus(response as OrderStatus)
        setIsOpen(false)
      }
    } catch (error: any) {
      toast.error(error.toString())
    }
  }
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
        <div className="absolute !z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-md shadow-md mt-2 w-[140px]">
          {options.map((option) => (
            <button
              key={option}
              className="w-full flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              onClick={() => handleClick(option)}
            >
              <OrderStatusTag status={option} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderStatusSelect
