'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Input } from './ui/input'
import { DatePicker } from './ui/date-picker'
import { FuturisticSelect } from './ui/futuristic-select'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { useToast } from '../hooks/use-toast'

export interface FilterValues {
  status?: string
  locations?: string
  dateFrom?: Date | null
  dateTo?: Date | null
  page?: number
  limit?: number
}

interface EventFiltersProps {
  isAdmin: boolean
  onFiltersChange: (filters: FilterValues) => void
  loading?: boolean
}

export function EventFilters({ isAdmin, onFiltersChange, loading }: EventFiltersProps) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<FilterValues>({
    page: 1,
    limit: 20
  })

  const updateFilter = useCallback((key: keyof FilterValues, value: string | number | Date | null | undefined) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value }
      if (key !== 'page') {
        newFilters.page = 1
      }
      return newFilters
    })
  }, [])

  const validateDateRange = useCallback((dateFrom?: Date | null, dateTo?: Date | null) => {
    if (!dateFrom || !dateTo) return { isValid: true, error: null }
    
    if (dateFrom > dateTo) {
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
      toast({
        variant: 'destructive',
        title: 'Invalid Date Range',
        description: validation.error || 'Please check your date selection'
      })
      return
    }

    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key as keyof FilterValues] = value
      }
      return acc
    }, {} as FilterValues)
    
    onFiltersChange(cleanFilters)
  }, [filters, onFiltersChange, validateDateRange, toast])

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
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-4"
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
      >
        {isAdmin && (
          <motion.div 
            className="space-y-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.label 
              className="text-sm font-medium text-foreground font-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              Status
            </motion.label>
            <FuturisticSelect
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
              placeholder="All statuses"
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'CANCELLED', label: 'Cancelled' }
              ]}
            />
          </motion.div>
        )}
        
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: isAdmin ? 0.3 : 0.2, duration: 0.4 }}
        >
          <motion.label 
            className="text-sm font-medium text-foreground font-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isAdmin ? 0.35 : 0.25, duration: 0.3 }}
          >
            Location
          </motion.label>
          <Input
            placeholder="Filter by location"
            value={filters.locations || ''}
            onChange={(e) => updateFilter('locations', e.target.value)}
            className="input-futuristic"
          />
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: isAdmin ? 0.4 : 0.3, duration: 0.4 }}
        >
          <motion.label 
            className="text-sm font-medium text-foreground font-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isAdmin ? 0.45 : 0.35, duration: 0.3 }}
          >
            Start Date (from)
          </motion.label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(date) => updateFilter('dateFrom', date)}
            placeholder="Select start date"
            includeTime={false}
            className={!dateValidation.isValid ? 'border-destructive' : ''}
          />
        </motion.div>
        
        <motion.div 
          className="space-y-2"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: isAdmin ? 0.5 : 0.4, duration: 0.4 }}
        >
          <motion.label 
            className="text-sm font-medium text-foreground font-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: isAdmin ? 0.55 : 0.45, duration: 0.3 }}
          >
            End Date (to)
          </motion.label>
          <DatePicker
            value={filters.dateTo}
            onChange={(date) => updateFilter('dateTo', date)}
            placeholder="Select end date"
            includeTime={false}
            minDate={filters.dateFrom || undefined}
            className={!dateValidation.isValid ? 'border-destructive' : ''}
          />
        </motion.div>

        <motion.div 
          className="flex gap-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: isAdmin ? 0.6 : 0.5, duration: 0.4, ease: "backOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={applyFilters} 
              disabled={loading || !dateValidation.isValid}
              className="btn-futuristic px-6 py-2 cursor-pointer"
            >
              {loading ? <Spinner size="sm" /> : 'Apply'}
            </Button>
          </motion.div>
          {hasActiveFilters && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                disabled={loading} 
                className="hover:bg-muted cursor-pointer"
              >
                Clear All
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {!dateValidation.isValid && (
        <motion.div 
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20"
          initial={{ y: -10, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {dateValidation.error}
        </motion.div>
      )}
    </motion.div>
  )
}
