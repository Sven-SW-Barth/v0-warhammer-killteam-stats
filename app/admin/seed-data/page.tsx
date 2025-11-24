"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { seedMockData } from "./actions"

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await seedMockData()
      setResult(res)
    } catch (error) {
      setResult({ error: "Failed to seed data" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Seed Mock Data</CardTitle>
          <CardDescription>Insert mock game data into the database for testing and development</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSeed} disabled={loading} size="lg">
            {loading ? "Inserting Mock Data..." : "Insert Mock Data"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg ${result.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
            >
              {result.message || result.error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
