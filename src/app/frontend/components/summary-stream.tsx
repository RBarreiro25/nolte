'use client'

import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Loader2 } from 'lucide-react'

interface SummaryStreamProps {
  eventId: string
  eventTitle: string
}

export function SummaryStream({ eventId, eventTitle }: SummaryStreamProps) {
  const [summary, setSummary] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cacheInfo, setCacheInfo] = useState<{ cached: boolean; cacheKey: string } | null>(null)

  const startStreaming = useCallback(async () => {
    if (isStreaming) return

    setIsStreaming(true)
    setIsComplete(false)
    setSummary('')
    setError(null)
    setCacheInfo(null)

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
              
              if (eventData.cached !== undefined) {
                setCacheInfo({ cached: eventData.cached, cacheKey: eventData.cacheKey })
              } else if (eventData.token) {
                setSummary(prev => prev + eventData.token)
              } else if (eventData.complete) {
                setIsComplete(true)
                setIsStreaming(false)
                break
              }
            } catch {
              console.warn('Failed to parse SSE data:', line)
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stream summary')
      setIsStreaming(false)
    }
  }, [eventId, isStreaming])

  const resetStream = useCallback(() => {
    setIsStreaming(false)
    setIsComplete(false)
    setSummary('')
    setError(null)
    setCacheInfo(null)
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Event Summary</CardTitle>
          <div className="flex items-center gap-2">
            {cacheInfo && (
              <Badge variant={cacheInfo.cached ? 'secondary' : 'default'}>
                {cacheInfo.cached ? 'Cached' : 'Live'}
              </Badge>
            )}
            {!isStreaming && !isComplete && (
              <Button onClick={startStreaming} size="sm">
                Generate Summary
              </Button>
            )}
            {(isComplete || error) && (
              <Button onClick={resetStream} variant="outline" size="sm">
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertDescription>
              Error generating summary: {error}
            </AlertDescription>
          </Alert>
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating AI summary...
          </div>
        )}

        {summary && (
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {summary}
                {isStreaming && <span className="animate-pulse">|</span>}
              </p>
            </div>
            
            {cacheInfo && (
              <div className="text-xs text-muted-foreground">
                {cacheInfo.cached ? (
                  <span>📄 Retrieved from cache (key: {cacheInfo.cacheKey})</span>
                ) : (
                  <span>✨ Freshly generated (cached for future requests)</span>
                )}
              </div>
            )}
          </div>
        )}

        {!summary && !isStreaming && !error && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click &quot;Generate Summary&quot; to get an AI-generated summary of &quot;{eventTitle}&quot;</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
