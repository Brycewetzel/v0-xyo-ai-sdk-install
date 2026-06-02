// Game state types for the commit-reveal prediction market

export type GamePhase = 'waiting' | 'commit' | 'reveal' | 'resolved' | 'expired'

export type Player = 'human' | 'bot'

export interface Commitment {
  hash: string
  timestamp: number
  txHash?: string
}

export interface Reveal {
  guess: number
  secret: string
  timestamp: number
  verified: boolean
  txHash?: string
}

export interface RoundResult {
  winner: Player | 'draw'
  humanGuess: number
  botGuess: number
  target: number
  humanDistance: number
  botDistance: number
  reward: string
  txHash?: string
}

export interface Round {
  id: number
  phase: GamePhase
  target?: number // Hidden until reveal phase completes
  humanCommitment?: Commitment
  botCommitment?: Commitment
  humanReveal?: Reveal
  botReveal?: Reveal
  result?: RoundResult
  startedAt: number
  commitDeadline: number
  revealDeadline?: number
  resolvedAt?: number
}

export interface GameState {
  currentRound: Round | null
  history: Round[]
  humanScore: number
  botScore: number
}

export interface WalletInfo {
  address: string
  balance: string
  shortAddress: string
}

export interface WalletState {
  human: WalletInfo | null
  bot: WalletInfo | null
  loading: boolean
  error: string | null
}

// API Request/Response types
export interface CommitRequest {
  guess: number
  secret: string
}

export interface CommitResponse {
  success: boolean
  commitment: string
  roundId: number
  error?: string
}

export interface RevealRequest {
  roundId: number
  guess: number
  secret: string
}

export interface RevealResponse {
  success: boolean
  verified: boolean
  phase: GamePhase
  result?: RoundResult
  error?: string
}

export interface GameStatusResponse {
  phase: GamePhase
  roundId: number
  humanCommitted: boolean
  botCommitted: boolean
  humanRevealed: boolean
  botRevealed: boolean
  timeRemaining: number
  target?: number
  result?: RoundResult
}

// Scoring constants
export const GAME_CONFIG = {
  MIN_GUESS: 1,
  MAX_GUESS: 10,
  COMMIT_TIMEOUT_MS: 30000,
  REVEAL_TIMEOUT_MS: 30000,
  WAGER_AMOUNT: '0.001', // XL1 tokens per round
} as const
