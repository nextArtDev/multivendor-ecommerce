'use client'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { X } from 'lucide-react'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FileInput, FileUploader } from '../ui/file-upload'
import ImageSlider from './ImageSlider'
import { cn } from '@/lib/utils'
import { Image } from '@prisma/client'

const InputFileUpload = ({
  name,
  label = name,
  className,
  multiple = true,
  initialDataImages,
}: {
  name: string
  label?: string
  className?: string
  multiple?: boolean
  initialDataImages?: Partial<Image>[] | null
}) => {
  const form = useFormContext()
  const [files, setFiles] = useState<File[] | null>(null)

  const dropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: multiple,
  }

  const urls = initialDataImages
    ? (initialDataImages.map((img) => img.url).filter(Boolean) as string[])
    : (files
        ?.map((file: Blob | MediaSource) => URL.createObjectURL(file))
        .filter(Boolean) as string[])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <FileUploader
                value={field.value}
                onValueChange={field.onChange}
                onChange={async (event) => {
                  // Triggered when user uploaded a new file
                  // FileList is immutable, so we need to create a new one
                  const dataTransfer = new DataTransfer()

                  // Add old images
                  if (files) {
                    Array.from(files).forEach((image) =>
                      dataTransfer.items.add(image)
                    )
                  }

                  // Add newly uploaded images
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  Array.from(event.target.files! as File[]).forEach(
                    (image: File) => dataTransfer.items.add(image)
                  )

                  // Validate and update uploaded file
                  const newFiles = dataTransfer.files

                  setFiles(Array.from(newFiles))
                }}
                dropzoneOptions={dropZoneConfig}
                className="relative bg-background rounded-lg p-2"
              >
                {files && files.length > 0 ? (
                  <div className="relative w-60 h-60 ">
                    <ImageSlider urls={urls} />
                    <Button
                      size="icon"
                      onClick={() => {
                        setFiles(null)
                        form.setValue(name, null)
                      }}
                      className="absolute top-2 left-2 z-20"
                      type="button"
                    >
                      <X className="text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <FileInput className="outline-dashed outline-1 outline-foreground p-5 ">
                    <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                      <FileSvgDraw />
                    </div>
                  </FileInput>
                )}
                {/* <FileUploaderContent>
                  {files &&
                    files.length > 0 &&
                    files.map((file, i) => (
                      <FileUploaderItem key={i} index={i}>
                        <Paperclip className="h-4 w-4 stroke-current" />
                        <span>{file.name}</span>
                      </FileUploaderItem>
                    ))}
                </FileUploaderContent> */}
              </FileUploader>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
export default InputFileUpload

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
