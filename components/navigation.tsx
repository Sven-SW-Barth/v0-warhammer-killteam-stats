"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skull, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-black to-primary">
              <Skull className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-xl font-bold text-foreground">KT Open Play</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-1">
              <Link
                href="/stats"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Statistics
              </Link>
              <Link
                href="/matchlog"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Matchlog
              </Link>
              <Link
                href="/leaderboards"
                className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Leaderboards
              </Link>
            </div>
            <Button asChild>
              <Link href="/submit">Submit Game</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Link
                href="/stats"
                className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Statistics
              </Link>
              <Link
                href="/matchlog"
                className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Matchlog
              </Link>
              <Link
                href="/leaderboards"
                className="rounded-md px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leaderboards
              </Link>
              <Button asChild className="mt-2">
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)}>
                  Submit Game
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
