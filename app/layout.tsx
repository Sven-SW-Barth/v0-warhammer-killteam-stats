import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Suspense } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BackToTopButton } from "@/components/back-to-top-button"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "KT Open Play",
  description: "Track Warhammer 40k Kill Team battles and view global statistics",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "32x32" },
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable} flex min-h-screen flex-col`}>
        <Navigation />
        <main className="flex-1">
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
        <Footer />
        <BackToTopButton />
      </body>
    </html>
  )
}
