import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

type Game = {
  id: string
  player1_tacop_score: number
  player1_critop_score: number
  player1_killop_score: number
  player1_primary_op_score: number | null
  player2_tacop_score: number
  player2_critop_score: number
  player2_killop_score: number
  player2_primary_op_score: number | null
  created_at: string
  killzone: string | null
  player1_killteam: { name: string } | null
  player2_killteam: { name: string } | null
}

export function RecentGames({ games }: { games: Game[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Games</CardTitle>
        <CardDescription>Latest battles from the community</CardDescription>
      </CardHeader>
      <CardContent>
        {games.length > 0 ? (
          <div className="space-y-4">
            {games.map((game) => {
              const player1Total =
                game.player1_tacop_score +
                game.player1_critop_score +
                game.player1_killop_score +
                (game.player1_primary_op_score || 0)
              const player2Total =
                game.player2_tacop_score +
                game.player2_critop_score +
                game.player2_killop_score +
                (game.player2_primary_op_score || 0)

              const winner =
                player1Total > player2Total
                  ? game.player1_killteam?.name || "Unknown"
                  : player2Total > player1Total
                    ? game.player2_killteam?.name || "Unknown"
                    : "Draw"

              return (
                <div key={game.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-3">
                      <span className="font-medium">{game.player1_killteam?.name || "Unknown"}</span>
                      <div className="grid grid-cols-[4rem_auto_4rem] items-center gap-3">
                        <span className="text-right text-2xl font-bold tabular-nums text-primary">{player1Total}</span>
                        <span className="text-center text-muted-foreground">vs</span>
                        <span className="text-left text-2xl font-bold tabular-nums text-primary">{player2Total}</span>
                      </div>
                      <span className="font-medium">{game.player2_killteam?.name || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {winner !== "Draw" && <span>Winner: {winner}</span>}
                      {winner === "Draw" && <span>Draw</span>}
                      {game.killzone && (
                        <>
                          <span>•</span>
                          <span>{game.killzone}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(game.created_at), { addSuffix: true })}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            No games recorded yet. Be the first to add a game!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
