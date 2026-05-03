/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useErrorModal } from '@/hooks'
import { apiClient } from '@/lib/axios'
import { stopStream } from '@/utils/camera'

type CollectionItem = { id: string; name: string }
type BoxItem = { id: string; name: string }

export default function PickCollectionPage() {
  const { openModal } = useErrorModal()
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [selectedCollectionId, setSelectedCollectionId] = useState('')
  const [collectionBoxes, setCollectionBoxes] = useState<BoxItem[]>([])
  const [loadingCollections, setLoadingCollections] = useState(true)
  const [loadingBoxes, setLoadingBoxes] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanSuccess, setScanSuccess] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<any>(null)
  const codeReaderRef = useRef<any>(null)
  const scanningRef = useRef(false)

  const boxIdsInCollection = useMemo(() => new Set(collectionBoxes.map((box) => box.id)), [collectionBoxes])

  const fetchCollections = useCallback(async () => {
    setLoadingCollections(true)
    try {
      const data = await apiClient.get<CollectionItem[]>('/collection')
      setCollections(data)
      if (data.length > 0 && !selectedCollectionId) {
        setSelectedCollectionId(data[0].id)
      }
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to fetch collections')
    } finally {
      setLoadingCollections(false)
    }
  }, [openModal, selectedCollectionId])

  const fetchBoxesForCollection = useCallback(async (collectionId: string) => {
    if (!collectionId) {
      setCollectionBoxes([])
      return
    }

    setLoadingBoxes(true)
    try {
      const data = await apiClient.get<BoxItem[]>(`/collection/${collectionId}`)
      setCollectionBoxes(data)
    } catch (error: any) {
      openModal(error?.response?.data?.error ?? 'Failed to fetch collection boxes')
      setCollectionBoxes([])
    } finally {
      setLoadingBoxes(false)
    }
  }, [openModal])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])
  useEffect(() => {
    fetchBoxesForCollection(selectedCollectionId)
  }, [fetchBoxesForCollection, selectedCollectionId])

  const stopScanning = useCallback(() => {
    scanningRef.current = false
    setScanning(false)
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch (_err) {}
      codeReaderRef.current = null
    }
    stopStream(streamRef.current)
    streamRef.current = null
  }, [])

  useEffect(() => () => stopScanning(), [stopScanning])

  const parseBoxIdFromRaw = (raw: string): string | null => {
    try {
      const parsed = new URL(raw)
      const parts = parsed.pathname.split('/').filter(Boolean)
      const boxIndex = parts.indexOf('box')
      return boxIndex >= 0 ? parts[boxIndex + 1] ?? null : null
    } catch (_err) {
      return raw || null
    }
  }

  const validateQr = useCallback((raw: string) => {
    const boxId = parseBoxIdFromRaw(raw)
    if (!boxId) {
      openModal('Invalid QR code')
      return
    }
    if (boxIdsInCollection.has(boxId)) {
      setScanSuccess('OK: Box is in this collection')
      setScanError('')
      return
    }
    setScanSuccess('')
    openModal('Scanned QR is not part of the selected collection')
  }, [boxIdsInCollection, openModal])

  const handleScanClick = useCallback(async () => {
    setScanError('')
    setScanSuccess('')

    if (!selectedCollectionId) {
      openModal('Select a collection first')
      return
    }
    if (scanningRef.current) {
      stopScanning()
      return
    }

    scanningRef.current = true
    setScanning(true)

    try {
      if ((window as any).BarcodeDetector) {
        detectorRef.current = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        const scanFrame = async () => {
          if (!scanningRef.current || !videoRef.current || !detectorRef.current) {
            return
          }
          try {
            const codes = await detectorRef.current.detect(videoRef.current)
            if (codes.length > 0) {
              const raw = codes[0].rawValue
              stopScanning()
              if (raw) {
                validateQr(raw)
              }
              return
            }
          } catch (_err) {
            setScanError('Failed to read QR')
          }
          if (scanningRef.current) {
            requestAnimationFrame(scanFrame)
          }
        }
        requestAnimationFrame(scanFrame)
        return
      }

      const { BrowserQRCodeReader } = await import('@zxing/browser')
      const reader = new BrowserQRCodeReader()
      codeReaderRef.current = reader
      reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err, controls) => {
        if (!scanningRef.current) {
          controls?.stop()
          return
        }
        if (result) {
          scanningRef.current = false
          controls?.stop()
          stopScanning()
          validateQr(result.getText())
        }
        if (err && err.name !== 'NotFoundException') {
          setScanError('Failed to read QR')
        }
      }).catch((error: any) => {
        setScanError(error?.message ?? 'Unable to start camera')
        stopScanning()
      })
    } catch (error: any) {
      setScanError(error?.message ?? 'Unable to start camera')
      stopScanning()
    }
  }, [openModal, selectedCollectionId, stopScanning, validateQr])

  return <div className="flex flex-1 flex-col gap-4 p-4"><div className="container h-full rounded-md border-2 border-slate-400/50 p-4"><h1 className="mb-4 text-2xl font-bold">Pick Collection</h1><div className="mb-4 space-y-2"><div className="text-sm font-medium">Select collection</div><select className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={selectedCollectionId} onChange={(event) => setSelectedCollectionId(event.target.value)} disabled={loadingCollections}>{collections.map((collection) => <option key={collection.id} value={collection.id}>{collection.name}</option>)}</select><div className="text-xs text-muted-foreground">{loadingBoxes ? 'Loading collection boxes...' : `${collectionBoxes.length} boxes in selected collection`}</div></div><Button type="button" variant="outline" onClick={() => void handleScanClick()} disabled={loadingCollections || loadingBoxes}>{scanning ? 'Stop scan' : 'Scan box QR'}</Button>{scanning && <div className="mt-4 rounded-md border border-slate-300 bg-white/80 p-3 shadow-sm"><div className="relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-black/60"><video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline /><div className="pointer-events-none absolute inset-0 rounded border-2 border-emerald-400/60" /></div></div>}{scanSuccess && <div className="mt-4 rounded-md border border-emerald-500 bg-emerald-100 p-3 text-emerald-800">{scanSuccess}</div>}{scanError && <div className="mt-4 text-sm text-red-600">{scanError}</div>}</div></div>
}
