'use client'

import { FC } from 'react'

interface Props {
  orderId: string
  amount: number
}

const OrderPayment: FC<Props> = ({ amount, orderId }) => {
  return (
    <div className="w-full h-full min-[768px]:min-w-[400px] space-y-5">
      {/* Paypal */}

      {/* <div className="mt-6">
        <PaypalWrapper>
          <PaypalPayment orderId={orderId} />
        </PaypalWrapper>
      </div> */}
      {/* Stripe */}

      {/* <StripeWrapper amount={amount}>
        <StripePayment orderId={orderId} />
      </StripeWrapper> */}
    </div>
  )
}

export default OrderPayment
