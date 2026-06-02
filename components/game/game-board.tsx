'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { Play, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoundDisplay } from './round-display'
import { CommitForm } from './commit-form'
import { RevealPanel } from './reveal-panel'
import { ResultDisplay } from './result-display'
import { HistoryTable } from './history-table'
import { ProvablyFairPanel } from './provably-fair-panel'
import type { GamePhase, RoundResult, Round } from '@/lib/game/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface GameStatus {
  phase: GamePhase
  roundId: number
  humanCommitted: boolean
  botCommitted: boolean
  humanRevealed: boolean
  botRevealed: boolean
  timeRemaining: number
  target?: number
  result?: RoundResult
  humanScore: number
  botScore: number
  historyCount: number
}

interface HistoryResponse {
  history: Round[]
  humanScore: number
  botScore: number
  totalRounds: number
}

export function GameBoard() {
  // Local state for stored commit data
  const [storedGuess, setStoredGuess] = useState<number | null>(null)
  const [storedSecret, setStoredSecret] = useState<string | null>(null)
  const [isCommitting, setIsCommitting] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [lastResult, setLastResult] = useState<RoundResult | null>(null)

  // Fetch game status with polling
  const { data: status, mutate: mutateStatus } = useSWR<GameStatus>(
    '/api/game/status',
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: true,
    }
  )

  // Fetch history
  const { data: historyData, mutate: mutateHistory } = useSWR<HistoryResponse>(
    '/api/game/history',
    fetcher,
    {
      refreshInterval: 5000,
    }
  )

  // Clear stored data when round changes or resolves
  useEffect(() => {
    if (status?.phase === 'waiting' || status?.phase === 'resolved') {
      if (status?.result) {
        setLastResult(status.result)
      }
    }
  }, [status?.phase, status?.result])

  // Start new round
  const startNewRound = useCallback(async () => {
    setIsStarting(true)
    try {
      const res = await fetch('/api/game/status', { method: 'POST' })
      if (res.ok) {
        // Clear previous round data
        setStoredGuess(null)
        setStoredSecret(null)
        setLastResult(null)
        await mutateStatus()
        await mutateHistory()
      }
    } finally {
      setIsStarting(false)
    }
  }, [mutateStatus, mutateHistory])

  // Commit guess
  const handleCommit = useCallback(
    async (guess: number, secret: string) => {
      setIsCommitting(true)
      try {
        const res = await fetch('/api/game/commit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guess, secret }),
        })

        if (res.ok) {
          // Store for reveal phase
          setStoredGuess(guess)
          setStoredSecret(secret)
          await mutateStatus()
        }
      } finally {
        setIsCommitting(false)
      }
    },
    [mutateStatus]
  )

  // Reveal guess
  const handleReveal = useCallback(
    async (roundId: number, guess: number, secret: string) => {
      setIsRevealing(true)
      try {
        const res = await fetch('/api/game/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roundId, guess, secret }),
        })

        if (res.ok) {
          await mutateStatus()
          await mutateHistory()
        }
      } finally {
        setIsRevealing(false)
      }
    },
    [mutateStatus, mutateHistory]
  )

  const phase = status?.phase || 'waiting'
  const roundId = status?.roundId || 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main game area */}
      <div className="space-y-6 lg:col-span-2">
        {/* Scores */}
        <div className="flex items-center justify-center gap-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 px-6 py-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">You</p>
            <p className="text-3xl font-bold text-primary">{status?.humanScore || 0}</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Bot</p>
            <p className="text-3xl font-bold text-chart-2">{status?.botScore || 0}</p>
          </div>
        </div>

        {/* Round display */}
        <RoundDisplay
          phase={phase}
          roundId={roundId}
          humanCommitted={status?.humanCommitted || false}
          botCommitted={status?.botCommitted || false}
          humanRevealed={status?.humanRevealed || false}
          botRevealed={status?.botRevealed || false}
          timeRemaining={status?.timeRemaining || 0}
        />

        {/* Phase-specific content */}
        {phase === 'waiting' && !lastResult && (
          <div className="flex flex-col items-center gap-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Ready to Play?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Start a new round to begin the prediction game
              </p>
            </div>
            <Button onClick={startNewRound} disabled={isStarting} size="lg" className="gap-2">
              {isStarting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start Round
                </>
              )}
            </Button>
          </div>
        )}

        {phase === 'commit' && !status?.humanCommitted && (
          <CommitForm onCommit={handleCommit} isCommitting={isCommitting} />
        )}

        {phase === 'commit' && status?.humanCommitted && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-6 text-center">
            <p className="text-success font-medium">Guess committed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for reveal phase to begin...
            </p>
          </div>
        )}

        {phase === 'reveal' && !status?.humanRevealed && (
          <RevealPanel
            roundId={roundId}
            storedGuess={storedGuess}
            storedSecret={storedSecret}
            onReveal={handleReveal}
            isRevealing={isRevealing}
          />
        )}

        {phase === 'reveal' && status?.humanRevealed && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-6 text-center">
            <p className="text-success font-medium">Guess revealed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Waiting for results...
            </p>
          </div>
        )}

        {(phase === 'resolved' || lastResult) && (lastResult || status?.result) && (
          <ResultDisplay
            result={(lastResult || status?.result)!}
            onNewRound={startNewRound}
            isStarting={isStarting}
          />
        )}

        {phase === 'expired' && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-6 text-center">
            <p className="text-destructive font-medium">Round Expired</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              The round timed out before completion
            </p>
            <Button onClick={startNewRound} disabled={isStarting}>
              Start New Round
            </Button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <ProvablyFairPanel />
        <HistoryTable history={historyData?.history || []} />
      </div>
    </div>
  )
}
