"use client"

import { useState } from "react"
import { PlayerDetailsModal } from "./player-details-modal"
import { PuritySealIcon } from "./purity-seal-icon"

interface PlayerNameButtonProps {
  playerId: string
  playerName: string
  className?: string
  isSupporter?: boolean
}

export function PlayerNameButton({ playerId, playerName, className, isSupporter }: PlayerNameButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`cursor-pointer hover:text-primary hover:underline transition-colors inline-flex items-center gap-1.5 ${className || ""}`}
      >
        {playerName}
        {isSupporter && <PuritySealIcon className="h-4 w-4" />}
      </button>
      <PlayerDetailsModal playerId={playerId} playerName={playerName} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
