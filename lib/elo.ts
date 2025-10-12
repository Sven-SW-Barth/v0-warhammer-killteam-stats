/**
 * Calculate new Elo ratings for two players after a game
 * @param player1Elo Current Elo rating of player 1
 * @param player2Elo Current Elo rating of player 2
 * @param player1Games Total games played by player 1
 * @param player2Games Total games played by player 2
 * @param player1Score Game result for player 1 (1 = win, 0.5 = draw, 0 = loss)
 * @returns Object with new Elo ratings for both players
 */
export function calculateElo(
  player1Elo: number,
  player2Elo: number,
  player1Games: number,
  player2Games: number,
  player1Score: number,
): {
  player1NewElo: number
  player2NewElo: number
} {
  // Adaptive K-factor based on games played
  const getKFactor = (gamesPlayed: number): number => {
    if (gamesPlayed < 20) return 32
    if (gamesPlayed < 50) return 24
    return 16
  }

  const k1 = getKFactor(player1Games)
  const k2 = getKFactor(player2Games)

  // Expected scores
  const expectedPlayer1 = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400))
  const expectedPlayer2 = 1 / (1 + Math.pow(10, (player1Elo - player2Elo) / 400))

  const player2Score = 1 - player1Score

  // Calculate new ratings
  const player1NewElo = Math.round(player1Elo + k1 * (player1Score - expectedPlayer1))
  const player2NewElo = Math.round(player2Elo + k2 * (player2Score - expectedPlayer2))

  return {
    player1NewElo,
    player2NewElo,
  }
}

/**
 * Determine game result from scores
 * @param player1TotalScore Total score for player 1
 * @param player2TotalScore Total score for player 2
 * @returns Score value for player 1 (1 = win, 0.5 = draw, 0 = loss)
 */
export function getGameResult(player1TotalScore: number, player2TotalScore: number): number {
  if (player1TotalScore > player2TotalScore) return 1
  if (player1TotalScore < player2TotalScore) return 0
  return 0.5
}
