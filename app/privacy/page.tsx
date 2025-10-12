export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <h1 className="mb-6 text-4xl font-bold text-foreground">Privacy Policy</h1>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Introduction</h2>
          <p>
            KT Open Play is committed to protecting your privacy. This policy explains what data we collect, how we use
            it, and your rights regarding your information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Data We Collect</h2>
          <p className="mb-2">When you use KT Open Play, we collect the following information:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Player Tags</strong>: Your chosen username/playertag for identification
            </li>
            <li>
              <strong>Game Statistics</strong>: Match results, scores, factions used, and game dates
            </li>
            <li>
              <strong>Country/Region</strong>: Optional location information for regional statistics
            </li>
            <li>
              <strong>Elo Ratings</strong>: Calculated skill ratings based on game performance
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">What We Don't Collect</h2>
          <p className="mb-2">We do NOT collect:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Email addresses</li>
            <li>Real names</li>
            <li>Payment information</li>
            <li>IP addresses (beyond standard server logs)</li>
            <li>Personal contact information</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">How We Use Your Data</h2>
          <p className="mb-2">Your data is used exclusively for:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Displaying game statistics and leaderboards</li>
            <li>Calculating Elo ratings and rankings</li>
            <li>Providing match history and player profiles</li>
            <li>Generating aggregate statistics about the Kill Team community</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Data Storage</h2>
          <p>
            All data is stored securely in a Supabase (PostgreSQL) database with industry-standard encryption. We do not
            sell, rent, or share your data with third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Request deletion of your player data</li>
            <li>Request a copy of your stored data</li>
            <li>Correct inaccurate information</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, please contact us through GitHub issues or the contact information provided in the
            repository.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Open Source</h2>
          <p>
            KT Open Play is open source software. You can review our code, data handling practices, and security
            measures on GitHub. This transparency ensures you can verify how your data is handled.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Any changes will be posted on this page with an updated
            revision date.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold text-foreground">Contact</h2>
          <p>
            If you have questions about this privacy policy or your data, please open an issue on our GitHub repository.
          </p>
        </section>

        <div className="mt-8 border-t border-border pt-6 text-sm">
          <p>Last updated: January 2025</p>
        </div>
      </div>
    </div>
  )
}
