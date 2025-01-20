import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const getDirection = (locale: string) => {
  return locale === 'fa' ? 'rtl' : 'ltr'
}
