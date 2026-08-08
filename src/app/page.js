"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import authService from '@/lib/auth'

export default function RootPage() {
  const router = useRouter()

  React.useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getUser()
      if (user?.type === 'admin' || user?.type === 'superadmin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-pace-purple flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
    </div>
  )
}
