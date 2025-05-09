"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Generate sample data for the last 30 days
const generateData = () => {
  const data = []
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    // Generate random values with an upward trend
    const baseValue = 30 + Math.random() * 10
    const trendFactor = 1 + (30 - i) * 0.03

    data.push({
      date: date.toISOString().split("T")[0],
      volume: Math.round(baseValue * trendFactor * 10) / 10,
      throughput: Math.round((baseValue * 0.8 * trendFactor + Math.random() * 5) * 10) / 10,
    })
  }

  return data
}

const data = generateData()

export function RealtimeDataChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => {
              const date = new Date(value)
              return `${date.getDate()}/${date.getMonth() + 1}`
            }}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => `Date: ${value}`}
            formatter={(value, name) => {
              return [`${value} TB`, name === "volume" ? "Processing Volume" : "Processing Throughput"]
            }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            name="Processing Volume"
            stroke="#3b82f6"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line type="monotone" dataKey="throughput" name="Processing Throughput" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

