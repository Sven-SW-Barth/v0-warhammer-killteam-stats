import Link from "next/link"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by stickon2 for the community
        </p>
        <div className="mt-2">
          <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Privacy & Legal
          </Link>
        </div>
      </div>
    </footer>
  )
}
