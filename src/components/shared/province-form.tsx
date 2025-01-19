'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Province } from '@prisma/client'
import ProvinceCity from './province-city'

const formSchema = z.object({
  provinceId: z.string(),
  cityId: z.string(),
})

export default function MyForm({ provinces }: { provinces: Province[] }) {
  // console.log({ provinces })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values)
      toast(
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      )
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Failed to submit the form. Please try again.')
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl mx-auto py-10"
      >
        <div className="flex gap-4">
          <ProvinceCity provinceLabel="" provinces={provinces} />
        </div>
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
