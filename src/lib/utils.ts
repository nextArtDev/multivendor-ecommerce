import { clsx, type ClassValue } from 'clsx'
import { differenceInHours } from 'date-fns'
import { differenceInDays } from 'date-fns-jalali'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getDirection = (locale: string) => {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

export const getTimeUntil = (
  targetDate: string
): { days: number; hours: number } => {
  // Convert the date string to a Date object
  const target = new Date(targetDate)
  const now = new Date()

  // Ensure the target date is in the future
  if (target <= now) return { days: 0, hours: 0 }

  // Calculate days and hours left
  const totalDays = differenceInDays(target, now)
  const totalHours = differenceInHours(target, now) % 24

  return { days: totalDays, hours: totalHours }
}

export function arraysEqual(
  arr1: (string | number)[] | null | undefined,
  arr2: (string | number)[] | null | undefined
): boolean {
  // Handle null/undefined cases
  if (arr1 == null && arr2 == null) return true
  if (arr1 == null || arr2 == null) return false

  // Handle length mismatch (including empty vs non-empty)
  if (arr1.length !== arr2.length) return false

  // Compare elements (using == for type coercion if needed)
  return arr1.every((value, index) => value == arr2[index])
}
