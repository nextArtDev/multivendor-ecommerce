// components/click-to-add-rhf.tsx (New or refactored file)
'use client'
import React, { useState } from 'react'
import {
  Control,
  FieldArrayWithId,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  Path,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaintBucket, PlusCircle, XCircle } from 'lucide-react' // Example icons
import { cn } from '@/lib/utils'
import { ColorPicker } from '../shared/color-picker' // Assuming path from variant-details
import { VariantFormSchema } from '@/lib/schemas/dashboard' // Your main form schema
import { z } from 'zod'

type FormValues = z.infer<typeof VariantFormSchema> // Infer from your main schema
type FieldName = Path<FormValues> // "colors" | "sizes" | "specs"

// Infer the type of a single item in the array
type ArrayItem<T> = T extends (infer U)[] ? U : never
type DetailSchemaType = ArrayItem<
  FormValues['colors'] | FormValues['sizes'] | FormValues['specs']
>

interface ClickToAddInputsRHFProps {
  fields: FieldArrayWithId<FormValues, FieldName, 'id'>[]
  name: FieldName
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  getValues: UseFormGetValues<FormValues> // Keep if needed for complex logic
  onAppend: (value: Partial<DetailSchemaType>) => void
  onRemove: (index: number) => void
  initialDetailSchema: Partial<DetailSchemaType>
  header?: string
  colorPicker?: boolean
  containerClassName?: string
  inputClassName?: string
}

const ClickToAddInputsRHF: React.FC<ClickToAddInputsRHFProps> = ({
  fields,
  name,
  // control, // Use if <Controller> is needed for complex Shadcn components
  register,
  setValue,
  onAppend,
  onRemove,
  initialDetailSchema,
  header,
  colorPicker,
  containerClassName,
  inputClassName,
}) => {
  // const [colorPickerVisibleIndex, setColorPickerVisibleIndex] = useState<number | null>(null);

  const handleAddDetail = () => {
    onAppend(initialDetailSchema)
  }

  const handleRemoveDetail = (index: number) => {
    // Prevent removing the last item if schema requires min 1 (handle with Zod .min(1))
    // if (fields.length <= 1) return; // Or allow RHF + Zod to handle validation
    onRemove(index)
  }

  return (
    <div className="flex flex-col gap-y-4">
      {header && <Label className="text-md font-semibold">{header}</Label>}

      {fields.map((fieldItem, index) => {
        // Cast fieldItem to access properties, RHF `fields` are `FieldArrayWithId`
        const currentDetail = fieldItem as unknown as DetailSchemaType

        return (
          <div
            key={fieldItem.id}
            className={cn(
              'flex items-end gap-x-3 border p-4 rounded-md relative',
              containerClassName
            )}
          >
            {Object.keys(initialDetailSchema).map((propertyKey) => {
              const fieldPath =
                `${name}.${index}.${propertyKey}` as Path<FormValues>
              const isNumeric =
                typeof initialDetailSchema[
                  propertyKey as keyof DetailSchemaType
                ] === 'number'

              return (
                <div
                  key={propertyKey}
                  className="flex flex-col gap-1 flex-grow"
                >
                  <Label
                    htmlFor={fieldPath}
                    className="capitalize text-xs text-muted-foreground"
                  >
                    {propertyKey}
                  </Label>
                  {propertyKey === 'color' && colorPicker ? (
                    <div className="flex items-center gap-x-2">
                      <ColorPicker // From your color-picker.tsx
                        value={(currentDetail as any)?.color || ''}
                        onChange={(newColorValue) => {
                          setValue(fieldPath, newColorValue as any, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }}
                      />
                      <Input
                        {...register(fieldPath as any)}
                        id={fieldPath}
                        className={cn(
                          'w-28 placeholder:capitalize',
                          inputClassName
                        )}
                        placeholder="Hex Color e.g. #FF0000"
                        maxLength={7}
                      />
                    </div>
                  ) : (
                    <Input
                      {...register(fieldPath as any, {
                        valueAsNumber: isNumeric,
                      })}
                      id={fieldPath}
                      type={isNumeric ? 'number' : 'text'}
                      className={cn('placeholder:capitalize', inputClassName)}
                      placeholder={propertyKey}
                      min={isNumeric ? 0 : undefined}
                      step={
                        isNumeric
                          ? propertyKey === 'price' ||
                            propertyKey === 'discount'
                            ? '0.01'
                            : '1'
                          : undefined
                      }
                    />
                  )}
                </div>
              )
            })}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveDetail(index)}
              className="text-destructive hover:bg-destructive/10"
              // disabled={fields.length <= 1} // Enable if you want to prevent deleting the last one from UI
            >
              <XCircle size={20} />
            </Button>
          </div>
        )
      })}
      <Button
        type="button"
        variant="outline"
        onClick={handleAddDetail}
        className="mt-2 self-start"
      >
        <PlusCircle size={18} className="mr-2" /> Add {header || 'Item'}
      </Button>
    </div>
  )
}

export default ClickToAddInputsRHF
