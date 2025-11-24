import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Github } from "lucide-react"
import { PuritySealIcon } from "@/components/purity-seal-icon"

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
              <h2 className="mb-3 text-xl font-semibold">Non-Commercial Use & Funding</h2>
              <p className="text-muted-foreground mb-3">
                This web application is operated on a strictly non-commercial basis. The sole purpose of accepting
                donations is to cover the operational costs of hosting and maintaining this service for the community.
              </p>
              <p className="text-muted-foreground mb-3">
                To help cover these costs, a Ko-fi page has been established. All donations received are used
                exclusively to pay for the running costs of the Vercel Pro Account (€20/month), which provides the
                following functionalities necessary for this application:
              </p>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground mb-3">
                <li>1 TB of Fast Data Transfer per month</li>
                <li>10,000,000 Edge Requests included monthly</li>
                <li>Faster builds with no queues for improved deployment speed</li>
                <li>Cold start prevention for better application performance</li>
                <li>Advanced spend management and usage monitoring</li>
                <li>Enhanced reliability and uptime for community access</li>
              </ul>
              <p className="text-muted-foreground mb-3">
                As a token of appreciation, all donors are recognized with a supporter badge{" "}
                <span className="inline-flex items-center gap-1">
                  <PuritySealIcon className="h-4 w-4" />
                </span>{" "}
                displayed next to their player name throughout the application.
              </p>
              <p className="text-muted-foreground mb-4">
                Any excess funds beyond operational costs will be saved for future hosting expenses or potential service
                improvements. Full transparency regarding donation usage is maintained.
              </p>
              <a
                href="https://ko-fi.com/H2H01OZZ9S"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-[#FF5E5B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#FF5E5B]/90"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
                </svg>
                Support on Ko-fi
              </a>
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
                on the GitHub repository or contact the maintainer through GitHub or write me a message on discord:
                stickon2
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
