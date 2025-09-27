'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { DatePicker } from './ui/date-picker'
import { Alert, AlertDescription } from './ui/alert'
import { Spinner } from './ui/spinner'
import { apiClient } from '../lib/api-client'
import { useToast } from '../hooks/use-toast'

interface EventFormProps {
  onEventCreated: () => void
}

interface FormData {
  title: string
  startAt: Date | null
  endAt: Date | null
  location: string
  internalNotes: string
}

export function EventForm({ onEventCreated }: EventFormProps) {
  const defaultTimes = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const startTime = new Date(tomorrow)
    startTime.setHours(10, 0, 0, 0)
    
    const endTime = new Date(tomorrow)
    endTime.setHours(18, 0, 0, 0)

    return {
      start: startTime,
      end: endTime
    }
  }, [])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    startAt: defaultTimes.start,
    endAt: defaultTimes.end,
    location: '',
    internalNotes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const updateField = useCallback((field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const validateForm = useMemo(() => {
    const { title, startAt, endAt, location } = formData
    const isValid = title.trim() && startAt && endAt && location.trim()
    const now = new Date()
    
    return {
      isValid: isValid && startAt > now && endAt > startAt,
      errors: {
        pastDate: startAt ? startAt <= now : false,
        endBeforeStart: startAt && endAt ? endAt <= startAt : false,
        missingFields: !isValid
      }
    }
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm.isValid) {
      const errorMsg = 'Please fix the following issues: '
      const issues = []
      if (!formData.title.trim()) issues.push('Title required')
      if (!formData.location.trim()) issues.push('Location required')
      if (validateForm.errors.pastDate) issues.push('Start date must be in the future')
      if (validateForm.errors.endBeforeStart) issues.push('End date must be after start date')
      setError(errorMsg + issues.join(', '))
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await apiClient.createEvent({
        title: formData.title.trim(),
        startAt: formData.startAt!.toISOString(),
        endAt: formData.endAt!.toISOString(),
        location: formData.location.trim(),
        internalNotes: formData.internalNotes.trim() || undefined
      })

      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : result.error.message || 'Creation failed'
        setError(errorMessage)
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: errorMessage
        })
      } else {
        setFormData({
          title: '',
          startAt: defaultTimes.start,
          endAt: defaultTimes.end,
          location: '',
          internalNotes: ''
        })
        toast({
          variant: 'success',
          title: 'Event Created',
          description: 'Event has been created successfully'
        })
        onEventCreated()
      }
    } catch {
      const errorMsg = 'Failed to create event'
      setError(errorMsg)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, validateForm.isValid, validateForm.errors.pastDate, validateForm.errors.endBeforeStart, onEventCreated, toast, defaultTimes])


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground font-primary">
            Event Title
          </label>
          <Input
            placeholder="Enter event title"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={200}
            required
            className={`input-futuristic ${
              !formData.title.trim() && formData.title !== '' ? 'border-destructive focus:border-destructive' : ''
            }`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {!formData.title.trim() && formData.title !== '' ? (
              <span className="text-destructive">Title is required</span>
            ) : (
              <span>Required field</span>
            )}
            <span>{formData.title.length}/200</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground font-primary">
            Location
          </label>
          <Input
            placeholder="Event location"
            value={formData.location}
            onChange={(e) => updateField('location', e.target.value)}
            required
            className={`input-futuristic ${
              !formData.location.trim() && formData.location !== '' ? 'border-destructive focus:border-destructive' : ''
            }`}
          />
          {!formData.location.trim() && formData.location !== '' && (
            <p className="text-xs text-destructive">Location is required</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground font-primary">
            Start Date & Time
          </label>
          <DatePicker
            value={formData.startAt}
            onChange={(date) => updateField('startAt', date)}
            placeholder="Select start date & time"
            includeTime={true}
            minDate={new Date()}
            className={validateForm.errors.pastDate ? 'border-destructive focus:border-destructive' : ''}
          />
          {validateForm.errors.pastDate && (
            <p className="text-xs text-destructive">Event cannot start in the past</p>
          )}
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground font-primary">
            End Date & Time
          </label>
          <DatePicker
            value={formData.endAt}
            onChange={(date) => updateField('endAt', date)}
            placeholder="Select end date & time"
            includeTime={true}
            minDate={formData.startAt || new Date()}
            className={validateForm.errors.endBeforeStart ? 'border-destructive focus:border-destructive' : ''}
          />
          {validateForm.errors.endBeforeStart && (
            <p className="text-xs text-destructive">End time must be after start time</p>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium text-foreground font-primary">
          Internal Notes (Optional)
        </label>
        <Input
          placeholder="Add internal notes for your team"
          value={formData.internalNotes}
          onChange={(e) => updateField('internalNotes', e.target.value)}
          className="input-futuristic"
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
            <AlertDescription className="font-secondary">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          type="submit" 
          disabled={!validateForm.isValid || isLoading}
          className="w-auto min-w-[200px] btn-futuristic py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner size="sm" />
              <span>Creating Event</span>
            </div>
          ) : (
            'Create Event'
          )}
        </Button>
      </motion.div>
    </form>
  )
}
