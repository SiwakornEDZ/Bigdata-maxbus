"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Generate sample data for streaming metrics
const generateInitialData = () => {
  const data = []
  const now = new Date()

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 10000) // 10 second intervals

    data.push({
      time: time.toISOString(),
      throughput: 8000 + Math.random() * 4000, // 8-12k messages per second
      latency: 30 + Math.random() * 30, // 30-60ms latency
    })
  }

  return data
}

export function StreamingMetricsChart() {
  const [data, setData] = useState(generateInitialData())

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)]
        const lastTime = new Date(prevData[prevData.length - 1].time)
        const newTime = new Date(lastTime.getTime() + 10000) // 10 seconds later

        newData.push({
          time: newTime.toISOString(),
          throughput: 8000 + Math.random() * 4000,
          latency: 30 + Math.random() * 30,
        })

        return newData
      })
    }, 2000) // Update every 2 seconds

    return () => clearInterval(interval)
  }, [])

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
            dataKey="time"
            tickFormatter={(time) => {
              const date = new Date(time)
              return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
            }}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
          <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
          <Tooltip
            labelFormatter={(time) => {
              const date = new Date(time)
              return `Time: ${date.toLocaleTimeString()}`
            }}
            formatter={(value, name) => {
              if (name === "throughput") return [`${Math.round(value)} msg/s`, "Throughput"]
              if (name === "latency") return [`${Math.round(value)} ms`, "Latency"]
              return [value, name]
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="throughput"
            name="Throughput"
            stroke="#3b82f6"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line yAxisId="right" type="monotone" dataKey="latency" name="Latency" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

