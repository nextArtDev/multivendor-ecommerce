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
