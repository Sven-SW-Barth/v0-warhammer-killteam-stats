import { GameEntryForm } from "@/components/game-entry-form"
import { createClient } from "@/lib/supabase/server"

export default async function SubmitPage() {
  const supabase = await createClient()

  const [{ data: countries }, { data: killzones }, { data: critops }, { data: tacops }, { data: killteams }] =
    await Promise.all([
      supabase.from("countries").select("*").order("name"),
      supabase.from("killzones").select("*").order("name"),
      supabase.from("critops").select("*").order("name"),
      supabase.from("tacops").select("*").order("archetype, name"),
      supabase.from("killteams").select("*").order("name"),
    ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <header className="mb-8 text-center sm:mb-12">
          <h1 className="mb-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:mb-3 sm:text-4xl">
            Submit Game Results
          </h1>
          <p className="text-pretty text-base text-muted-foreground sm:text-lg">
            Record your Kill Team battle and contribute to the global statistics
          </p>
        </header>

        <div className="mx-auto max-w-6xl">
          <GameEntryForm
            data={{
              countries: countries || [],
              killzones: killzones || [],
              critops: critops || [],
              tacops: tacops || [],
              killteams: killteams || [],
            }}
          />
        </div>
      </div>
    </div>
  )
}
