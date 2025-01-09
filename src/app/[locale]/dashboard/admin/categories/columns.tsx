'use client'

// React, Next.js imports

import NextImage from 'next/image'

// Hooks and utilities

// Lucide icons
import { BadgeCheck, BadgeMinus } from 'lucide-react'

// Queries
// import { deleteCategory, getCategory } from '@/queries/category'

// Tanstack React Table
import { ColumnDef } from '@tanstack/react-table'

// Prisma models
import { Category, Image } from '@prisma/client'
import { CellActions } from './cell-actions'

export const columns: ColumnDef<Category & { images: Image[] }>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      return (
        <div className="relative h-44 min-w-64 rounded-xl overflow-hidden">
          <NextImage
            src={row.original?.images[0]?.url}
            alt=""
            width={1000}
            height={1000}
            className="w-40 h-40 rounded-full object-cover shadow-2xl"
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

  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => {
      return <span>/{row.original.url}</span>
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
    id: 'actions',
    cell: ({ row }) => {
      const rowData = row.original

      return <CellActions rowData={rowData} />
    },
  },
]

// Define props interface for CellActions component
