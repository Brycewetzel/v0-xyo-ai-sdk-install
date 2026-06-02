// API route: POST /api/game/commit
// Human player commits their guess

import { NextResponse } from 'next/server'
import { humanCommit, getGameStatus } from '@/lib/game/store'
import { GAME_CONFIG } from '@/lib/game/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guess, secret } = body

    // Validate guess
    if (
      typeof guess !== 'number' ||
      guess < GAME_CONFIG.MIN_GUESS ||
      guess > GAME_CONFIG.MAX_GUESS
    ) {
      return NextResponse.json(
        {
          error: `Guess must be a number between ${GAME_CONFIG.MIN_GUESS} and ${GAME_CONFIG.MAX_GUESS}`,
        },
        { status: 400 }
      )
    }

    // Validate secret
    if (typeof secret !== 'string' || secret.length < 16) {
      return NextResponse.json(
        { error: 'Secret must be a string of at least 16 characters' },
        { status: 400 }
      )
    }

    const result = humanCommit(guess, secret)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const status = getGameStatus()

    return NextResponse.json({
      success: true,
      commitment: result.commitment,
      roundId: status.roundId,
      phase: status.phase,
      timeRemaining: status.timeRemaining,
    })
  } catch (error) {
    console.error('Commit error:', error)
    return NextResponse.json(
      { error: 'Failed to commit guess' },
      { status: 500 }
    )
  }
}
