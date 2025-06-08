// components/click-to-add-rhf.tsx
'use client'
import React from 'react'
import {
  Control,
  FieldArrayWithId,
  UseFormRegister,
  UseFormSetValue,
  UseFormGetValues,
  Path,
  FieldError,
  // FieldErrorsImpl, // Not directly used in this version, but good for typing complex errors
  // Merge, // Same as above
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaintBucket, PlusCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ColorPicker } from '../shared/color-picker' // Adjust path as needed
// Assuming your main form Zod schema is available for type inference
// import { VariantFormSchema } from '@/lib/schemas/dashboard';
// import { z } from 'zod';

// type FormValues = z.infer<typeof VariantFormSchema>;
// For now, using 'any'. Replace with actual inferred type.
type FormValues = any
type FieldName = Path<FormValues>

type ArrayItem<T> = T extends (infer U)[] ? U : never
type DetailSchemaType = ArrayItem<FormValues['colors' | 'sizes' | 'specs']>

interface ClickToAddInputsRHFProps {
  fields: FieldArrayWithId<FormValues, FieldName, 'id'>[]
  name: FieldName
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  getValues: UseFormGetValues<FormValues>
  onAppend: (value: Partial<DetailSchemaType>) => void
  onRemove: (index: number) => void
  initialDetailSchema: Partial<DetailSchemaType>
  header?: string
  colorPicker?: boolean
  containerClassName?: string
  inputClassName?: string
  // errors?: FieldErrorsImpl<DeepRequired<FormValues>>[FieldName]; // For more complex error display
}

const ClickToAddInputsRHF: React.FC<ClickToAddInputsRHFProps> = ({
  fields,
  name,
  control, // Kept for potential use with <Controller /> for complex Shadcn components
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
  const handleAddDetail = () => {
    onAppend(initialDetailSchema)
  }

  const handleRemoveDetail = (index: number) => {
    // You can add logic here to prevent removing the last item if needed,
    // though Zod's .min(1) on the array is the more robust way for validation.
    onRemove(index)
  }

  return (
    <div className="flex flex-col gap-y-4">
      {header && <Label className="text-md font-semibold">{header}</Label>}

      {fields.map((fieldItem, index) => {
        const currentDetail = fieldItem as unknown as DetailSchemaType // Cast to access properties

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
                      <ColorPicker
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
                            propertyKey === 'discount' ||
                            propertyKey === 'weight'
                            ? '0.01'
                            : '1'
                          : undefined
                      }
                    />
                  )}
                  {/* Basic error display for individual fields - enhance as needed */}
                  {/* <FormMessage for={fieldPath} /> */}
                </div>
              )
            })}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveDetail(index)}
              className="text-destructive hover:bg-destructive/10"
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
