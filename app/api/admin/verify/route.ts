import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Check against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

    if (password === adminPassword) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
  }
}
