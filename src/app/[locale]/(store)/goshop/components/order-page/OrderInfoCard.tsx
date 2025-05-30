import { PaymentDetails } from '@prisma/client'

export default function OrderInfoCard({
  totalItemsCount,
  deliveredItemsCount,
  paymentDetails,
}: {
  totalItemsCount: number
  deliveredItemsCount: number
  paymentDetails: PaymentDetails | null
}) {
  return (
    <div>
      <div className="p-4 shadow-sm w-full">
        <div className="flex justify-between">
          <div className="space-y-4">
            <p className=" text-sm">Total Items</p>
            <p className=" text-sm">Delivered</p>
            <p className=" text-sm">Payment Status</p>
            <p className=" text-sm">Payment Method</p>
            <p className=" text-sm">Payment Refrence</p>
            <p className=" text-sm">Paid at</p>
          </div>
          <div className="text-right space-y-4">
            <p className=" text-muted-foreground text-sm">{totalItemsCount}</p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {deliveredItemsCount}
            </p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {paymentDetails ? paymentDetails.status : 'Unpaid'}
            </p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {paymentDetails ? paymentDetails.paymentMethod : '-'}
            </p>
            <p className="pt-0.5 text-muted-foreground text-xs">
              {paymentDetails ? paymentDetails.paymentInetntId : '-'}
            </p>
            <p className="mt-0.5 text-muted-foreground text-sm">
              {paymentDetails && paymentDetails.status === 'Completed'
                ? paymentDetails.updatedAt.toDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
