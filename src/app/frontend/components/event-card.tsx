'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Badge } from './ui/badge'
import { StatusBadge } from './status-badge'
import { SummaryStream } from './summary-stream'
import { Event, PublicEvent } from '../lib/types'
import { apiClient } from '../lib/api-client'
import { useToast } from '../hooks/use-toast'

interface EventCardProps {
  event: Event | PublicEvent
  isAdmin: boolean
  onEventUpdated: () => void
}

export function EventCard({ event, isAdmin, onEventUpdated }: EventCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const { toast } = useToast()

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  const updateStatus = useCallback(async (newStatus: 'DRAFT' | 'PUBLISHED' | 'CANCELLED') => {
    if (!isAdmin || !('internalNotes' in event)) return

    setIsUpdating(true)
    try {
      const result = await apiClient.updateEvent(event.id, { status: newStatus })
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error.message || 'Update failed'
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: errorMessage
        })
      } else {
        toast({
          variant: 'success',
          title: 'Event Updated',
          description: `Event status changed to ${newStatus}`
        })
        onEventUpdated()
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update event status'
      })
    } finally {
      setIsUpdating(false)
    }
  }, [isAdmin, event, onEventUpdated, toast])

  const toggleSummary = useCallback(() => {
    setShowSummary(prev => !prev)
  }, [])

  const isFullEvent = 'internalNotes' in event

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={event.status} />
              {event.isUpcoming && (
                <Badge variant="outline">Upcoming</Badge>
              )}
            </div>
          </div>
          
          {isAdmin && isFullEvent && (
            <Select onValueChange={updateStatus} disabled={isUpdating}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-slate-600">📍 {event.location}</p>
          <p className="text-sm text-slate-600">
            🗓️ {formatDate(event.startAt)} → {formatDate(event.endAt)}
          </p>
        </div>

        {isAdmin && isFullEvent && event.internalNotes && (
          <div className="p-3 bg-slate-50 rounded border-l-4 border-slate-300">
            <p className="text-sm font-medium text-slate-700">Internal Notes:</p>
            <p className="text-sm text-slate-600">{event.internalNotes}</p>
          </div>
        )}

        {(event.status === 'PUBLISHED' || event.status === 'CANCELLED') && (
          <div>
            <Button
              onClick={toggleSummary}
              variant="outline"
              size="sm"
            >
              {showSummary ? 'Hide Summary' : 'Show AI Summary'}
            </Button>
            
            {showSummary && (
              <div className="mt-4">
                <SummaryStream eventId={event.id} eventTitle={event.title} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

