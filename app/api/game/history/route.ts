// API route: GET /api/game/history
// Returns game history

import { NextResponse } from 'next/server'
import { getGameState } from '@/lib/game/store'

export async function GET() {
  try {
    const state = getGameState()

    return NextResponse.json({
      history: state.history.slice(0, 20), // Last 20 rounds
      humanScore: state.humanScore,
      botScore: state.botScore,
      totalRounds: state.history.length,
    })
  } catch (error) {
    console.error('History API error:', error)
    return NextResponse.json(
      { error: 'Failed to get history' },
      { status: 500 }
    )
  }
}
