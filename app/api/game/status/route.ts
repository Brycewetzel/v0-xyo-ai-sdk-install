// API route: GET /api/game/status
// Returns current game state

import { NextResponse } from 'next/server'
import { getGameStatus, getGameState, startNewRound } from '@/lib/game/store'

export async function GET() {
  try {
    const status = getGameStatus()
    const state = getGameState()

    return NextResponse.json({
      ...status,
      humanScore: state.humanScore,
      botScore: state.botScore,
      historyCount: state.history.length,
    })
  } catch (error) {
    console.error('Game status error:', error)
    return NextResponse.json(
      { error: 'Failed to get game status' },
      { status: 500 }
    )
  }
}

// POST to start a new round
export async function POST() {
  try {
    const round = startNewRound()

    return NextResponse.json({
      success: true,
      round,
    })
  } catch (error) {
    console.error('Start round error:', error)
    return NextResponse.json(
      { error: 'Failed to start new round' },
      { status: 500 }
    )
  }
}
