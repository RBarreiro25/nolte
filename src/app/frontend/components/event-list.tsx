'use client'

import { useMemo, useCallback } from 'react'
import { EventCard } from './event-card'
import { Button } from './ui/button'
import { Alert, AlertDescription } from './ui/alert'
import { Skeleton } from './ui/skeleton'
import { Event, PublicEvent } from '../lib/types'

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
}

export function EventList({ 
  events, 
  isAdmin, 
  loading, 
  error, 
  pagination,
  onEventUpdated,
  onPageChange 
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

  const renderPagination = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="text-sm text-slate-600">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
          {pagination.total} events
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pagination.page <= 1 || loading}
          >
            Previous
          </Button>
          
          <span className="text-sm px-3 py-1 bg-white rounded border">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={pagination.page >= pagination.totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    )
  }, [pagination, loading, handlePreviousPage, handleNextPage])

  const renderSkeletons = useMemo(() => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-6 border rounded-lg space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    ))
  }, [])

  if (error) {
    return (
      <Alert>
        <AlertDescription>
          Error loading events: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-lg font-semibold">Loading events...</div>
        {renderSkeletons}
      </div>
    )
  }

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-lg">
        <p className="text-slate-600 text-lg">No events found</p>
        <p className="text-slate-500 text-sm mt-2">
          {isAdmin ? 'Create your first event using the form above.' : 'Check back later for upcoming events.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {isAdmin ? 'All Events' : 'Public Events'} ({sortedEvents.length})
        </h2>
      </div>
      
      <div className="grid gap-4">
        {sortedEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={isAdmin}
            onEventUpdated={onEventUpdated}
          />
        ))}
      </div>
      
      {renderPagination}
    </div>
  )
}
