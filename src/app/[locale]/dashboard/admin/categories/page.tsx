// Queries

// Data table

import { Plus } from 'lucide-react'

import { columns } from './columns'
import CategoryDetails from '@/components/dashboard/forms/category-details'
import DataTable from '@/components/ui/data-table'
import { getAllCategories } from '@/lib/queries/dashboard'

export default async function AdminCategoriesPage() {
  // Fetching stores data from the database
  const categories = await getAllCategories()
  // console.log({ categories })

  // Checking if no categories are found
  if (!categories) return null // If no categories found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create category
        </>
      }
      modalChildren={<CategoryDetails />}
      newTabLink="/dashboard/admin/categories/new"
      filterValue="name"
      data={categories}
      searchPlaceholder="Search category name..."
      columns={columns}
    />
  )
}
