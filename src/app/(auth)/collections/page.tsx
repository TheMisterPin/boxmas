/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

import { PlusCircle } from 'lucide-react'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
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
  const { openModal } = useErrorModal()

  const fetchCollections = async () => {
    try {
      const data = await apiClient.get<CollectionItem[]>('/collection')
      setCollections(data)
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to fetch collections')
    }
  }

  useEffect(() => {
    fetchCollections()
  }, [])

  const handleCreate = async () => {
    try {
      await apiClient.post('/collection', { name })
      setName('')
      setDialogOpen(false)
      fetchCollections()
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to create collection')
    }
  }

  return <div className="flex flex-1 flex-col gap-4 p-4">
    <div className="container h-full p-4 border-2 border-slate-400/50 rounded-md justify-around">
      <div className="mb-6 flex gap-4 items-center justify-between px-10">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><PlusCircle className="h-6 w-6 text-stone-600" /></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>Create Collection</DialogTitle></DialogHeader>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Collection name" />
            <button onClick={handleCreate}>Save</button>
          </DialogContent>
        </Dialog>
      </div>
      <Separator />
      <div className="flex flex-col gap-4 pt-4">
        {collections.map((collection) => <div key={collection.id} className="border rounded-md p-4">
          <div className="font-semibold">{collection.name}</div>
          <div className="text-sm text-muted-foreground">{collection._count?.boxes ?? 0} boxes</div>
        </div>)}
      </div>
    </div>
  </div>
}
