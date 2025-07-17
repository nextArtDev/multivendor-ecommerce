'use client'
import { X } from 'lucide-react'
import { Dispatch, FC, ReactNode, SetStateAction } from 'react'

interface ModalProps {
  title?: string
  show: boolean
  setShow: Dispatch<SetStateAction<boolean>>
  children: ReactNode
}

const Modal: FC<ModalProps> = ({ children, title, show, setShow }) => {
  const close = () => setShow(false)

  if (!show) null
  return (
    <div
      className="w-full h-full fixed top-0 left-0 right-0 bottom-0 bg-foreground/30 backdrop-blur-lg  z-50"
      onClick={(e) => {
        // Close only when clicking the overlay background
        if (e.target === e.currentTarget) {
          close()
        }
      }}
    >
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/30 backdrop-blur-lg px-4 md:px-10 w-[calc(100%-1rem)] max-w-[900px] py-5 shadow-md rounded-lg">
        <div className="flex items-center justify-between border-b pb-2">
          <h1 className="text-xl font-bold">{title}</h1>
          <X className="w-4 h-4 cursor-pointer" onClick={close} />
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export default Modal
