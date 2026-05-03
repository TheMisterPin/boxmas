/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

import { PlusCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'

type CollectionItem = {
  id: string
  name: string
  _count?: { boxes: number }
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState('')
  const [fetchingCollections, setFetchingCollections] = useState(true)
  const [creatingCollection, setCreatingCollection] = useState(false)
  const { openModal } = useErrorModal()

  const fetchCollections = async () => {
    setFetchingCollections(true)
    try {
      const data = await apiClient.get<CollectionItem[]>('/collection')
      setCollections(data)
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to fetch collections')
    } finally {
      setFetchingCollections(false)
    }
  }

  useEffect(() => {
    fetchCollections()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    if (!name.trim()) {
      openModal('Collection name is required')
      return
    }

    try {
      setCreatingCollection(true)
      await apiClient.post('/collection', { name })
      setName('')
      setDialogOpen(false)
      fetchCollections()
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to create collection')
    } finally {
      setCreatingCollection(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="container h-full rounded-md border-2 border-slate-400/50 p-4 justify-around">
        <div className="mb-6 flex items-center justify-between gap-4 px-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Collections</h1>
            <a href="/collections/pick" className="text-sm text-blue-600 underline">Pick flow</a>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <PlusCircle className="h-6 w-6 text-stone-600" />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Collection name"
                  disabled={creatingCollection}
                />
                <Button type="button" onClick={handleCreate} disabled={creatingCollection}>
                  {creatingCollection ? <Spinner /> : null}
                  {creatingCollection ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
        <div className="flex flex-col gap-4 pt-4">
          {fetchingCollections ? (
            <div className="text-sm text-muted-foreground">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="text-sm text-muted-foreground">No collections yet.</div>
          ) : (
            collections.map((collection) => (
              <div key={collection.id} className="rounded-md border p-4">
                <div className="font-semibold">{collection.name}</div>
                <div className="text-sm text-muted-foreground">
                  {collection._count?.boxes ?? 0} boxes
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
