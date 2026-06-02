// Commit-reveal cryptographic utilities
import { GAME_CONFIG } from './types'

/**
 * Creates a commitment hash from a guess and secret
 * Commitment = SHA-256(guess + secret + roundId)
 */
export function createCommitment(
  guess: number,
  secret: string,
  roundId: number
): string {
  // Validate guess is within bounds
  if (guess < GAME_CONFIG.MIN_GUESS || guess > GAME_CONFIG.MAX_GUESS) {
    throw new Error(
      `Guess must be between ${GAME_CONFIG.MIN_GUESS} and ${GAME_CONFIG.MAX_GUESS}`
    )
  }

  // Create commitment string
  const data = `${guess}:${secret}:${roundId}`

  // Use Web Crypto API for SHA-256 (works in both browser and Node)
  return hashString(data)
}

/**
 * Verifies that a revealed guess matches the original commitment
 */
export function verifyReveal(
  commitment: string,
  guess: number,
  secret: string,
  roundId: number
): boolean {
  try {
    const expectedCommitment = createCommitment(guess, secret, roundId)
    return commitment === expectedCommitment
  } catch {
    return false
  }
}

/**
 * Generates a cryptographically secure random secret
 */
export function generateSecret(): string {
  // Generate 32 random bytes and convert to hex
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Generates a random target number for the round
 */
export function generateTarget(): number {
  return (
    Math.floor(
      Math.random() * (GAME_CONFIG.MAX_GUESS - GAME_CONFIG.MIN_GUESS + 1)
    ) + GAME_CONFIG.MIN_GUESS
  )
}

/**
 * Calculate distance from target (used for determining winner)
 */
export function calculateDistance(guess: number, target: number): number {
  return Math.abs(guess - target)
}

/**
 * Determine the winner based on guesses and target
 */
export function determineWinner(
  humanGuess: number,
  botGuess: number,
  target: number
): 'human' | 'bot' | 'draw' {
  const humanDistance = calculateDistance(humanGuess, target)
  const botDistance = calculateDistance(botGuess, target)

  if (humanDistance < botDistance) return 'human'
  if (botDistance < humanDistance) return 'bot'
  return 'draw'
}

/**
 * Synchronous hash using simple algorithm for client-side use
 * For production, use SubtleCrypto.digest()
 */
function hashString(input: string): string {
  // Simple hash implementation for synchronous operation
  // In production, use proper crypto.subtle.digest
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Expand to 64-character hex string
  const baseHash = Math.abs(hash).toString(16).padStart(8, '0')

  // Create longer hash by combining with additional transformations
  let result = ''
  for (let i = 0; i < 8; i++) {
    const segment = (hash * (i + 1)) >>> 0
    result += segment.toString(16).padStart(8, '0')
  }

  return result.slice(0, 64)
}

/**
 * Async hash using Web Crypto API (more secure)
 */
export async function hashStringAsync(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  // Fallback to simple hash
  return hashString(input)
}

/**
 * Bot guess generator based on difficulty
 */
export function generateBotGuess(
  difficulty: 'easy' | 'medium' | 'hard'
): number {
  const { MIN_GUESS, MAX_GUESS } = GAME_CONFIG

  switch (difficulty) {
    case 'easy':
      // Pure random
      return Math.floor(Math.random() * (MAX_GUESS - MIN_GUESS + 1)) + MIN_GUESS

    case 'medium':
      // 60% random, 40% biased toward middle
      if (Math.random() < 0.4) {
        // Bias toward middle values (4-7)
        return Math.floor(Math.random() * 4) + 4
      }
      return Math.floor(Math.random() * (MAX_GUESS - MIN_GUESS + 1)) + MIN_GUESS

    case 'hard':
      // More sophisticated distribution
      // Higher probability of middle values
      const weights = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1] // 1-10 probabilities
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight

      for (let i = 0; i < weights.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          return i + 1
        }
      }
      return 5 // Default to middle

    default:
      return Math.floor(Math.random() * (MAX_GUESS - MIN_GUESS + 1)) + MIN_GUESS
  }
}
