'use client'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

import { FileInput, FileUploader } from '../ui/file-upload'
import { Image } from '@prisma/client'
import ImagesPreviewGrid from './images-preview-grid_'

const dropZoneConfig = {
  maxFiles: 5,
  maxSize: 1024 * 1024 * 4,
  multiple: true,
}
interface ImageInputProps {
  colors?: { color: string }[]
  setColors: Dispatch<SetStateAction<{ color: string }[]>>
  name: string
  label: string
  accept?: string
}

export interface ImageFile {
  url: string
  file?: File
}

interface ImageInputProps {
  colors?: { color: string }[]
  setColors: React.Dispatch<React.SetStateAction<{ color: string }[]>>
  name: string
  label: string
  accept?: string
  initialDataImages?: Partial<Image>[] | null
}

export function ImageInput({
  colors,
  setColors,
  name,
  label,
  initialDataImages,
}: ImageInputProps) {
  const { setValue, watch } = useFormContext()
  const form = useFormContext()
  const [files, setFiles] = useState<File[]>([])
  const [watchedFiles, setWatchedFiles] = useState(watch(name) || [])
  // const watchedFiles = watch(name) || []

  // console.log({ watchedFiles })
  // const initialUrls =
  //   initialDataImages &&
  //   (initialDataImages.map((img) => img.url).filter(Boolean) as string[])
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return

    const newFiles = Array.from(event.target.files)
    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)

    // Create preview URLs and update form value immediately
    const imageUrls = updatedFiles.map((file) => ({
      url: URL.createObjectURL(file),
      file: file, // Keep reference to the original file
    }))

    setValue(name, imageUrls, { shouldValidate: true })
    setWatchedFiles(imageUrls)
  }

  // const handleRemove = (urlToRemove: string) => {
  //   const updatedFiles = watchedFiles.filter(
  //     (file: { url: string }) => file.url !== urlToRemove
  //   )
  //   setValue(name, updatedFiles, { shouldValidate: true })

  //   // Update files state to match
  //   const newFiles = files.filter((file) => {
  //     const fileUrl = URL.createObjectURL(file)
  //     URL.revokeObjectURL(fileUrl) // Clean up the URL
  //     return fileUrl !== urlToRemove
  //   })
  //   console.log({ newFiles })
  //   setFiles(newFiles)
  // }

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        const url = URL.createObjectURL(file)
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  return (
    <div>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <FileUploader
                  value={field.value || []}
                  onValueChange={field.onChange}
                  onChange={handleFileChange}
                  dropzoneOptions={dropZoneConfig}
                  className="relative bg-background rounded-lg p-2"
                >
                  {watchedFiles.length > 0 ? (
                    <div className="flex flex-col gap-y-2 xl:flex-row">
                      <ImagesPreviewGrid
                        images={watchedFiles || initialDataImages}
                        onRemove={(url) => {
                          const updatedImages = watchedFiles.filter(
                            (img: { url: string }) => img.url !== url
                          )
                          setWatchedFiles(updatedImages)
                          field.onChange(updatedImages)
                        }}
                        colors={colors}
                        setColors={setColors}
                      />
                    </div>
                  ) : (
                    <FileInput className="outline-dashed outline-1 outline-foreground p-5">
                      <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full">
                        <FileSvgDraw />
                      </div>
                    </FileInput>
                  )}
                </FileUploader>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
const FileSvgDraw = () => {
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
        SVG, PNG, JPG or GIF
      </p>
    </>
  )
}
