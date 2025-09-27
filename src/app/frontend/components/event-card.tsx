'use client'

import { useState, useCallback, useMemo } from 'react'
import { LocationOn, CalendarToday, FavoriteBorder } from '@mui/icons-material'
import { getSpaceBackground } from '../lib/space-images'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { StatusBadge } from './status-badge'
import { FuturisticSelect } from './ui/futuristic-select'
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
  const [summaryCompleted, setSummaryCompleted] = useState(false)
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
    if (!isAdmin) return

    setIsUpdating(true)
    try {
      const result = await apiClient.updateEvent(event.id, { status: newStatus })
      if (result.error) {
        const errorDetails = result.error.details?.[0] || { message: 'Unknown error' }
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: errorDetails.message
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

  const handleSummaryCompleted = useCallback(() => {
    setSummaryCompleted(true)
  }, [])

  const isFullEvent = 'internalNotes' in event
  
  const spaceBackground = useMemo(() => getSpaceBackground(event.id), [event.id])

  return (
    <div className="rounded-xl shadow-md overflow-hidden min-w-[300px]" style={{ background: 'var(--card-elevated)' }}>
      <div 
        className="relative h-48 p-4 flex items-end"
        style={{ background: spaceBackground }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <FavoriteBorder style={{ fontSize: 16 }} />
          </button>
        </div>
        {isAdmin && (
          <div className="absolute top-4 left-4 w-35">
            <FuturisticSelect
              value={event.status}
              onValueChange={(value) => updateStatus(value as 'DRAFT' | 'PUBLISHED' | 'CANCELLED')}
              placeholder="Status"
              disabled={isUpdating}
              className="text-xs h-7"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="inline-block text-xs font-medium px-2 py-1 rounded-full mb-3 uppercase tracking-wide font-primary" 
              style={{ 
                color: 'var(--nolte-orange)', 
                background: 'rgba(255, 71, 30, 0.1)',
                border: '1px solid rgba(255, 71, 30, 0.2)'
              }}>
          <LocationOn style={{ fontSize: 12, marginRight: '4px', verticalAlign: 'middle' }} />
          {event.location}
        </span>

        <h3 className="text-lg font-semibold mb-2 line-clamp-2 font-primary" style={{ color: 'var(--card-foreground)' }}>
          {event.title}
        </h3>

        <div className="text-sm space-y-2 mb-4 font-primary" style={{ color: 'var(--muted-foreground)' }}>
          <div className="flex items-center gap-2">
            <CalendarToday style={{ fontSize: 16 }} />
            <span>{formatDate(event.startAt)}</span>
          </div>
          <p className="text-xs">to {formatDate(event.endAt)}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <StatusBadge status={event.status} />
          {event.isUpcoming && (
            <Badge variant="outline" className="badge-futuristic">
              Upcoming
            </Badge>
          )}
        </div>

        {isAdmin && isFullEvent && event.internalNotes && (
          <div className="rounded-lg p-3 mb-4" style={{ background: 'var(--card)', borderLeft: '3px solid var(--border)' }}>
            <p className="text-xs font-medium mb-1 uppercase tracking-wide font-primary" style={{ color: 'var(--muted-foreground)' }}>
              Internal Notes
            </p>
            <p className="text-sm leading-relaxed font-primary" style={{ color: 'var(--card-foreground)' }}>
              {event.internalNotes}
            </p>
          </div>
        )}

                  {(event.status === 'PUBLISHED' || event.status === 'CANCELLED') && !summaryCompleted && (
                    <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <Button
                        onClick={toggleSummary}
                        variant="outline"
                        size="sm"
                        className="btn-futuristic text-xs px-3 py-1 h-7 w-full"
                        disabled={isUpdating}
                      >
                        Generate AI Summary
                      </Button>
                    </div>
                  )}

                  {showSummary && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <SummaryStream eventId={event.id} eventTitle={event.title} autoStart onCompleted={handleSummaryCompleted} />
                    </div>
                  )}
      </div>
    </div>
  )
}

