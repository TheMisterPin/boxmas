'use client'

import Link from 'next/link'

import { BoxIcon, Building2 } from 'lucide-react'

import { LoginPage } from '@/_components/pages/login-page'
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { useAuth } from '@/hooks'

export default function Home() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  // If authenticated, show nothing (user will be redirected from login form or protected routes)
  if (isAuthenticated) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="container h-full p-4 border-2 border-slate-400/50 rounded-md justify-around">
          <div className="mb-6 flex gap-4 items-center justify-between px-10">
            <h1 className="text-2xl font-bold bg-linear-to-t from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text">
              Home
            </h1>
          </div>
          <div className="flex flex-col gap-4 pt-4">
            <Item
              asChild
              variant="outline"
              className="border-slate-400/50 rounded-md bg-linear-to-r from-gray-50 to-stone-100/75"
            >
              <Link href="/box" className="w-full">
                <ItemMedia>
                  <Building2 className="text-slate-400 h-8 w-8" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-xl font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full justify-center pr-6">
                    Locations
                  </ItemTitle>
                </ItemContent>
              </Link>
            </Item>
            <Item
              asChild
              variant="outline"
              className="border-slate-400/50 rounded-md bg-linear-to-r from-gray-50 to-stone-100/75"
            >
              <Link href="/locations" className="w-full">
                <ItemMedia>
                  <BoxIcon className="text-slate-400 h-8 w-8" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="text-xl font-bold bg-linear-to-b from-stone-800/75 to-slate-700/75 text-transparent bg-clip-text flex w-full justify-center pr-6">
                    Boxes
                  </ItemTitle>
                </ItemContent>
              </Link>
            </Item>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-linear-to-r from-gray-200 to-slate-200 min-h-full w-full mx-auto">
      <LoginPage />
    </div>
  )
}
