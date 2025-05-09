'use client'

import { logout } from '@/lib/actions/auth/logout'
import { cn } from '@/lib/utils'

// or we can use import {signOut} from 'next-auth/react'
interface LogoutButtonProps {
  children?: React.ReactNode
  className?: string
}

export const LogoutButton = ({ children, className }: LogoutButtonProps) => {
  const onClick = () => {
    logout()
  }

  return (
    <span onClick={onClick} className={cn('cursor-pointer', className)}>
      {children}
    </span>
  )
}
