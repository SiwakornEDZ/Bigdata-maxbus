"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// Sample data for key metrics
const data = [
  {
    name: "Data Quality",
    current: 97,
    previous: 92,
  },
  {
    name: "Processing Time",
    current: 85,
    previous: 78,
  },
  {
    name: "Storage Efficiency",
    current: 92,
    previous: 88,
  },
  {
    name: "Query Performance",
    current: 88,
    previous: 75,
  },
  {
    name: "System Uptime",
    current: 99.9,
    previous: 99.7,
  },
]

export function DataMetrics() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value}%`, ""]} labelFormatter={(label) => `Metric: ${label}`} />
          <Legend />
          <Bar name="Current Month" dataKey="current" fill="#3b82f6" />
          <Bar name="Previous Month" dataKey="previous" fill="#94a3b8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

