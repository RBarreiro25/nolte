'use client'

import { useToast } from '../../hooks/use-toast'
import { Toast, ToastTitle, ToastDescription } from './toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          onClose={() => dismiss(toast.id)}
          className="mb-3 animate-in slide-in-from-right-full"
        >
          <div className="grid gap-1.5">
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
          </div>
        </Toast>
      ))}
    </div>
  )
}
