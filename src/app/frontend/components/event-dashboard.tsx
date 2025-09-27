'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AuthToggle } from './auth-toggle'
import { EventForm } from './event-form'
import { EventFilters, FilterValues } from './event-filters'
import { EventList } from './event-list'
import { ThemeToggle } from './theme-toggle'
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
      const apiFilters = {
        ...filters,
        dateFrom: filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined,
        dateTo: filters.dateTo ? filters.dateTo.toISOString().split('T')[0] : undefined
      }
      
      const result = isAdmin 
        ? await apiClient.getEvents(apiFilters)
        : await apiClient.getPublicEvents(apiFilters)

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

  const handleLimitChange = useCallback((limit: number) => {
    const newFilters = { ...currentFilters, limit, page: 1 }
    setCurrentFilters(newFilters)
    loadEvents(newFilters)
  }, [currentFilters, loadEvents])

  const handleEventCreated = useCallback(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters])

  const handleEventUpdated = useCallback(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters])

  useEffect(() => {
    loadEvents(currentFilters)
  }, [loadEvents, currentFilters, isAdmin])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return (
    <div className="min-h-screen bg-particles transition-colors duration-300">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="header-futuristic"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center space-x-4"
          >
            <h1 className="text-3xl font-bold text-glow bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Nolte
            </h1>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-4"
          >
            <AuthToggle onAuthChange={handleAuthChange} />
            <ThemeToggle />
          </motion.div>
        </div>
      </motion.header>

      <div className="container mx-auto px-6 py-8 max-w-7xl flex flex-col" style={{ minHeight: '100dvh' }}>
        <div className="flex-grow">
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-primary text-foreground mb-4" style={{ fontWeight: 400, lineHeight: 1.4 }}>
              {isAdmin ? 'Event Management' : 'Discover Events'}
            </h2>
            <p className="text-xl text-muted-foreground font-primary" style={{ fontWeight: 400, lineHeight: 1.4 }}>
              {isAdmin 
                ? 'Create, manage, and track your events with professional tools and AI-powered insights.'
                : 'Explore upcoming events with AI-generated summaries and detailed information.'
              }
            </p>
          </div>
        </motion.section>

        {isAdmin && (
          <motion.section 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="glass-card p-8">
              <h3 className="text-2xl font-primary font-semibold text-foreground mb-6">
                Create New Event
              </h3>
              <EventForm onEventCreated={handleEventCreated} />
            </div>
          </motion.section>
        )}

        {error && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8"
          >
            <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
              <AlertDescription className="font-secondary">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <EventFilters 
            isAdmin={isAdmin}
            onFiltersChange={handleFiltersChange}
            loading={loading}
          />
        </motion.section>

        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <EventList
            events={events}
            isAdmin={isAdmin}
            loading={loading}
            error={error}
            pagination={pagination}
            onEventUpdated={handleEventUpdated}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </motion.section>
        </div>

        <motion.footer 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-auto py-4 pt-8 text-center"
        >
          <p className="text-muted-foreground font-secondary text-sm">
            © 2025 Nolte. All rights reserved.
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
