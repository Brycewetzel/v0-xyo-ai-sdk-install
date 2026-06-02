'use client'

import { Wallet, User, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressBadge } from './address-badge'
import { cn } from '@/lib/utils'

interface WalletCardProps {
  type: 'human' | 'bot'
  address: string
  shortAddress: string
  balance: string
  isDemo?: boolean
  className?: string
}

export function WalletCard({
  type,
  address,
  shortAddress,
  balance,
  isDemo,
  className,
}: WalletCardProps) {
  const isHuman = type === 'human'

  return (
    <Card
      className={cn(
        'relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm',
        isHuman ? 'border-l-2 border-l-primary' : 'border-l-2 border-l-chart-2',
        className
      )}
    >
      {/* Glow effect */}
      <div
        className={cn(
          'absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl',
          isHuman ? 'bg-primary' : 'bg-chart-2'
        )}
      />

      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isHuman ? 'bg-primary/10' : 'bg-chart-2/10'
          )}
        >
          {isHuman ? (
            <User className="h-5 w-5 text-primary" />
          ) : (
            <Bot className="h-5 w-5 text-chart-2" />
          )}
        </div>
        <div>
          <CardTitle className="text-base font-medium">
            {isHuman ? 'Your Wallet' : 'Bot Wallet'}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {isHuman ? 'Player Account' : 'Opponent Account'}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <AddressBadge
          address={address}
          shortAddress={shortAddress}
          className="w-full justify-center"
        />

        <div className="flex items-baseline justify-between rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">Balance</span>
          <div className="flex items-baseline gap-1.5">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-lg font-semibold">
              {parseFloat(balance).toFixed(4)}
            </span>
            <span className="text-xs text-muted-foreground">XL1</span>
          </div>
        </div>

        {isDemo && (
          <p className="text-center text-xs text-warning">
            Demo mode - configure MNEMONIC for real wallets
          </p>
        )}
      </CardContent>
    </Card>
  )
}
