import { createClient } from "@/lib/supabase/server"
import { StatsFilters } from "@/components/stats-filters"
import { StatsContentWrapper } from "@/components/stats-content-wrapper"

export default async function StatsPage() {
  const supabase = await createClient()

  const [{ data: countries }, { data: killzones }, { data: critops }] = await Promise.all([
    supabase.from("countries").select("id, name").order("name"),
    supabase.from("killzones").select("id, name").order("name"),
    supabase.from("critops").select("id, name").order("name"),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Global Statistics
          </h1>
          <p className="text-pretty text-sm text-muted-foreground sm:text-base">
            Comprehensive statistics from Kill Team battles around the world
          </p>
        </header>

        <StatsFilters countries={countries || []} killzones={killzones || []} critops={critops || []} />

        <StatsContentWrapper killzones={killzones || []} critops={critops || []} />
      </div>
    </div>
  )
}
