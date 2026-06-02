'use client'

import { Clock, Hash, Eye, Trophy, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TimeRemaining } from './countdown-timer'
import type { GamePhase } from '@/lib/game/types'
import { cn } from '@/lib/utils'

interface RoundDisplayProps {
  phase: GamePhase
  roundId: number
  humanCommitted: boolean
  botCommitted: boolean
  humanRevealed: boolean
  botRevealed: boolean
  timeRemaining: number
  className?: string
}

const phaseConfig: Record<
  GamePhase,
  { label: string; icon: typeof Clock; color: string; description: string }
> = {
  waiting: {
    label: 'Waiting',
    icon: Clock,
    color: 'bg-muted text-muted-foreground',
    description: 'Start a new round to begin playing',
  },
  commit: {
    label: 'Commit Phase',
    icon: Hash,
    color: 'bg-primary/10 text-primary',
    description: 'Submit your secret guess',
  },
  reveal: {
    label: 'Reveal Phase',
    icon: Eye,
    color: 'bg-warning/10 text-warning',
    description: 'Reveal your guess to determine the winner',
  },
  resolved: {
    label: 'Round Complete',
    icon: Trophy,
    color: 'bg-success/10 text-success',
    description: 'Round has been resolved',
  },
  expired: {
    label: 'Expired',
    icon: AlertCircle,
    color: 'bg-destructive/10 text-destructive',
    description: 'Round timed out',
  },
}

export function RoundDisplay({
  phase,
  roundId,
  humanCommitted,
  botCommitted,
  humanRevealed,
  botRevealed,
  timeRemaining,
  className,
}: RoundDisplayProps) {
  const config = phaseConfig[phase]
  const Icon = config.icon

  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="font-mono text-muted-foreground">#{roundId || '—'}</span>
            <Badge className={cn('gap-1.5', config.color)} variant="secondary">
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
          </CardTitle>
          {(phase === 'commit' || phase === 'reveal') && timeRemaining > 0 && (
            <TimeRemaining milliseconds={timeRemaining} />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Human status */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              You
            </p>
            <div className="flex flex-col gap-1.5">
              <StatusIndicator
                label="Committed"
                active={humanCommitted}
                highlight={phase === 'commit' && !humanCommitted}
              />
              <StatusIndicator
                label="Revealed"
                active={humanRevealed}
                highlight={phase === 'reveal' && !humanRevealed}
              />
            </div>
          </div>

          {/* Bot status */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Bot
            </p>
            <div className="flex flex-col gap-1.5">
              <StatusIndicator label="Committed" active={botCommitted} />
              <StatusIndicator label="Revealed" active={botRevealed} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusIndicator({
  label,
  active,
  highlight,
}: {
  label: string
  active: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full transition-colors',
          active
            ? 'bg-success'
            : highlight
              ? 'bg-warning animate-pulse'
              : 'bg-muted'
        )}
      />
      <span
        className={cn(
          'text-sm',
          active
            ? 'text-foreground'
            : highlight
              ? 'text-warning'
              : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </div>
  )
}
