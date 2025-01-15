'use client'
//https://time.openstatus.dev/
import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { TimePickerDemo } from './time-picker-demo'

// const FormSchema = z.object({
//   time: z.date({
//     required_error: 'A date and time is required.',
//   }),
// })

interface DateTimePickerProps {
  name: string
  label?: string
  description?: string
  className?: string
  initialDataTime?: Partial<Date>[] | null
}
export function DateTimePicker({
  name,
  label = name,
  className,
}: //   initialDataTime,
//   description,
DateTimePickerProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', className)}>
          <FormLabel className="text-left">{label}</FormLabel>
          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[280px] justify-start text-left font-normal',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? (
                    format(field.value, 'PPP HH:mm:ss')
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                initialFocus
              />
              <div className="p-3 border-t border-border">
                <TimePickerDemo setDate={field.onChange} date={field.value} />
              </div>
            </PopoverContent>
          </Popover>
        </FormItem>
      )}
    />
  )
}
