'use client'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { FieldValues, useFormContext, UseFormSetValue } from 'react-hook-form'
import { Upload } from 'lucide-react'
import ImagesPreviewGrid from './images-preview-grid'

interface ImageInputProps {
  colors?: { color: string }[] // List of colors from form
  setColors: Dispatch<SetStateAction<{ color: string }[]>>
  name: string
  label: string
  accept?: string
}

export function ImageInput({
  colors,
  setColors,
  name,
  label,
  accept = 'image/*',
}: ImageInputProps) {
  const { setValue, watch } = useFormContext()
  const [files, setFiles] = useState<UseFormSetValue<FieldValues>>()
  // const [colors, setColors] = useState<{ color: string }[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const currentFiles = watch(name) || []

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      const imageUrls = selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
      }))
      setValue(name, imageUrls, { shouldValidate: true })
    }
  }

  const handleRemove = (urlToRemove: string) => {
    const newFiles = currentFiles.filter(
      (file: { url: string }) => file.url !== urlToRemove
    )
    setValue(name, newFiles, { shouldValidate: true })
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <div
        onClick={handleClick}
        className="relative w-full border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={accept}
          multiple
        />

        {currentFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop images
            </p>
          </div>
        )}
      </div>

      {currentFiles.length > 0 && (
        <div className="flex flex-col gap-y-2 xl:flex-row">
          <ImagesPreviewGrid
            images={currentFiles}
            onRemove={handleRemove}
            colors={colors}
            setColors={setColors}
          />
        </div>
      )}

      {/* {!!colors?.length && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Colors:
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors?.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border border-gray-200"
                style={{ backgroundColor: color.color }}
                title={color.color}
              />
            ))}
          </div>
        </div>
      )} */}
    </div>
  )
}
