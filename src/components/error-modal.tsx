'use client'
import { AlertTriangle } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { useErrorModal } from '../hooks/ui/error-modal-context'

export function ErrorModal() {
  const { isOpen, message, closeModal } = useErrorModal()

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2" />
            Error
          </DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
