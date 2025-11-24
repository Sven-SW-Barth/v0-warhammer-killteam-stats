"use client"

import { Coffee } from "lucide-react"

export function KofiButton() {
  return (
    <a
      href="https://ko-fi.com/H2H01OZZ9S"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-md bg-[#CF6139] px-6 py-3 text-base font-semibold text-white transition-all hover:bg-[#B8532F] hover:shadow-lg"
    >
      <Coffee className="h-5 w-5" />
      Support this project on Ko-fi
    </a>
  )
}
