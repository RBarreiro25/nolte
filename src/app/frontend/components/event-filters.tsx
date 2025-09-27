'use client'

import { useState, useCallback, useMemo } from 'react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export interface FilterValues {
  status?: string
  locations?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

interface EventFiltersProps {
  isAdmin: boolean
  onFiltersChange: (filters: FilterValues) => void
  loading?: boolean
}

export function EventFilters({ isAdmin, onFiltersChange, loading }: EventFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    page: 1,
    limit: 20
  })

  const updateFilter = useCallback((key: keyof FilterValues, value: string | number | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (key !== 'page') {
        newFilters.page = 1
      }
      return newFilters
    })
  }, [])

  const validateDateRange = useCallback((dateFrom?: string, dateTo?: string) => {
    if (!dateFrom || !dateTo) return { isValid: true, error: null }
    
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    
    if (fromDate > toDate) {
      return { 
        isValid: false, 
        error: 'End date must be after start date' 
      }
    }
    
    return { isValid: true, error: null }
  }, [])

  const applyFilters = useCallback(() => {
    const validation = validateDateRange(filters.dateFrom, filters.dateTo)
    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof FilterValues] = value
      }
      return acc
    }, {} as FilterValues)
    
    onFiltersChange(cleanFilters)
  }, [filters, onFiltersChange, validateDateRange])

  const clearFilters = useCallback(() => {
    const clearedFilters = { page: 1, limit: 20 }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }, [onFiltersChange])

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => 
      key !== 'page' && key !== 'limit' && value !== undefined && value !== ''
    )
  }, [filters])

  
  const dateValidation = useMemo(() => {
    return validateDateRange(filters.dateFrom, filters.dateTo)
  }, [filters.dateFrom, filters.dateTo, validateDateRange])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin && (
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-2 block">Location</label>
            <Input
              placeholder="Filter by location"
              value={filters.locations || ''}
              onChange={(e) => updateFilter('locations', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date (from)</label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className={!dateValidation.isValid ? 'border-red-500' : ''}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">End Date (to)</label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className={!dateValidation.isValid ? 'border-red-500' : ''}
            />
          </div>
        </div>

        {!dateValidation.isValid && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border">
            ⚠️ {dateValidation.error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              onClick={applyFilters} 
              disabled={loading || !dateValidation.isValid}
            >
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} disabled={loading}>
                Clear All
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Per page:</label>
            <Select onValueChange={(value) => updateFilter('limit', parseInt(value))}>
              <SelectTrigger className="w-20">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
