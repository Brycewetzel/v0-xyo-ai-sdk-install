'use client'

import { useState, useEffect } from 'react'
import { Lock, Shuffle, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { generateSecret } from '@/lib/game/commit-reveal'
import { GAME_CONFIG } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface CommitFormProps {
  disabled?: boolean
  onCommit: (guess: number, secret: string) => Promise<void>
  isCommitting?: boolean
  className?: string
}

export function CommitForm({
  disabled,
  onCommit,
  isCommitting,
  className,
}: CommitFormProps) {
  const [guess, setGuess] = useState(5)
  const [secret, setSecret] = useState('')

  // Generate secret on mount
  useEffect(() => {
    setSecret(generateSecret())
  }, [])

  const handleSubmit = async () => {
    if (!secret) return
    await onCommit(guess, secret)
  }

  const regenerateSecret = () => {
    setSecret(generateSecret())
  }

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-primary" />
          Make Your Guess
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Guess selector */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Your Guess</span>
            <span className="text-3xl font-bold text-primary">{guess}</span>
          </div>

          <Slider
            value={[guess]}
            onValueChange={([v]) => setGuess(v)}
            min={GAME_CONFIG.MIN_GUESS}
            max={GAME_CONFIG.MAX_GUESS}
            step={1}
            disabled={disabled || isCommitting}
            className="py-2"
          />

          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            {Array.from(
              { length: GAME_CONFIG.MAX_GUESS - GAME_CONFIG.MIN_GUESS + 1 },
              (_, i) => i + GAME_CONFIG.MIN_GUESS
            ).map((n) => (
              <span key={n} className={cn(n === guess && 'text-primary font-bold')}>
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Secret display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Secret Salt</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={regenerateSecret}
              disabled={disabled || isCommitting}
              className="h-7 gap-1.5 text-xs"
            >
              <Shuffle className="h-3 w-3" />
              Regenerate
            </Button>
          </div>
          <div className="rounded-md bg-secondary/50 p-2.5">
            <code className="block truncate text-xs text-muted-foreground font-mono">
              {secret.slice(0, 32)}...
            </code>
          </div>
          <p className="text-xs text-muted-foreground">
            This secret ensures your guess cannot be seen until reveal phase
          </p>
        </div>

        {/* Commit button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || isCommitting || !secret}
          className="w-full gap-2"
          size="lg"
        >
          {isCommitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Committing...
            </>
          ) : (
            <>
              <Hash className="h-4 w-4" />
              Commit Guess
            </>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Your guess will be hashed and submitted to the blockchain
        </p>
      </CardContent>
    </Card>
  )
}
