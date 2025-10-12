"use client"

import { useState } from "react"
import { PlayerDetailsModal } from "./player-details-modal"

interface PlayerNameButtonProps {
  playerId: string
  playerName: string
  className?: string
}

export function PlayerNameButton({ playerId, playerName, className }: PlayerNameButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`cursor-pointer hover:text-primary hover:underline transition-colors ${className || ""}`}
      >
        {playerName}
      </button>
      <PlayerDetailsModal playerId={playerId} playerName={playerName} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
