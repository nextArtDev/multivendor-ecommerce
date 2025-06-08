// image-input.tsx
'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import React, { useEffect, useCallback } from 'react' // Removed useState for files and watchedFiles
import { useFormContext, FieldArrayWithId } from 'react-hook-form' // Added FieldArrayWithId for type safety if colors are passed

import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from '../ui/file-upload' // Assuming structure
import { Image as PrismaImageType } from '@prisma/client' // Renamed to avoid conflict
import { Paperclip } from 'lucide-react' // Example Icon
import ImagesPreviewGrid from './images-preview-grid_'

const dropZoneConfig = {
  maxFiles: 5,
  maxSize: 1024 * 1024 * 4, // 4MB
  multiple: true,
  // accept: { 'image/*': [] } // More specific accept
}

export interface ImageFileWithValue {
  // RHF will store this structure
  url: string // For preview
  file: File // For submission
  // Potentially: colorAssociations?: string[]; // If associating with variant colors
}

// For variant colors, if you decide to pass them for selection in ImagesPreviewGrid
interface VariantColorItem {
  // Matches useFieldArray structure for colors
  id?: string // from useFieldArray
  color: string
}

interface ImageInputProps {
  name: string // Name of the field in React Hook Form
  label: string
  initialDataImages?: Partial<PrismaImageType>[] | null // For pre-populating from existing data

  // Option 1: If ImagesPreviewGrid allows selecting from existing variant colors
  // variantColorFields?: FieldArrayWithId<YourMainFormSchemaType, 'colors', 'id'>[];

  // Option 2: If each image can have its own new colors (complex, likely needs nested field array for this field)
  // This component would become much more complex. Avoid if possible.

  // For simplicity, we're removing direct `colors` and `setColors` manipulation from here.
  // Color association logic would live within ImagesPreviewGrid or be handled differently.
}

export function ImageInput({
  name,
  label,
  initialDataImages,
}: // variantColorFields, // Pass this if ImagesPreviewGrid needs to show variant colors
ImageInputProps) {
  const { control, setValue, watch, getValues } = useFormContext()

  // Helper to create previews and structure for RHF
  const processFilesForRHF = (newFiles: File[]): ImageFileWithValue[] => {
    return newFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
    }))
  }

  // Handle new files from the FileUploader's input element (if it exposes this)
  // Or, if FileUploader's onValueChange gives File[] directly.
  const handleFileUploaderChange = useCallback(
    (acceptedFiles: File[] | null) => {
      if (!acceptedFiles || acceptedFiles.length === 0) {
        // If clearing files, an empty array should be set.
        // If FileUploader provides null for no files, handle that.
        // setValue(name, [], { shouldValidate: true });
        return
      }

      const currentFiles = (getValues(name) as ImageFileWithValue[]) || []
      const newImageFilesWithValue = processFilesForRHF(acceptedFiles)

      // Combine with existing files if dropZoneConfig.multiple is true
      // Ensure no duplicates if re-adding. For simplicity, here we overwrite if new files are added.
      // Or, if FileUploader manages the full list:
      setValue(name, [...currentFiles, ...newImageFilesWithValue], {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue, name, getValues]
  )

  const currentRHFImages = (watch(name) as ImageFileWithValue[]) || []

  // Cleanup object URLs
  useEffect(() => {
    const urlsToRevoke = currentRHFImages.map((img) => img.url)
    return () => {
      urlsToRevoke.forEach((url) => {
        // Only revoke if it's an object URL (starts with blob:)
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [currentRHFImages]) // Rerun if the images in RHF change

  return (
    <div>
      <FormField
        control={control}
        name={name}
        render={({ field }) => {
          // field.value here is currentRHFImages (the array of ImageFileWithValue)
          const imagesForPreview = field.value || []

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <FileUploader
                  value={field.value ? field.value?.map((f) => f.file) : []} // FileUploader might expect File[]
                  onValueChange={(files: File[] | null) => {
                    // Assuming onValueChange gives File[]
                    if (files && files.length > 0) {
                      const newImageFilesWithValue = processFilesForRHF(files)
                      // This depends on how FileUploader works.
                      // If it gives ALL current files, then just set:
                      field.onChange(newImageFilesWithValue)
                      // If it gives only NEWLY ADDED files:
                      // field.onChange([...(field.value || []), ...newImageFilesWithValue]);
                    } else {
                      field.onChange([]) // Clear if null or empty
                    }
                  }}
                  dropzoneOptions={dropZoneConfig}
                  className="relative bg-background rounded-lg p-2"
                >
                  {imagesForPreview.length > 0 ? (
                    <ImagesPreviewGrid
                      images={imagesForPreview} // Pass ImageFileWithValue[]
                      initialDataImages={initialDataImages} // For comparison or displaying alongside new
                      onRemove={(urlToRemove: string) => {
                        const updatedImages = imagesForPreview.filter(
                          (img: ImageFileWithValue) => img.url !== urlToRemove
                        )
                        field.onChange(updatedImages) // Update RHF state
                        if (urlToRemove.startsWith('blob:')) {
                          URL.revokeObjectURL(urlToRemove) // Clean up immediately on remove
                        }
                      }}
                      // If ImagesPreviewGrid needs to interact with variant colors:
                      // variantColorFields={variantColorFields}
                      // onAssociateColor={(imageUrl, colorId) => { /* logic to update RHF form data */ }}
                    />
                  ) : (
                    <FileInput className="outline-dashed outline-1 outline-foreground p-5">
                      <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
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

const FileSvgDraw = () => {
  // No changes needed here
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF (MAX. 4MB)
      </p>
    </>
  )
}
