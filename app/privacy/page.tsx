import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Github } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy & Legal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-semibold">About This Project</h2>
              <p className="text-muted-foreground">
                This is a community-driven project created by stickon2 to help Warhammer 40k Kill Team players track
                their games, view statistics, and compete with others. This website is provided free of charge for the
                community.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Data Collection & Privacy</h2>
              <p className="text-muted-foreground mb-3">
                We collect only the game data you voluntarily submit through the game submission form. This includes:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
                <li>Player names/tags</li>
                <li>Game scores and results</li>
                <li>Faction and killteam selections</li>
                <li>Game dates and locations</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                We do not collect personal information such as email addresses, IP addresses, or any identifying
                information beyond what you choose to submit. All data is stored securely and used solely for displaying
                statistics and leaderboards on this website.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Disclaimer</h2>
              <p className="text-muted-foreground">
                This website is an unofficial fan-made project and is not affiliated with, endorsed by, or sponsored by
                Games Workshop Limited. Warhammer 40,000, Kill Team, and all associated marks, names, characters,
                illustrations, and images are registered trademarks of Games Workshop Limited.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Open Source</h2>
              <p className="text-muted-foreground mb-3">
                This project is open source and available on GitHub. You can view the code, report issues, or contribute
                to the project:
              </p>
              <a
                href="https://github.com/Sven-SW-Barth/v0-warhammer-killteam-stats"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-semibold">Contact</h2>
              <p className="text-muted-foreground">
                If you have any questions, concerns, or feedback about this website, please feel free to open an issue
                on the GitHub repository or contact the maintainer through GitHub.
              </p>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
