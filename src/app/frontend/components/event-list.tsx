'use client'

import { useMemo, useCallback } from 'react'
import { EventCard } from './event-card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { CalendarToday } from '@mui/icons-material'
import { Event, PublicEvent } from '../lib/types'
import { Spinner } from './ui/spinner'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface EventListProps {
  events: (Event | PublicEvent)[]
  isAdmin: boolean
  loading?: boolean
  error?: string | null
  pagination?: PaginationInfo
  onEventUpdated: () => void
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function EventList({ 
  events, 
  isAdmin, 
  loading, 
  error, 
  pagination, 
  onEventUpdated, 
  onPageChange,
  onLimitChange
}: EventListProps) {
  
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const statusOrder = { DRAFT: 0, PUBLISHED: 1, CANCELLED: 2 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    })
  }, [events])

  const handlePreviousPage = useCallback(() => {
    if (pagination && pagination.page > 1) {
      onPageChange(pagination.page - 1)
    }
  }, [pagination, onPageChange])

  const handleNextPage = useCallback(() => {
    if (pagination && pagination.page < pagination.totalPages) {
      onPageChange(pagination.page + 1)
    }
  }, [pagination, onPageChange])

  const renderPagination = useCallback(() => {
    if (!pagination || pagination.totalPages <= 1) return null

    return (
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} events
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Per page:</label>
              <Select 
                value={pagination?.limit?.toString() || "20"} 
                onValueChange={(value) => onLimitChange(parseInt(value))}
              >
                <SelectTrigger className="w-20 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pagination.page <= 1 || loading}
                className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
              >
                Previous
              </Button>
              
              <span className="text-sm px-3 py-1 bg-card rounded border border-border text-card-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }, [pagination, handlePreviousPage, loading, handleNextPage, onLimitChange])

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading events: {error}
        </AlertDescription>
      </Alert>
    )
  }

    if (loading) return <center><Spinner size="lg" /></center>

  if (sortedEvents.length === 0) {
    return (
      <div className="glass-card text-center p-12">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarToday className="text-primary" style={{ fontSize: '2rem' }} />
          </div>
          <div>
            <h3 className="text-xl font-500 text-foreground mb-2">No events found</h3>
            <p className="text-muted-foreground">
              {isAdmin ? 'Create your first event using the form above.' : 'Check back later for upcoming events.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold font-primary">
          {isAdmin ? 'All Events' : 'Public Events'} ({sortedEvents.length})
        </h2>
      </div>
      
      <div className="flex flex-wrap gap-6">
        {sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={isAdmin}
            onEventUpdated={onEventUpdated}
          />
        ))}
      </div>
      
      {renderPagination()}
    </div>
  )
}
