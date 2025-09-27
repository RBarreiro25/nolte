'use client'

import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { apiClient } from '../lib/api-client'

interface AuthToggleProps {
  onAuthChange: (isAuthenticated: boolean) => void
}

export function AuthToggle({ onAuthChange }: AuthToggleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = useCallback(() => {
    apiClient.setToken('admin-token-123')
    setIsAuthenticated(true)
    onAuthChange(true)
  }, [onAuthChange])

  const handleLogout = useCallback(() => {
    apiClient.clearToken()
    setIsAuthenticated(false)
    onAuthChange(false)
  }, [onAuthChange])


  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Badge 
          className={isAuthenticated 
            ? 'bg-gray-200 text-green-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-gray-600' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }
        >
          {isAuthenticated ? 'Admin' : 'Public'}
        </Badge>
      </div>
      
      {!isAuthenticated ? (
        <Button onClick={handleLogin} className="btn-futuristic h-8 px-4 text-xs">
          Go to Admin
        </Button>
      ) : (
        <Button onClick={handleLogout} className="btn-futuristic h-8 px-3 text-xs bg-foreground/20 hover:bg-foreground/30 text-foreground">
          Go to Public
        </Button>
      )}
    </div>
  )
}

