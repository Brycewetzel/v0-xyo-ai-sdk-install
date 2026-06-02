'use client'

import { Trophy, Target, User, Bot, Minus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { RoundResult } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface ResultDisplayProps {
  result: RoundResult
  onNewRound: () => void
  isStarting?: boolean
  className?: string
}

export function ResultDisplay({
  result,
  onNewRound,
  isStarting,
  className,
}: ResultDisplayProps) {
  const isHumanWinner = result.winner === 'human'
  const isBotWinner = result.winner === 'bot'
  const isDraw = result.winner === 'draw'

  return (
    <Card
      className={cn(
        'border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      {/* Winner banner */}
      <div
        className={cn(
          'px-4 py-3 text-center',
          isHumanWinner
            ? 'bg-success/10'
            : isBotWinner
              ? 'bg-destructive/10'
              : 'bg-muted'
        )}
      >
        <div className="flex items-center justify-center gap-2">
          {isDraw ? (
            <Minus className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Trophy
              className={cn(
                'h-5 w-5',
                isHumanWinner ? 'text-success' : 'text-destructive'
              )}
            />
          )}
          <span
            className={cn(
              'text-lg font-bold',
              isHumanWinner
                ? 'text-success'
                : isBotWinner
                  ? 'text-destructive'
                  : 'text-muted-foreground'
            )}
          >
            {isHumanWinner ? 'You Win!' : isBotWinner ? 'Bot Wins!' : "It's a Draw!"}
          </span>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-primary" />
          Target Number:
          <span className="text-2xl font-bold text-primary">{result.target}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Guesses comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Human guess */}
          <div
            className={cn(
              'rounded-lg p-3 text-center',
              isHumanWinner ? 'bg-success/10 ring-1 ring-success/30' : 'bg-secondary/50'
            )}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              Your Guess
            </div>
            <div className="text-2xl font-bold">{result.humanGuess}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Distance: {result.humanDistance}
            </div>
          </div>

          {/* Bot guess */}
          <div
            className={cn(
              'rounded-lg p-3 text-center',
              isBotWinner ? 'bg-destructive/10 ring-1 ring-destructive/30' : 'bg-secondary/50'
            )}
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Bot className="h-3 w-3" />
              Bot Guess
            </div>
            <div className="text-2xl font-bold">{result.botGuess}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Distance: {result.botDistance}
            </div>
          </div>
        </div>

        {/* New round button */}
        <Button onClick={onNewRound} disabled={isStarting} className="w-full gap-2" size="lg">
          {isStarting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Starting...
            </>
          ) : (
            <>
              Play Again
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
