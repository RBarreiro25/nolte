'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { AuthToggle } from './auth-toggle'
import { EventForm } from './event-form'
import { EventFilters, FilterValues } from './event-filters'
import { EventList } from './event-list'
import { Separator } from './ui/separator'
import { Alert, AlertDescription } from './ui/alert'
import { Event, PublicEvent } from '../lib/types'
import { apiClient } from '../lib/api-client'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function EventDashboard() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [events, setEvents] = useState<(Event | PublicEvent)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [currentFilters, setCurrentFilters] = useState<FilterValues>({
    page: 1,
    limit: 20
  })

  const loadEvents = useCallback(async (filters: FilterValues = currentFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = isAdmin 
        ? await apiClient.getEvents(filters)
        : await apiClient.getPublicEvents(filters)

      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error.message || 'Failed to load events'
        setError(errorMessage)
        setEvents([])
      } else if (result.data) {
        const responseData = result.data as { events?: Event[]; pagination?: PaginationInfo }
        setEvents(responseData.events || [])
        if (responseData.pagination) {
          setPagination(responseData.pagination)
        }
      }
    } catch {
      setError('Failed to load events')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, currentFilters])

  const handleAuthChange = useCallback((authenticated: boolean) => {
    setIsAdmin(authenticated)
    setEvents([])
    setCurrentFilters({ page: 1, limit: 20 })
  }, [])

  const handleFiltersChange = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...currentFilters, page }
    setCurrentFilters(newFilters)
  }, [currentFilters])

  const handleEventCreated = useCallback(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters])

  const handleEventUpdated = useCallback(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters])

  useEffect(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters, isAdmin])

  const dashboardTitle = useMemo(() => {
    return isAdmin ? '🎫 Nolte Event Service - Admin Dashboard' : '🎫 Nolte Event Service - Public Events'
  }, [isAdmin])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {dashboardTitle}
          </h1>
          <AuthToggle onAuthChange={handleAuthChange} />
        </div>

        {/* Admin-only Event Creation */}
        {isAdmin && (
          <>
            <div className="mb-8">
              <EventForm onEventCreated={handleEventCreated} />
            </div>
            <Separator className="mb-8" />
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="mb-6">
          <EventFilters 
            isAdmin={isAdmin}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </div>

        {/* Events List */}
        <EventList
          events={events}
          isAdmin={isAdmin}
          loading={loading}
          error={error}
          pagination={pagination}
          onEventUpdated={handleEventUpdated}
          onPageChange={handlePageChange}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Nolte Event Service - Built with Next.js, TypeScript & Clean Architecture</p>
        </div>
      </div>
    </div>
  )
}
