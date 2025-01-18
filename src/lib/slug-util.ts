'use server'
import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

export const generateUniqueSlug = async (
  baseSlug: string,
  model: keyof PrismaClient,
  field: string = 'slug',
  separator: string = '-'
) => {
  let slug = baseSlug
  let suffix = 1

  while (true) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exisitngRecord = await (prisma[model] as any).findFirst({
      where: {
        [field]: slug,
      },
    })

    if (!exisitngRecord) {
      break
    }
    slug = `${slug}${separator}${suffix}`
    suffix += 1
  }
  return slug
}
