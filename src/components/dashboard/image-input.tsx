// components/image-input.tsx (adjust path)
'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import React, { useEffect, useCallback } from 'react'
import { useFormContext, FieldArrayWithId, Path } from 'react-hook-form'
import ImagesPreviewGrid from './images-preview-grid' // Adjust path
import { FileUploader, FileInput } from '../ui/file-upload' // Adjust path
import { Image as PrismaImageType } from '@prisma/client'

// Assuming your main form Zod schema is available (e.g., VariantFormSchema)
// import { VariantFormSchema } from '@/lib/schemas/dashboard';
// import { z } from 'zod';
// type YourMainFormSchemaType = z.infer<typeof VariantFormSchema>;
type YourMainFormSchemaType = any // Replace with actual inferred type

const dropZoneConfig = {
  maxFiles: 5,
  maxSize: 1024 * 1024 * 4, // 4MB
  multiple: true,
  accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
}

export interface ImageFileWithValue {
  id?: string // For existing images
  url: string
  file?: File
}

interface ImageInputProps {
  name: string
  label: string
  initialDataImages?: Partial<PrismaImageType>[] | null
  mainVariantColors: FieldArrayWithId<YourMainFormSchemaType, 'colors', 'id'>[]
  addMainVariantColor: (colorValue: string) => void
}

export function ImageInput({
  name,
  label,
  // initialDataImages, // Handled by RHF defaultValues and reset
  mainVariantColors,
  addMainVariantColor,
}: ImageInputProps) {
  const { control, getValues, setValue } =
    useFormContext<YourMainFormSchemaType>()

  const processFilesForRHF = useCallback(
    (newFiles: File[]): ImageFileWithValue[] => {
      return newFiles.map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
      }))
    },
    []
  )

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    const currentRHFImages =
      (getValues(
        name as Path<YourMainFormSchemaType>
      ) as ImageFileWithValue[]) || []
    return () => {
      currentRHFImages.forEach((img) => {
        if (img.url && img.url.startsWith('blob:') && img.file) {
          // Only revoke if it's a new file's blob URL
          URL.revokeObjectURL(img.url)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues(name as Path<YourMainFormSchemaType>), name]) // Watch the RHF value for changes

  return (
    <div className="w-full">
      {' '}
      {/* Ensure ImageInput takes space */}
      <FormField
        control={control}
        name={name as Path<YourMainFormSchemaType>}
        render={({ field }) => {
          const currentImages: ImageFileWithValue[] = Array.isArray(field.value)
            ? field.value
            : []

          return (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              <FormControl>
                <FileUploader
                  value={
                    currentImages
                      .map((img) => img.file)
                      .filter(Boolean) as File[]
                  } // FileUploader might expect File[]
                  onValueChange={(acceptedFiles: File[] | null) => {
                    if (acceptedFiles && acceptedFiles.length > 0) {
                      const newImageObjects = processFilesForRHF(acceptedFiles)
                      // Append new files to existing, or replace, depending on FileUploader behavior
                      // This example assumes FileUploader provides all current files, or only new ones.
                      // If it provides only new ones:
                      field.onChange([
                        ...currentImages.filter((img) => !img.file),
                        ...newImageObjects,
                      ])
                      // If it provides ALL files currently in its internal state:
                      // field.onChange(processFilesForRHF(acceptedFiles));
                    } else if (
                      acceptedFiles === null ||
                      acceptedFiles.length === 0
                    ) {
                      // Handle clearing. If FileUploader sends null or empty array for clear.
                      // Need to decide if we clear all or only new ones.
                      // This clears all:
                      field.onChange([])
                    }
                  }}
                  dropzoneOptions={dropZoneConfig}
                  className="relative bg-background rounded-lg p-2 border border-dashed"
                >
                  {currentImages.length > 0 ? (
                    <ImagesPreviewGrid
                      images={currentImages}
                      onRemove={(urlToRemove: string) => {
                        const updatedImages = currentImages.filter(
                          (img) => img.url !== urlToRemove
                        )
                        field.onChange(updatedImages)
                        if (urlToRemove.startsWith('blob:')) {
                          URL.revokeObjectURL(urlToRemove)
                        }
                      }}
                      mainVariantColors={mainVariantColors}
                      addMainVariantColor={addMainVariantColor}
                    />
                  ) : (
                    <FileInput className="outline-none">
                      {' '}
                      {/* Removed redundant outline */}
                      <div className="flex items-center justify-center flex-col py-10 text-center">
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

const FileSvgDraw = () => (
  <>
    <svg
      className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400"
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
      PNG, JPG, GIF, WEBP up to 4MB each (max 5 files)
    </p>
  </>
)
