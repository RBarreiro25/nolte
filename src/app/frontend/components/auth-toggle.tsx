'use client'

import { useState, useCallback } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { apiClient } from '../lib/api-client'

interface AuthToggleProps {
  onAuthChange: (isAuthenticated: boolean) => void
}

export function AuthToggle({ onAuthChange }: AuthToggleProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState('admin-token-123')

  const handleLogin = useCallback(() => {
    if (token.trim()) {
      apiClient.setToken(token)
      setIsAuthenticated(true)
      onAuthChange(true)
    }
  }, [token, onAuthChange])

  const handleLogout = useCallback(() => {
    apiClient.clearToken()
    setIsAuthenticated(false)
    onAuthChange(false)
  }, [onAuthChange])

  const handleTokenChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setToken(e.target.value)
  }, [])

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">View Mode:</span>
        <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
          {isAuthenticated ? 'Admin' : 'Public'}
        </Badge>
      </div>
      
      {!isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Bearer token"
            value={token}
            onChange={handleTokenChange}
            className="w-40"
          />
          <Button onClick={handleLogin} size="sm">
            Login as Admin
          </Button>
        </div>
      ) : (
        <Button onClick={handleLogout} variant="outline" size="sm">
          Switch to Public View
        </Button>
      )}
    </div>
  )
}

