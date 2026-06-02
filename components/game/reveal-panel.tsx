'use client'

import { Eye, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RevealPanelProps {
  roundId: number
  storedGuess: number | null
  storedSecret: string | null
  disabled?: boolean
  onReveal: (roundId: number, guess: number, secret: string) => Promise<void>
  isRevealing?: boolean
  className?: string
}

export function RevealPanel({
  roundId,
  storedGuess,
  storedSecret,
  disabled,
  onReveal,
  isRevealing,
  className,
}: RevealPanelProps) {
  const canReveal = storedGuess !== null && storedSecret !== null

  const handleReveal = async () => {
    if (!canReveal) return
    await onReveal(roundId, storedGuess!, storedSecret!)
  }

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-5 w-5 text-warning" />
          Reveal Your Guess
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {canReveal ? (
          <>
            {/* Show stored guess */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">Your committed guess</span>
              <span className="text-2xl font-bold text-primary">{storedGuess}</span>
            </div>

            <p className="text-sm text-muted-foreground">
              Revealing will prove your guess matches your earlier commitment. The winner
              is whoever guessed closest to the target number.
            </p>

            <Button
              onClick={handleReveal}
              disabled={disabled || isRevealing}
              className="w-full gap-2 bg-warning text-warning-foreground hover:bg-warning/90"
              size="lg"
            >
              {isRevealing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Revealing...
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Reveal Guess
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Cannot Reveal</p>
              <p className="text-sm text-muted-foreground">
                No stored guess found. You may have refreshed the page after committing.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
