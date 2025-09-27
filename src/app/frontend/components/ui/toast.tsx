'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const toastVariants = cva(
  "font-primary group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border backdrop-filter backdrop-blur-16 p-6 pr-8 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "toast-futuristic",
        destructive: "toast-destructive",
        success: "toast-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void
  duration?: number
}

function Toast({ className, variant, onClose, children, duration = 3000, ...props }: ToastProps) {
  const [progress, setProgress] = React.useState(100)

  React.useEffect(() => {
    if (!duration || !onClose) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100
      
      setProgress(progressPercent)
      
      if (remaining <= 0) {
        clearInterval(interval)
        onClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, onClose])

  const getProgressClass = () => {
    if (variant === 'destructive') return 'toast-progress destructive'
    if (variant === 'success') return 'toast-progress success'
    return 'toast-progress'
  }

  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-lg p-1.5 bg-foreground/10 border border-foreground/20 text-foreground/70 opacity-0 transition-all hover:text-foreground hover:bg-foreground/20 hover:border-foreground/40 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 group-hover:opacity-100 backdrop-blur-sm"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      {duration && onClose && (
        <div 
          className={getProgressClass()}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  )
}

function ToastTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm font-semibold font-primary", className)}
      {...props}
    />
  )
}

function ToastDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm opacity-90 font-secondary", className)}
      {...props}
    />
  )
}

export { Toast, ToastTitle, ToastDescription, toastVariants }
export type { ToastProps }
