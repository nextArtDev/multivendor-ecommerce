// components/images-preview-grid.tsx (adjust path)
'use client'
import { FC, useEffect, useState } from 'react'
import NextImage from 'next/image' // Renamed to avoid conflict if you have a local Image type
import { getDominantColors, getGridClassName } from '@/lib/dashborad-utils' // Adjust path
import { Trash } from 'lucide-react'
import ColorPalette from './color-palette' // Adjust path
import { cn } from '@/lib/utils'
import { FieldArrayWithId } from 'react-hook-form'
import { ImageFileWithValue } from './image-input' // Import the shared interface

// Assuming your main form Zod schema is available
// import { VariantFormSchema } from '@/lib/schemas/dashboard';
// import { z } from 'zod';
// type YourMainFormSchemaType = z.infer<typeof VariantFormSchema>;
type YourMainFormSchemaType = any // Replace with actual inferred type

interface ImagesPreviewGridProps {
  images: ImageFileWithValue[] // Use the new interface
  onRemove: (url: string) => void
  mainVariantColors: FieldArrayWithId<YourMainFormSchemaType, 'colors', 'id'>[]
  addMainVariantColor: (colorValue: string) => void
  initialDataImages?: any // Type this appropriately if used for comparison
}

const ImagesPreviewGrid: FC<ImagesPreviewGridProps> = ({
  images,
  onRemove,
  mainVariantColors,
  addMainVariantColor,
}) => {
  const imagesLength = images.length
  const GridClassName = getGridClassName(imagesLength)
  const [colorPalettes, setColorPalettes] = useState<string[][]>([])

  useEffect(() => {
    const fetchColors = async () => {
      const palettes = await Promise.all(
        images.map(async (img) => {
          // Only try to get dominant colors if it's a new file (blob URL)
          // or if you have a way to fetch existing image data for color extraction
          if (img.url && img.url.startsWith('blob:')) {
            try {
              const colors = await getDominantColors(img.url)
              return colors
            } catch (error) {
              console.error('Error fetching dominant colors:', error)
              return []
            }
          }
          return [] // Return empty for existing images or if URL is missing
        })
      )
      setColorPalettes(palettes)
    }

    if (imagesLength > 0) {
      fetchColors()
    } else {
      setColorPalettes([]) // Clear palettes if no images
    }
  }, [images, imagesLength])

  if (imagesLength === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No images selected.
      </div>
    )
  }

  return (
    <div className="w-full">
      {' '}
      {/* Ensure ImagesPreviewGrid takes space */}
      <div
        className={cn(
          'grid bg-white rounded-md overflow-hidden max-h-[600px]', // Added max-h
          GridClassName
        )}
      >
        {images.map((img, i) => (
          <div
            key={img.id || img.url} // Use id for existing images, url for new
            className={cn(
              'relative group h-full w-full border border-gray-200 dark:border-gray-700',
              `grid_${imagesLength}_image_${i + 1}`,
              // Adjust height for specific grid counts if necessary
              { 'min-h-[150px] max-h-[200px]': imagesLength > 1 }, // Example dynamic height
              { 'min-h-[200px] max-h-[400px]': imagesLength === 1 }
            )}
            style={{ aspectRatio: '1 / 1' }} // Maintain aspect ratio
          >
            <NextImage
              src={img.url}
              alt={`Preview ${i + 1}`}
              layout="fill" // Use fill layout
              objectFit="cover" // Ensure image covers the area
              className="transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-end p-2 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {colorPalettes[i] && colorPalettes[i].length > 0 && (
                <div className="mb-auto mt-2">
                  {' '}
                  {/* Pushes palette to top */}
                  <ColorPalette
                    extractedColors={colorPalettes[i]}
                    mainVariantColors={mainVariantColors}
                    addMainVariantColor={addMainVariantColor}
                  />
                </div>
              )}
              <button
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors absolute top-2 right-2"
                type="button"
                onClick={() => onRemove(img.url)}
                title="Remove image"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImagesPreviewGrid
