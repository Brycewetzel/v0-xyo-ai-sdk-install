// API route: GET /api/wallet
// Returns wallet addresses and balances for human and bot

import { NextResponse } from 'next/server'
import { getWalletsFromMnemonic, shortenAddress } from '@/lib/xyo/wallet'
import { getBalance } from '@/lib/xyo/client'

export async function GET() {
  try {
    const mnemonic = process.env.MNEMONIC

    if (!mnemonic || mnemonic.includes('word1')) {
      // Return demo mode with placeholder data
      return NextResponse.json({
        demo: true,
        human: {
          address: '0x0000000000000000000000000000000000000001',
          shortAddress: '0x0000...0001',
          balance: '0.0000',
        },
        bot: {
          address: '0x0000000000000000000000000000000000000002',
          shortAddress: '0x0000...0002',
          balance: '0.0000',
        },
        message: 'Demo mode - configure MNEMONIC in .env.local for real wallets',
      })
    }

    const wallets = getWalletsFromMnemonic(mnemonic)

    // Fetch balances in parallel
    const [humanBalance, botBalance] = await Promise.all([
      getBalance(wallets.human.address),
      getBalance(wallets.bot.address),
    ])

    return NextResponse.json({
      demo: false,
      human: {
        address: wallets.human.address,
        shortAddress: shortenAddress(wallets.human.address),
        balance: humanBalance,
      },
      bot: {
        address: wallets.bot.address,
        shortAddress: shortenAddress(wallets.bot.address),
        balance: botBalance,
      },
    })
  } catch (error) {
    console.error('Wallet API error:', error)
    return NextResponse.json(
      { error: 'Failed to get wallet info' },
      { status: 500 }
    )
  }
}
