'use client'

import React from 'react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks'

export default function HomePage() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user?.name || user?.email}!</h1>
      <p>You are authenticated.</p>
      <Button onClick={logout} variant="outline">
        Logout
      </Button>
    </div>
  )
}
