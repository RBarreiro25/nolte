'use client'

import { useState, useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Error as ErrorIcon } from '@mui/icons-material'

interface SummaryStreamProps {
  eventId: string
  eventTitle: string
  autoStart?: boolean
  onCompleted?: () => void
}

export function SummaryStream({ eventId, autoStart = false, onCompleted }: SummaryStreamProps) {
  const [summary, setSummary] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStreaming = useCallback(async () => {
    if (isStreaming) return

    setIsStreaming(true)
    setSummary('')
    setError(null)

    try {
      const response = await fetch(`/api/public/events/${eventId}/summary`, {
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body available')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('event:')) {
            continue
          }
          
          if (line.startsWith('data:')) {
            try {
              const eventData = JSON.parse(line.slice(5).trim())
              
              if (eventData.token) {
                setSummary(prev => prev + eventData.token)
              } else if (eventData.complete) {
                setIsStreaming(false)
                onCompleted?.()
                break
              }
            } catch {
              continue
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stream summary')
      setIsStreaming(false)
    }
  }, [eventId, isStreaming, onCompleted])


  useEffect(() => {
    if (autoStart && !summary && !isStreaming && !error) {
      startStreaming()
    }
  }, [autoStart, summary, isStreaming, error, startStreaming])

  return (
    <div className="w-full">
      {error && (
        <div className="flex items-center gap-1 text-xs mb-2" style={{ color: '#ef4444' }}>
          <ErrorIcon style={{ fontSize: 12 }} />
          <span>Error: {error}</span>
        </div>
      )}

      {isStreaming && (
        <div className="flex items-center gap-2 mb-2 text-xs font-primary" style={{ color: 'var(--muted-foreground)' }}>
          <Loader2 className="h-3 w-3 animate-spin" />
          Generating summary...
        </div>
      )}

      {summary && (
        <div className="space-y-2 max-w-[295px]">
          <div className="text-xs font-medium mb-1 font-primary" style={{ color: 'var(--card-foreground)' }}>
            AI Summary
          </div>
          <p className="text-xs leading-relaxed font-primary" style={{ color: 'var(--card-foreground)' }}>
            {summary}
            {isStreaming && <span className="animate-pulse" style={{ color: 'var(--nolte-orange)' }}>|</span>}
          </p>
        </div>
      )}
    </div>
  )
}
