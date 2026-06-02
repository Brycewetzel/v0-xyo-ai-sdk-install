'use client'

import { Shield, Eye, Lock, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

interface ProvablyFairPanelProps {
  className?: string
}

export function ProvablyFairPanel({ className }: ProvablyFairPanelProps) {
  return (
    <Card className={cn('border-border/50 bg-card/50 backdrop-blur-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Provably Fair
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="how-it-works" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                How does it work?
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-3">
              <p>
                This game uses a <strong>commit-reveal scheme</strong> to ensure
                fairness. Neither player can see the other&apos;s guess until both
                have committed.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                    1
                  </div>
                  <p>Both players choose a guess and create a commitment hash</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                    2
                  </div>
                  <p>Commitments are submitted to the blockchain</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                    3
                  </div>
                  <p>Both players reveal their guesses</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                    4
                  </div>
                  <p>Reveals are verified against commitments</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="commit-phase" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Commit Phase
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <p>
                During the commit phase, your guess is combined with a random secret
                to create a hash. This hash is submitted publicly, but nobody can
                determine your actual guess from it.
              </p>
              <code className="mt-2 block rounded bg-secondary/50 p-2 text-xs font-mono">
                commitment = hash(guess + secret + roundId)
              </code>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="reveal-phase" className="border-border/50">
            <AccordionTrigger className="text-sm hover:no-underline">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-warning" />
                Reveal Phase
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">
              <p>
                In the reveal phase, you submit your original guess and secret. The
                system verifies that your reveal matches your earlier commitment.
                This prevents players from changing their guess after seeing the
                opponent&apos;s choice.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
