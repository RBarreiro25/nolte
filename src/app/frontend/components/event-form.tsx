'use client'

import { useState, useCallback, useMemo } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Alert, AlertDescription } from './ui/alert'
import { apiClient } from '../lib/api-client'
import { useToast } from '../hooks/use-toast'

interface EventFormProps {
  onEventCreated: () => void
}

interface FormData {
  title: string
  startAt: string
  endAt: string
  location: string
  internalNotes: string
}

export function EventForm({ onEventCreated }: EventFormProps) {
  const formatDateTimeLocal = useCallback((date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }, [])

  const getDefaultStartTime = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    return formatDateTimeLocal(tomorrow)
  }, [formatDateTimeLocal])

  const getDefaultEndTime = useCallback(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(18, 0, 0, 0)
    return formatDateTimeLocal(tomorrow)
  }, [formatDateTimeLocal])

  const [formData, setFormData] = useState<FormData>({
    title: '',
    startAt: getDefaultStartTime(),
    endAt: getDefaultEndTime(),
    location: '',
    internalNotes: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const validateForm = useMemo(() => {
    const { title, startAt, endAt, location } = formData
    const isValid = title.trim() && startAt && endAt && location.trim()
    const startDate = new Date(startAt)
    const endDate = new Date(endAt)
    const now = new Date()
    
    return {
      isValid: isValid && startDate > now && endDate > startDate,
      errors: {
        pastDate: startDate <= now,
        endBeforeStart: endDate <= startDate,
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
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
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
          startAt: '',
          endAt: '',
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
  }, [formData, validateForm.isValid, validateForm.errors.pastDate, validateForm.errors.endBeforeStart, onEventCreated, toast])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Event Title</label>
            <Input
              placeholder="Enter event title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              maxLength={200}
              required
              className={!formData.title.trim() && formData.title !== '' ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              {!formData.title.trim() && formData.title !== '' ? (
                <span className="text-red-500">Title is required</span>
              ) : (
                <span>Required field</span>
              )}
              <span>{formData.title.length}/200</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => updateField('startAt', e.target.value)}
                required
                className={validateForm.errors.pastDate ? 'border-red-500' : ''}
              />
              {validateForm.errors.pastDate && (
                <p className="text-sm text-red-500 mt-1">Event cannot start in the past</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">End Date & Time</label>
              <Input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => updateField('endAt', e.target.value)}
                required
                className={validateForm.errors.endBeforeStart ? 'border-red-500' : ''}
              />
              {validateForm.errors.endBeforeStart && (
                <p className="text-sm text-red-500 mt-1">End time must be after start time</p>
              )}
            </div>
          </div>
          
          <div>
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              required
              className={!formData.location.trim() && formData.location !== '' ? 'border-red-500' : ''}
            />
            {!formData.location.trim() && formData.location !== '' && (
              <p className="text-sm text-red-500 mt-1">Location is required</p>
            )}
          </div>
          
          <div>
            <Input
              placeholder="Internal notes (optional)"
              value={formData.internalNotes}
              onChange={(e) => updateField('internalNotes', e.target.value)}
            />
          </div>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={!validateForm.isValid || isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Event'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
