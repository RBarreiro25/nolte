'use client'

import { useTheme } from '../lib/theme-provider'
import { Button } from './ui/button'
import { motion } from 'framer-motion'
import { LightMode, DarkMode } from '@mui/icons-material'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="relative w-9 h-9 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
      >
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 0 : 1,
            rotate: theme === 'dark' ? 90 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <LightMode style={{ fontSize: '16px' }} />
        </motion.div>
        
        <motion.div
          initial={false}
          animate={{
            scale: theme === 'dark' ? 1 : 0,
            rotate: theme === 'dark' ? 0 : -90,
          }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <DarkMode style={{ fontSize: '16px' }} />
        </motion.div>
      </Button>
    </motion.div>
  )
}
