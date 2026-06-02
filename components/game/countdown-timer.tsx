'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  targetTime: number // Unix timestamp in ms
  onExpire?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function CountdownTimer({
  targetTime,
  onExpire,
  className,
  size = 'md',
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, targetTime - now)
      setTimeRemaining(remaining)

      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 100)

    return () => clearInterval(interval)
  }, [targetTime, onExpire])

  const seconds = Math.ceil(timeRemaining / 1000)
  const progress = targetTime > Date.now() ? (timeRemaining / 30000) * 100 : 0

  const sizeClasses = {
    sm: 'h-16 w-16 text-lg',
    md: 'h-24 w-24 text-2xl',
    lg: 'h-32 w-32 text-4xl',
  }

  const isLow = seconds <= 10
  const isCritical = seconds <= 5

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full',
        sizeClasses[size],
        className
      )}
    >
      {/* Background circle */}
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-secondary"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeDasharray={`${progress * 2.83} 283`}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-100',
            isCritical
              ? 'text-destructive'
              : isLow
                ? 'text-warning'
                : 'text-primary'
          )}
        />
      </svg>

      {/* Timer text */}
      <span
        className={cn(
          'font-mono font-bold',
          isCritical
            ? 'text-destructive animate-pulse'
            : isLow
              ? 'text-warning'
              : 'text-foreground'
        )}
      >
        {seconds}s
      </span>
    </div>
  )
}

interface TimeRemainingProps {
  milliseconds: number
  className?: string
}

export function TimeRemaining({ milliseconds, className }: TimeRemainingProps) {
  const seconds = Math.ceil(milliseconds / 1000)
  const isLow = seconds <= 10
  const isCritical = seconds <= 5

  return (
    <span
      className={cn(
        'font-mono font-semibold',
        isCritical
          ? 'text-destructive animate-pulse'
          : isLow
            ? 'text-warning'
            : 'text-primary',
        className
      )}
    >
      {seconds}s
    </span>
  )
}
