'use client'
import { LoginPage } from '@/_components/pages/login-page'
import { useAuth } from '@/hooks'

import HomePage from './(auth)/page'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        {isAuthenticated ? <HomePage /> : <LoginPage />}
      </div>
    </div>
  )
}
