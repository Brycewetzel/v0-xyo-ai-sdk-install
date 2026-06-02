'use client'

import { History, Trophy, User, Bot, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Round } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface HistoryTableProps {
  history: Round[]
  className?: string
}

export function HistoryTable({ history, className }: HistoryTableProps) {
  if (history.length === 0) {
    return (
      <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-muted-foreground" />
            Game History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            No games played yet. Start a round to begin!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-muted-foreground" />
          Game History
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-1 px-4">
            {history.map((round) => (
              <HistoryRow key={round.id} round={round} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function HistoryRow({ round }: { round: Round }) {
  const result = round.result
  if (!result) return null

  const isHumanWin = result.winner === 'human'
  const isBotWin = result.winner === 'bot'
  const isDraw = result.winner === 'draw'

  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/30 px-3 py-2 text-sm">
      {/* Round number */}
      <span className="font-mono text-xs text-muted-foreground w-8">#{round.id}</span>

      {/* Winner indicator */}
      <div className="flex items-center gap-1.5 w-20">
        {isDraw ? (
          <>
            <Minus className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Draw</span>
          </>
        ) : isHumanWin ? (
          <>
            <Trophy className="h-3.5 w-3.5 text-success" />
            <span className="text-success">Won</span>
          </>
        ) : (
          <>
            <Trophy className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive">Lost</span>
          </>
        )}
      </div>

      {/* Target */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Target:</span>
        <span className="font-mono font-medium text-foreground">{result.target}</span>
      </div>

      {/* Guesses */}
      <div className="ml-auto flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3 text-muted-foreground" />
          <span className={cn('font-mono', isHumanWin && 'text-success font-medium')}>
            {result.humanGuess}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Bot className="h-3 w-3 text-muted-foreground" />
          <span className={cn('font-mono', isBotWin && 'text-destructive font-medium')}>
            {result.botGuess}
          </span>
        </div>
      </div>
    </div>
  )
}
