// XYO XL1 client and transaction utilities
// Connects to XL1 Sequence testnet

import { JsonRpcProvider, Wallet, parseEther, formatEther } from 'ethers'
import type { XyoWallet } from './wallet'

// XL1 Sequence testnet configuration
const XL1_RPC_URL = process.env.XL1_RPC_URL || 'https://sequence.xyo.network'
const XL1_CHAIN_ID = parseInt(process.env.XL1_CHAIN_ID || '1')

// Singleton provider
let provider: JsonRpcProvider | null = null

/**
 * Get or create the XL1 provider
 */
export function getProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(XL1_RPC_URL, {
      chainId: XL1_CHAIN_ID,
      name: 'XL1-Sequence',
    })
  }
  return provider
}

/**
 * Get connected signer for a wallet
 */
export function getSigner(walletData: XyoWallet): Wallet {
  return new Wallet(walletData.privateKey, getProvider())
}

/**
 * Get balance of an address
 */
export async function getBalance(address: string): Promise<string> {
  try {
    const balance = await getProvider().getBalance(address)
    return formatEther(balance)
  } catch (error) {
    console.error('Error getting balance:', error)
    return '0'
  }
}

/**
 * Transfer XL1 tokens between addresses
 */
export async function sendTransfer(
  from: XyoWallet,
  to: string,
  amount: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = getSigner(from)

    const tx = await signer.sendTransaction({
      to,
      value: parseEther(amount),
    })

    await tx.wait()

    return { success: true, txHash: tx.hash }
  } catch (error) {
    console.error('Transfer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed',
    }
  }
}

/**
 * Get transaction details
 */
export async function getTransaction(txHash: string) {
  try {
    return await getProvider().getTransaction(txHash)
  } catch (error) {
    console.error('Error getting transaction:', error)
    return null
  }
}

/**
 * Get block number
 */
export async function getBlockNumber(): Promise<number> {
  try {
    return await getProvider().getBlockNumber()
  } catch (error) {
    console.error('Error getting block number:', error)
    return 0
  }
}

/**
 * Check if the network is connected
 */
export async function isConnected(): Promise<boolean> {
  try {
    await getProvider().getNetwork()
    return true
  } catch {
    return false
  }
}

/**
 * XL1 Explorer URL for transaction
 */
export function getExplorerUrl(txHash: string): string {
  return `https://explorer.xyo.network/tx/${txHash}`
}

/**
 * XL1 Explorer URL for address
 */
export function getAddressExplorerUrl(address: string): string {
  return `https://explorer.xyo.network/address/${address}`
}
