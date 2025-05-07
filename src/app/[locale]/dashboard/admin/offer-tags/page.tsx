// Data table
import DataTable from '@/components/ui/data-table'

// Plus icon
import { Plus } from 'lucide-react'

// Columns
import { columns } from './columns'
import { getAllOfferTags } from '@/lib/queries/dashboard/tags'
import OfferTagDetails from '@/components/dashboard/forms/offer-tags-details'

export default async function AdminOfferTagsPage() {
  // Fetching offer tags data from the database
  const categories = await getAllOfferTags()

  // Checking if no offer tags are found
  if (!categories) return null // If no offer tags found, return null

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create offer tag
        </>
      }
      modalChildren={<OfferTagDetails />}
      filterValue="name"
      data={categories}
      searchPlaceholder="Search offer tag name..."
      columns={columns}
    />
  )
}
