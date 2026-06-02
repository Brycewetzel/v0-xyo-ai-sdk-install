import { Suspense } from 'react'
import { GameBoard } from '@/components/game/game-board'
import { WalletCard } from '@/components/wallet/wallet-card'
import { Hexagon, Github, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

async function getWalletData() {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const res = await fetch(`${baseUrl}/api/wallet`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch {
    return null
  }
}

function WalletsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl bg-card/50 border border-border/50"
        />
      ))}
    </div>
  )
}

async function WalletsSection() {
  const walletData = await getWalletData()

  if (!walletData) {
    return (
      <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-center">
        <p className="text-sm text-destructive">
          Failed to load wallet data. Please refresh the page.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <WalletCard
        type="human"
        address={walletData.human.address}
        shortAddress={walletData.human.shortAddress}
        balance={walletData.human.balance}
        isDemo={walletData.demo}
      />
      <WalletCard
        type="bot"
        address={walletData.bot.address}
        shortAddress={walletData.bot.shortAddress}
        balance={walletData.bot.balance}
        isDemo={walletData.demo}
      />
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Hexagon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">XYO Prediction Market</h1>
              <p className="text-xs text-muted-foreground">
                Commit-Reveal Game on XL1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://docs.xyo.network"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                Docs
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/XYOracleNetwork"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Wallets */}
          <section>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Wallets
            </h2>
            <Suspense fallback={<WalletsSkeleton />}>
              <WalletsSection />
            </Suspense>
          </section>

          {/* Game */}
          <section>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Game
            </h2>
            <GameBoard />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>
              Built on{' '}
              <a
                href="https://xyo.network"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                XYO Layer One
              </a>{' '}
              (Sequence Testnet)
            </p>
            <p className="text-xs">
              Provably fair gaming powered by commit-reveal cryptography
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
