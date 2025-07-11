// components/image-input.tsx
'use client'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Image as PrismaImageType } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { FieldArrayWithId, Path, useFormContext } from 'react-hook-form'
import { FileInput, FileUploader } from '../ui/file-upload' // Adjust path
import ImagesPreviewGrid from './images-preview-grid' // Adjust path

// Define a more specific type for your form values if possible
type YourMainFormSchemaType = any // Replace with your actual Zod schema inferred type

const dropZoneConfig = {
  maxFiles: 5,
  maxSize: 1024 * 1024 * 4, // 4MB
  multiple: true,
  accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
}

interface ImageInputProps {
  name: string
  label: string
  initialDataImages?: Partial<PrismaImageType>[] | null // Kept for edit mode, but won't be mixed with new files
  mainVariantColors: FieldArrayWithId<YourMainFormSchemaType, 'colors', 'id'>[]
  addMainVariantColor: (colorValue: string) => void
}

export function ImageInput({
  name,
  label,
  mainVariantColors,
  addMainVariantColor,
}: ImageInputProps) {
  const { control } = useFormContext<YourMainFormSchemaType>()

  return (
    <div className="w-full">
      <FormField
        control={control}
        name={name as Path<YourMainFormSchemaType>}
        render={({ field }) => {
          // 'field.value' is now expected to be File[]
          const files: File[] = Array.isArray(field.value) ? field.value : []

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <FileUploader
                  value={files}
                  onValueChange={field.onChange} // Directly pass the RHF onChange handler
                  dropzoneOptions={dropZoneConfig}
                  className="relative rounded-lg border border-dashed bg-background p-2"
                >
                  {files.length > 0 ? (
                    <ImagesPreviewGridForFiles
                      files={files}
                      onRemove={(fileToRemove) => {
                        const updatedFiles = files.filter(
                          (file) => file !== fileToRemove
                        )
                        field.onChange(updatedFiles)
                      }}
                      mainVariantColors={mainVariantColors}
                      addMainVariantColor={addMainVariantColor}
                    />
                  ) : (
                    <FileInput className="outline-none">
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileSvgDraw />
                      </div>
                    </FileInput>
                  )}
                </FileUploader>
              </FormControl>
              <FormMessage />
            </FormItem>
          )
        }}
      />
    </div>
  )
}

// A new internal component to handle preview URL creation and cleanup
function ImagesPreviewGridForFiles({
  files,
  onRemove,
  mainVariantColors,
  addMainVariantColor,
}: {
  files: File[]
  onRemove: (file: File) => void
  mainVariantColors: FieldArrayWithId<any, 'colors', 'id'>[]
  addMainVariantColor: (color: string) => void
}) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  useEffect(() => {
    // Create new blob URLs when files change
    const newUrls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(newUrls)

    // Cleanup function to revoke URLs when the component unmounts or files change
    return () => {
      newUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [files])

  return (
    <ImagesPreviewGrid
      // Map files to the format that ImagesPreviewGrid expects
      images={files.map((file, index) => ({
        // Use the generated preview URL for display
        url: previewUrls[index] || '',
        // Pass the original file to the onRemove handler
        originalFile: file,
      }))}
      onRemove={(url: string) => {
        // Find the file corresponding to the preview URL and remove it
        const index = previewUrls.indexOf(url)
        if (index !== -1) {
          onRemove(files[index])
        }
      }}
      mainVariantColors={mainVariantColors}
      addMainVariantColor={addMainVariantColor}
    />
  )
}

// The SVG component remains unchanged
const FileSvgDraw = () => (
  <>
    <svg
      className="mb-4 h-10 w-10 text-gray-500 dark:text-gray-400"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 16"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
      />
    </svg>
    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
      <span className="font-semibold">Click to upload</span> or drag and drop
    </p>
    <p className="text-xs text-gray-500 dark:text-gray-400">
      PNG, JPG, GIF, WEBP up to 4MB each
    </p>
  </>
)
