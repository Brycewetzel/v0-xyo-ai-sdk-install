// API route: POST /api/game/reveal
// Human player reveals their guess

import { NextResponse } from 'next/server'
import { humanReveal, getGameStatus, getGameState } from '@/lib/game/store'
import { GAME_CONFIG } from '@/lib/game/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roundId, guess, secret } = body

    // Validate roundId
    if (typeof roundId !== 'number' || roundId < 1) {
      return NextResponse.json(
        { error: 'Invalid round ID' },
        { status: 400 }
      )
    }

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

    const result = humanReveal(roundId, guess, secret)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const status = getGameStatus()
    const state = getGameState()

    return NextResponse.json({
      success: true,
      phase: status.phase,
      result: result.result,
      humanScore: state.humanScore,
      botScore: state.botScore,
    })
  } catch (error) {
    console.error('Reveal error:', error)
    return NextResponse.json(
      { error: 'Failed to reveal guess' },
      { status: 500 }
    )
  }
}
