// In-memory game state store (server-side)
// In production, this would be persisted to a database

import type {
  GameState,
  Round,
  GamePhase,
  Commitment,
  Reveal,
  RoundResult,
} from './types'
import { GAME_CONFIG } from './types'
import {
  generateTarget,
  generateSecret,
  createCommitment,
  generateBotGuess,
  determineWinner,
  calculateDistance,
} from './commit-reveal'

// Server-side game state
let gameState: GameState = {
  currentRound: null,
  history: [],
  humanScore: 0,
  botScore: 0,
}

// Bot's private data (never exposed to client)
let botSecrets: Map<number, { guess: number; secret: string }> = new Map()

/**
 * Get the current game state (sanitized for client)
 */
export function getGameState(): GameState {
  return {
    ...gameState,
    currentRound: gameState.currentRound
      ? sanitizeRound(gameState.currentRound)
      : null,
  }
}

/**
 * Remove sensitive data from round before sending to client
 */
function sanitizeRound(round: Round): Round {
  return {
    ...round,
    // Hide target until round is resolved
    target: round.phase === 'resolved' ? round.target : undefined,
  }
}

/**
 * Start a new round
 */
export function startNewRound(): Round {
  const roundId = gameState.history.length + 1
  const now = Date.now()

  const newRound: Round = {
    id: roundId,
    phase: 'commit',
    target: generateTarget(), // Hidden from client until resolved
    startedAt: now,
    commitDeadline: now + GAME_CONFIG.COMMIT_TIMEOUT_MS,
  }

  gameState.currentRound = newRound
  return sanitizeRound(newRound)
}

/**
 * Human commits their guess
 */
export function humanCommit(
  guess: number,
  secret: string
): { success: boolean; commitment?: string; error?: string } {
  if (!gameState.currentRound) {
    return { success: false, error: 'No active round' }
  }

  if (gameState.currentRound.phase !== 'commit') {
    return { success: false, error: 'Not in commit phase' }
  }

  if (gameState.currentRound.humanCommitment) {
    return { success: false, error: 'Already committed' }
  }

  const now = Date.now()
  if (now > gameState.currentRound.commitDeadline) {
    gameState.currentRound.phase = 'expired'
    return { success: false, error: 'Commit phase expired' }
  }

  const hash = createCommitment(guess, secret, gameState.currentRound.id)

  const commitment: Commitment = {
    hash,
    timestamp: now,
  }

  gameState.currentRound.humanCommitment = commitment

  // Bot auto-commits when human commits
  botAutoCommit()

  return { success: true, commitment: hash }
}

/**
 * Bot automatically commits after human
 */
function botAutoCommit(): void {
  if (!gameState.currentRound || gameState.currentRound.botCommitment) {
    return
  }

  const difficulty =
    (process.env.BOT_DIFFICULTY as 'easy' | 'medium' | 'hard') || 'medium'
  const guess = generateBotGuess(difficulty)
  const secret = generateSecret()

  // Store bot's secret data
  botSecrets.set(gameState.currentRound.id, { guess, secret })

  const hash = createCommitment(guess, secret, gameState.currentRound.id)

  gameState.currentRound.botCommitment = {
    hash,
    timestamp: Date.now(),
  }

  // Check if both committed, move to reveal phase
  if (gameState.currentRound.humanCommitment) {
    gameState.currentRound.phase = 'reveal'
    gameState.currentRound.revealDeadline =
      Date.now() + GAME_CONFIG.REVEAL_TIMEOUT_MS
  }
}

/**
 * Human reveals their guess
 */
export function humanReveal(
  roundId: number,
  guess: number,
  secret: string
): { success: boolean; result?: RoundResult; error?: string } {
  if (!gameState.currentRound || gameState.currentRound.id !== roundId) {
    return { success: false, error: 'Invalid round' }
  }

  if (gameState.currentRound.phase !== 'reveal') {
    return { success: false, error: 'Not in reveal phase' }
  }

  if (gameState.currentRound.humanReveal) {
    return { success: false, error: 'Already revealed' }
  }

  const now = Date.now()
  if (
    gameState.currentRound.revealDeadline &&
    now > gameState.currentRound.revealDeadline
  ) {
    gameState.currentRound.phase = 'expired'
    return { success: false, error: 'Reveal phase expired' }
  }

  // Verify the commitment
  const expectedHash = createCommitment(guess, secret, roundId)
  if (expectedHash !== gameState.currentRound.humanCommitment?.hash) {
    return { success: false, error: 'Invalid reveal - does not match commitment' }
  }

  const reveal: Reveal = {
    guess,
    secret,
    timestamp: now,
    verified: true,
  }

  gameState.currentRound.humanReveal = reveal

  // Bot auto-reveals
  botAutoReveal()

  // If both revealed, resolve the round
  if (gameState.currentRound.botReveal) {
    return { success: true, result: resolveRound() }
  }

  return { success: true }
}

/**
 * Bot automatically reveals after human
 */
function botAutoReveal(): void {
  if (!gameState.currentRound || gameState.currentRound.botReveal) {
    return
  }

  const botData = botSecrets.get(gameState.currentRound.id)
  if (!botData) {
    return
  }

  gameState.currentRound.botReveal = {
    guess: botData.guess,
    secret: botData.secret,
    timestamp: Date.now(),
    verified: true,
  }
}

/**
 * Resolve the round and determine winner
 */
function resolveRound(): RoundResult | undefined {
  if (
    !gameState.currentRound ||
    !gameState.currentRound.humanReveal ||
    !gameState.currentRound.botReveal ||
    !gameState.currentRound.target
  ) {
    return undefined
  }

  const humanGuess = gameState.currentRound.humanReveal.guess
  const botGuess = gameState.currentRound.botReveal.guess
  const target = gameState.currentRound.target

  const winner = determineWinner(humanGuess, botGuess, target)

  const result: RoundResult = {
    winner,
    humanGuess,
    botGuess,
    target,
    humanDistance: calculateDistance(humanGuess, target),
    botDistance: calculateDistance(botGuess, target),
    reward: GAME_CONFIG.WAGER_AMOUNT,
  }

  gameState.currentRound.result = result
  gameState.currentRound.phase = 'resolved'
  gameState.currentRound.resolvedAt = Date.now()

  // Update scores
  if (winner === 'human') {
    gameState.humanScore++
  } else if (winner === 'bot') {
    gameState.botScore++
  }

  // Move to history
  gameState.history.unshift({ ...gameState.currentRound })

  // Clean up bot secrets
  botSecrets.delete(gameState.currentRound.id)

  return result
}

/**
 * Get current game status for API
 */
export function getGameStatus(): {
  phase: GamePhase
  roundId: number
  humanCommitted: boolean
  botCommitted: boolean
  humanRevealed: boolean
  botRevealed: boolean
  timeRemaining: number
  target?: number
  result?: RoundResult
} {
  if (!gameState.currentRound) {
    return {
      phase: 'waiting',
      roundId: 0,
      humanCommitted: false,
      botCommitted: false,
      humanRevealed: false,
      botRevealed: false,
      timeRemaining: 0,
    }
  }

  const now = Date.now()
  const round = gameState.currentRound

  let timeRemaining = 0
  if (round.phase === 'commit') {
    timeRemaining = Math.max(0, round.commitDeadline - now)
  } else if (round.phase === 'reveal' && round.revealDeadline) {
    timeRemaining = Math.max(0, round.revealDeadline - now)
  }

  return {
    phase: round.phase,
    roundId: round.id,
    humanCommitted: !!round.humanCommitment,
    botCommitted: !!round.botCommitment,
    humanRevealed: !!round.humanReveal,
    botRevealed: !!round.botReveal,
    timeRemaining,
    target: round.phase === 'resolved' ? round.target : undefined,
    result: round.result,
  }
}

/**
 * Reset the game (for testing)
 */
export function resetGame(): void {
  gameState = {
    currentRound: null,
    history: [],
    humanScore: 0,
    botScore: 0,
  }
  botSecrets.clear()
}
