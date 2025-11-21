import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      return NextResponse.json({ authenticated: true }, { status: 200 })
    }
    return NextResponse.json({ authenticated: false }, { status: 401 })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
