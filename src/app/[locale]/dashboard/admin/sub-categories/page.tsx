// Queries

// Data table

import { Plus } from 'lucide-react'

import { columns } from './columns'

import DataTable from '@/components/ui/data-table'
import { getAllSubCategories } from '@/lib/queries/dashboard'
import SubCategoryDetails from '@/components/dashboard/forms/sub-category-details copy'
import { prisma } from '@/lib/prisma'

export default async function AdminCategoriesPage() {
  // Fetching stores data from the database
  const subCategories = await getAllSubCategories()
  const categories = await prisma.category.findMany({})

  // Checking if no categories are found
  if (!subCategories || !categories) return null // If no categories found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create category
        </>
      }
      modalChildren={<SubCategoryDetails categories={categories} />}
      newTabLink="/dashboard/admin/sub-categories/new"
      filterValue="name"
      data={subCategories}
      searchPlaceholder="Search sub category name..."
      columns={columns}
    />
  )
}
