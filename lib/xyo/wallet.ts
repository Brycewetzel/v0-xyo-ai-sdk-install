// XYO XL1 wallet utilities
// Using @xyo-network/sdk-js for wallet generation and management

import { HDNodeWallet, Mnemonic } from 'ethers'

export interface XyoWallet {
  address: string
  privateKey: string
  path: string
}

/**
 * Generate wallets from mnemonic phrase
 * Derives two accounts: Human (index 0) and Bot (index 1)
 */
export function getWalletsFromMnemonic(mnemonic: string): {
  human: XyoWallet
  bot: XyoWallet
} {
  if (!mnemonic || mnemonic.includes('word1')) {
    throw new Error('Invalid mnemonic - please configure your .env.local file')
  }

  const mnemonicObj = Mnemonic.fromPhrase(mnemonic.trim())

  // Derive human wallet (index 0)
  const humanPath = "m/44'/60'/0'/0/0"
  const humanWallet = HDNodeWallet.fromMnemonic(mnemonicObj, humanPath)

  // Derive bot wallet (index 1)
  const botPath = "m/44'/60'/0'/0/1"
  const botWallet = HDNodeWallet.fromMnemonic(mnemonicObj, botPath)

  return {
    human: {
      address: humanWallet.address,
      privateKey: humanWallet.privateKey,
      path: humanPath,
    },
    bot: {
      address: botWallet.address,
      privateKey: botWallet.privateKey,
      path: botPath,
    },
  }
}

/**
 * Generate a new random mnemonic phrase
 */
export function generateMnemonic(): string {
  const wallet = HDNodeWallet.createRandom()
  return wallet.mnemonic?.phrase || ''
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Validate an address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Format balance for display
 */
export function formatBalance(balance: string | number): string {
  const num = typeof balance === 'string' ? parseFloat(balance) : balance
  if (isNaN(num)) return '0.0000'
  return num.toFixed(4)
}

/**
 * Get wallet info for display (safe for client)
 */
export function getWalletInfo(wallet: XyoWallet): {
  address: string
  shortAddress: string
} {
  return {
    address: wallet.address,
    shortAddress: shortenAddress(wallet.address),
  }
}
