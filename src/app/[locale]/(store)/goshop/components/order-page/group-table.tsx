'use client'

import Image from 'next/image'
import React from 'react'
import ProductRow from './product-row'
import { useMediaQuery } from 'react-responsive'
import ProductRowGrid from './product-row-grid'
import { cn } from '@/lib/utils'
import OrderStatusTag from './order-status'
import { OrderGroupWithItemsType, OrderStatus } from '../../types'

export default function OrderGroupTable({
  group,
  deliveryInfo,
  check,
}: {
  group: OrderGroupWithItemsType
  deliveryInfo: {
    shippingService: string
    deliveryMinDate: string
    deliveryMaxDate: string
  }
  check: boolean
}) {
  const { shippingService, deliveryMaxDate, deliveryMinDate } = deliveryInfo
  const { coupon, couponId, subTotal, total, shippingFees } = group
  let discountedAmount = 0
  if (couponId && coupon) {
    discountedAmount = ((subTotal + shippingFees) * coupon.discount) / 100
  }
  const isBigScreen = useMediaQuery({ query: '(min-width: 1400px)' })

  return (
    <div className="border border-secondary rounded-xl pt-6  max-lg:mx-auto lg:max-w-full">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 pb-6 border-b border-secondary">
        <div>
          <p className="font-semibold text-base leading-7 ">
            Order Id:
            <span className="text-muted-foreground font-medium ms-2">
              #{group.id}
            </span>
          </p>
          <div className="flex items-center gap-x-2 mt-4">
            {group.store.logo && (
              <Image
                src={group.store.logo?.url}
                alt={group.store.name}
                width={100}
                height={100}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <span className=" font-medium">{group.store.name}</span>
            <div className="w-[1px] h-5 bg-border mx-2" />
            <p>{shippingService}</p>
            <div className="w-[1px] h-5 bg-border mx-2" />
          </div>
        </div>
        <div className="mt-4 xl:mt-10">
          <OrderStatusTag status={group.status as OrderStatus} />
        </div>
      </div>
      <div className="w-full  min-[400px] px-6 ">
        <div>
          {group.items.map((product, index) => (
            <>
              {isBigScreen ? (
                <ProductRowGrid key={index} product={product} />
              ) : (
                <ProductRow key={index} product={product} />
              )}
            </>
          ))}
        </div>
        <div className="flex items-center max-lg:mt-3 text-center">
          <div className="flex flex-col p-2 pb-4">
            <p className="font-medium text-sm whitespace-nowrap leading-6 ">
              Expected Delivery Time
            </p>
            <p className="font-medium text-base whitespace-nowrap leading-7 lg:mt-3 text-emerald-500">
              {deliveryMinDate} - {deliveryMaxDate}
            </p>
          </div>
        </div>
      </div>
      {/* Group info */}
      <div
        className={cn(
          'w-full border-t border-secondary px-6 flex flex-col 2xl:flex-row items-center justify-between',
          {
            'xl:flex-row': check,
          }
        )}
      >
        <div
          className={cn(
            'flex flex-col 2xl:flex-row items-center max-lg:border-b border-secondary',
            {
              'lg:flex-row': check,
            }
          )}
        >
          <button className="flex rounded-md outline-0 py-6 sm:pr-6 sm:border border-secondary whitespace-nowrap gap-2 items-center justify-center font-semibold group text-lg  bg-secondary transition-all duration-500 hover:text-primary">
            <svg
              className="stroke-primary transition-all duration-500 group-hover:stroke-primary-foreground"
              xmlns="http://www.w3.org/2000/svg"
              width={22}
              height={22}
              viewBox="0 0 22 22"
              fill="none"
            >
              <path
                d="M5.5 5.5L16.5 16.5M16.5 5.5L5.5 16.5"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Cancel Order
          </button>
          <p className="font-medium text-lg  px-6 py-3 max-lg:text-center">
            Subtotal:
            <span className="text-muted-foreground ms-1">
              ${group.subTotal.toFixed(2)}
            </span>
          </p>
          <p className="font-medium text-lg  px-6 py-3 max-lg:text-center">
            Shipping Fees:
            <span className="text-muted-foreground ms-1">
              ${group.shippingFees.toFixed(2)}
            </span>
          </p>
          {group.couponId && (
            <p className="font-medium text-lg text-accent-foreground pl-6 py-3 max-lg:text-center">
              Coupon ({coupon?.code})
              <span className="text-muted-foreground ms-1">
                (-{coupon?.discount}%)
              </span>
              <span className="text-muted-foreground ms-1">
                (-${discountedAmount.toFixed(2)})
              </span>
            </p>
          )}
        </div>
        <div>
          <p className="font-semibold text-xl  py-4">
            Total price:
            <span className="text-blue-600 ms-1">${total.toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
