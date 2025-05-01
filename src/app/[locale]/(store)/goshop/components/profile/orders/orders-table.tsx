'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import OrderTableHeader from './order-table-header'
import {
  OrderStatus,
  OrderTableDateFilter,
  OrderTableFilter,
  PaymentStatus,
  UserOrderType,
} from '../../../types'
import PaymentStatusTag from '../../order-page/payment-status'
import OrderStatusTag from '../../order-page/order-status'
import { getUserOrders } from '../../../lib/queries/profile'
import Pagination from '../../pagination'

export default function OrdersTable({
  orders,
  totalPages,
  prev_filter,
}: {
  orders: UserOrderType[]
  totalPages: number
  prev_filter?: OrderTableFilter
}) {
  const [data, setData] = useState<UserOrderType[]>(orders)

  // Pagination
  const [page, setPage] = useState<number>(1)
  const [totalDataPages, setTotalDataPages] = useState<number>(totalPages)

  // Filter
  const [filter, setFilter] = useState<OrderTableFilter>(prev_filter || '')

  // Date period filter
  const [period, setPeriod] = useState<OrderTableDateFilter>('')

  // Search filter
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    // Reset to page 1 when filters or search changes
    setPage(1)
  }, [filter, period, search])

  useEffect(() => {
    const getData = async () => {
      const res = await getUserOrders(filter, period, search, page)
      if (res) {
        setData(res.orders)
        setTotalDataPages(res.totalPages)
      }
    }
    getData()
  }, [page, filter, search, period])
  return (
    <div>
      <div className="">
        {/* Header */}
        <OrderTableHeader
          filter={filter}
          setFilter={setFilter}
          period={period}
          setPeriod={setPeriod}
          search={search}
          setSearch={setSearch}
        />
        {/* Table */}
        <div className="overflow-hidden">
          <div className="bg-white px-6 py-1">
            {/* Scrollable Table Container */}
            <div className="max-h-[700px] overflow-x-auto overflow-y-auto scrollbar border rounded-md">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Order
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Products
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Items
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Payment
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Delivery
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4">
                      Total
                    </th>
                    <th className="cursor-pointer text-sm border-y p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((order) => {
                    const totalItemsCount = order.groups.reduce(
                      (total, group) => total + group._count.items,
                      0
                    )
                    const images = Array.from(
                      order.groups.flatMap((g) => g.items.map((p) => p.image))
                    )
                    return (
                      <tr key={order.id} className="border-b">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                              <p className="block antialiased font-sans text-sm leading-normal font-normal">
                                #{order.id}
                              </p>
                              <p className="block antialiased font-sans text-sm leading-normal font-normal">
                                Placed on: {order.createdAt.toDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex">
                            {images.slice(0, 5).map((img, i) => (
                              <Image
                                key={img}
                                src={img}
                                alt=""
                                width={50}
                                height={50}
                                className="w-7 h-7 object-cover shadow-sm rounded-full"
                                style={{ transform: `translateX(-${i * 8}px)` }}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="p-4">{totalItemsCount} items</td>
                        <td className="p-4 text-center">
                          <PaymentStatusTag
                            status={order.paymentStatus as PaymentStatus}
                            isTable
                          />
                        </td>
                        <td className="p-4 ">
                          <OrderStatusTag
                            status={order.orderStatus as OrderStatus}
                          />
                        </td>
                        <td className="p-4">${order.total.toFixed(2)}</td>
                        <td className="p-4">
                          <Link href={`/goshop/order/${order.id}`}>
                            <span className="text-xs text-blue-primary cursor-pointer hover:underline">
                              View
                            </span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {(orders.length >= totalPages - 1 || page) && (
        <Pagination
          // page={page}
          // setPage={setPage}
          // totalPages={totalDataPages}
          totalPages={
            // totalPages
            // filters.rating || filters.hasImages
            //   ? orders.length / pageSize + 1
            // :
            1 / totalPages + 1
          }
        />
      )}
    </div>
  )
}
