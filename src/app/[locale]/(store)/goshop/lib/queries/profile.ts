import { currentUser } from '@/lib/auth'
import {
  OrderStatus,
  OrderTableDateFilter,
  OrderTableFilter,
  PaymentStatus,
} from '../../types'
import { subMonths, subYears } from 'date-fns-jalali'
import { prisma } from '@/lib/prisma'

export const getUserOrders = async (
  filter: OrderTableFilter = '',
  period: OrderTableDateFilter = '',
  search = '' /* Search by Order id, store name, products name */,
  page: number = 1,
  pageSize: number = 10
) => {
  // Retrieve current user
  const user = await currentUser()

  // Check if user is authenticated
  if (!user) throw new Error('Unauthenticated.')

  // Calculate pagination values
  const skip = (page - 1) * pageSize

  // Construct the base query
  const whereClause: any = {
    AND: [
      {
        userId: user.id,
      },
    ],
  }

  // Apply filters
  if (filter === 'unpaid')
    whereClause.AND.push({ paymentStatus: PaymentStatus.Pending })
  if (filter === 'toShip')
    whereClause.AND.push({ orderStatus: OrderStatus.Processing })
  if (filter === 'shipped')
    whereClause.AND.push({ orderStatus: OrderStatus.Shipped })
  if (filter === 'delivered')
    whereClause.AND.push({ orderStatus: OrderStatus.Delivered })

  // Apply period filter
  const now = new Date()
  if (period === 'last-6-months') {
    whereClause.AND.push({
      createdAt: { gte: subMonths(now, 6) },
    })
  }
  if (period === 'last-1-year')
    whereClause.AND.push({ createdAt: { gte: subYears(now, 1) } })
  if (period === 'last-2-years')
    whereClause.AND.push({ createdAt: { gte: subYears(now, 2) } })

  // Apply search filter
  if (search.trim()) {
    whereClause.AND.push({
      OR: [
        {
          id: { contains: search }, // Search by order ID
        },
        {
          groups: {
            some: {
              store: {
                name: { contains: search }, // Search by store name (no mode here)
              },
            },
          },
        },
        {
          groups: {
            some: {
              items: {
                some: {
                  name: { contains: search }, // Search by product name (no mode here)
                },
              },
            },
          },
        },
      ],
    })
  }

  // Fetch orders for the current page
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      groups: {
        include: {
          items: true,
          _count: {
            select: {
              items: true,
            },
          },
        },
      },
      shippingAddress: {
        include: {
          country: true,
        },
      },
    },
    take: pageSize, // Limit to page size
    skip, // Skip the orders of previous pages
    orderBy: {
      updatedAt: 'desc', // Sort by most updated recently
    },
  })

  // Fetch total count of orders for the query
  const totalCount = await prisma.order.count({ where: whereClause })

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize)

  // Return paginated data with metadata
  return {
    orders,
    totalPages,
    currentPage: page,
    pageSize,
    totalCount,
  }
}
