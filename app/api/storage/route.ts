import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const storageMetrics = await sql`
      SELECT * FROM storage_metrics
    `

    if (storageMetrics.length === 0) {
      return NextResponse.json({ error: "No storage metrics found" }, { status: 404 })
    }

    // Calculate total space and used space
    let totalSpace = 0
    let usedSpace = 0

    storageMetrics.forEach((metric: any) => {
      totalSpace += Number(metric.total_space)
      usedSpace += Number(metric.used_space)
    })

    const availableSpace = totalSpace - usedSpace
    const usagePercentage = Math.round((usedSpace / totalSpace) * 100)

    return NextResponse.json({
      totalSpace,
      usedSpace,
      availableSpace,
      usagePercentage,
    })
  } catch (error) {
    console.error("Error fetching storage metrics:", error)
    return NextResponse.json({ error: "Failed to fetch storage metrics" }, { status: 500 })
  }
}
