"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Sample data for data sources
const data = [
  { name: "Databases", value: 35 },
  { name: "APIs", value: 25 },
  { name: "File Uploads", value: 20 },
  { name: "Streaming", value: 15 },
  { name: "IoT Devices", value: 5 },
]

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899"]

export function DataSourcesChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
