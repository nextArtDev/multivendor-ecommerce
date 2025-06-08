// components/color-palette.tsx (adjust path)
'use client'
import { FC, useState } from 'react'
import { FieldArrayWithId } from 'react-hook-form'
import { cn } from '@/lib/utils'

// Assuming your main form Zod schema is available
// import { VariantFormSchema } from '@/lib/schemas/dashboard';
// import { z } from 'zod';
// type YourMainFormSchemaType = z.infer<typeof VariantFormSchema>;
type YourMainFormSchemaType = any // Replace with actual inferred type

interface ColorPaletteProps {
  extractedColors?: string[]
  mainVariantColors: FieldArrayWithId<YourMainFormSchemaType, 'colors', 'id'>[]
  addMainVariantColor: (colorValue: string) => void
}

const ColorPalette: FC<ColorPaletteProps> = ({
  extractedColors,
  // mainVariantColors, // Not directly used here, but available if needed for checks
  addMainVariantColor,
}) => {
  const [activeColor, setActiveColor] = useState<string>('')

  const handleSelectExtractedColor = (colorToAdd: string) => {
    if (!colorToAdd || !addMainVariantColor) return
    addMainVariantColor(colorToAdd)
  }

  if (!extractedColors || extractedColors.length === 0) {
    return null // Don't render if no colors extracted
  }

  return (
    <div className="p-2 bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-md shadow-lg">
      <div className="flex items-center justify-center gap-1 mb-1">
        {extractedColors.map((color, index) => (
          <button
            key={index}
            type="button"
            title={`Add color ${color} to variant`}
            className={cn(
              'w-5 h-5 rounded-full border border-gray-300 dark:border-gray-600 cursor-pointer transition-all duration-150 ease-in-out hover:scale-125 focus:outline-none focus:ring-2 focus:ring-offset-1',
              activeColor === color
                ? 'ring-2 ring-blue-500 scale-110'
                : 'ring-offset-transparent'
            )}
            style={{ backgroundColor: color }}
            onMouseEnter={() => setActiveColor(color)}
            onMouseLeave={() => setActiveColor('')}
            onClick={() => handleSelectExtractedColor(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      {activeColor && (
        <div
          className="text-xs text-center text-gray-700 dark:text-gray-300 font-medium"
          style={{ color: activeColor }}
        >
          {activeColor}
        </div>
      )}
    </div>
  )
}

export default ColorPalette
