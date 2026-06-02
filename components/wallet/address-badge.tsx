'use client'

import { Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AddressBadgeProps {
  address: string
  shortAddress?: string
  className?: string
  showExplorer?: boolean
}

export function AddressBadge({
  address,
  shortAddress,
  className,
  showExplorer = true,
}: AddressBadgeProps) {
  const [copied, setCopied] = useState(false)
  const displayAddress = shortAddress || `${address.slice(0, 6)}...${address.slice(-4)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const explorerUrl = `https://explorer.xyo.network/address/${address}`

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 font-mono text-sm',
        className
      )}
    >
      <span className="text-muted-foreground">{displayAddress}</span>
      <button
        onClick={handleCopy}
        className="text-muted-foreground transition-colors hover:text-primary"
        title="Copy address"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
      {showExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground transition-colors hover:text-primary"
          title="View on Explorer"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}
