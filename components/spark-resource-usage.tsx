"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample data for resource usage
const cpuUsageData = [
  { time: "00:00", "prod-cluster-1": 65, "prod-cluster-2": 40, "stream-cluster-1": 85, "ml-cluster-1": 75 },
  { time: "01:00", "prod-cluster-1": 68, "prod-cluster-2": 42, "stream-cluster-1": 88, "ml-cluster-1": 78 },
  { time: "02:00", "prod-cluster-1": 62, "prod-cluster-2": 38, "stream-cluster-1": 90, "ml-cluster-1": 72 },
  { time: "03:00", "prod-cluster-1": 70, "prod-cluster-2": 45, "stream-cluster-1": 92, "ml-cluster-1": 80 },
  { time: "04:00", "prod-cluster-1": 72, "prod-cluster-2": 48, "stream-cluster-1": 91, "ml-cluster-1": 82 },
  { time: "05:00", "prod-cluster-1": 75, "prod-cluster-2": 50, "stream-cluster-1": 89, "ml-cluster-1": 85 },
  { time: "06:00", "prod-cluster-1": 80, "prod-cluster-2": 55, "stream-cluster-1": 87, "ml-cluster-1": 88 },
  { time: "07:00", "prod-cluster-1": 85, "prod-cluster-2": 60, "stream-cluster-1": 90, "ml-cluster-1": 90 },
  { time: "08:00", "prod-cluster-1": 78, "prod-cluster-2": 45, "stream-cluster-1": 92, "ml-cluster-1": 82 },
]

const memoryUsageData = [
  { time: "00:00", "prod-cluster-1": 55, "prod-cluster-2": 48, "stream-cluster-1": 80, "ml-cluster-1": 70 },
  { time: "01:00", "prod-cluster-1": 58, "prod-cluster-2": 50, "stream-cluster-1": 82, "ml-cluster-1": 72 },
  { time: "02:00", "prod-cluster-1": 60, "prod-cluster-2": 52, "stream-cluster-1": 85, "ml-cluster-1": 75 },
  { time: "03:00", "prod-cluster-1": 62, "prod-cluster-2": 54, "stream-cluster-1": 88, "ml-cluster-1": 78 },
  { time: "04:00", "prod-cluster-1": 65, "prod-cluster-2": 56, "stream-cluster-1": 90, "ml-cluster-1": 80 },
  { time: "05:00", "prod-cluster-1": 68, "prod-cluster-2": 58, "stream-cluster-1": 88, "ml-cluster-1": 82 },
  { time: "06:00", "prod-cluster-1": 70, "prod-cluster-2": 60, "stream-cluster-1": 85, "ml-cluster-1": 85 },
  { time: "07:00", "prod-cluster-1": 72, "prod-cluster-2": 62, "stream-cluster-1": 82, "ml-cluster-1": 88 },
  { time: "08:00", "prod-cluster-1": 65, "prod-cluster-2": 52, "stream-cluster-1": 88, "ml-cluster-1": 75 },
]

const jobsData = [
  { time: "00:00", completed: 12, running: 8, failed: 1 },
  { time: "01:00", completed: 15, running: 7, failed: 0 },
  { time: "02:00", completed: 18, running: 9, failed: 2 },
  { time: "03:00", completed: 22, running: 10, failed: 1 },
  { time: "04:00", completed: 25, running: 8, failed: 0 },
  { time: "05:00", completed: 28, running: 9, failed: 1 },
  { time: "06:00", completed: 32, running: 12, failed: 2 },
  { time: "07:00", completed: 35, running: 10, failed: 1 },
  { time: "08:00", completed: 38, running: 12, failed: 0 },
]

const dataProcessedData = [
  { time: "00:00", "prod-cluster-1": 0.8, "prod-cluster-2": 0.5, "stream-cluster-1": 0.3, "ml-cluster-1": 0.2 },
  { time: "01:00", "prod-cluster-1": 0.9, "prod-cluster-2": 0.6, "stream-cluster-1": 0.4, "ml-cluster-1": 0.3 },
  { time: "02:00", "prod-cluster-1": 1.1, "prod-cluster-2": 0.7, "stream-cluster-1": 0.5, "ml-cluster-1": 0.4 },
  { time: "03:00", "prod-cluster-1": 1.3, "prod-cluster-2": 0.8, "stream-cluster-1": 0.6, "ml-cluster-1": 0.5 },
  { time: "04:00", "prod-cluster-1": 1.5, "prod-cluster-2": 0.9, "stream-cluster-1": 0.7, "ml-cluster-1": 0.6 },
  { time: "05:00", "prod-cluster-1": 1.7, "prod-cluster-2": 1.0, "stream-cluster-1": 0.8, "ml-cluster-1": 0.7 },
  { time: "06:00", "prod-cluster-1": 1.9, "prod-cluster-2": 1.1, "stream-cluster-1": 0.9, "ml-cluster-1": 0.8 },
  { time: "07:00", "prod-cluster-1": 2.1, "prod-cluster-2": 1.2, "stream-cluster-1": 1.0, "ml-cluster-1": 0.9 },
  { time: "08:00", "prod-cluster-1": 2.3, "prod-cluster-2": 1.3, "stream-cluster-1": 1.1, "ml-cluster-1": 1.0 },
]

export function SparkResourceUsage() {
  const [timeRange, setTimeRange] = useState("8h")

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="8h">Last 8 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="cpu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cpu">CPU Usage</TabsTrigger>
          <TabsTrigger value="memory">Memory Usage</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="data">Data Processed</TabsTrigger>
        </TabsList>

        <TabsContent value="cpu">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={cpuUsageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "CPU Usage (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value}%`, "CPU Usage"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-1"
                      name="Production Cluster 1"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-2"
                      name="Production Cluster 2"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="stream-cluster-1"
                      name="Streaming Cluster"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line type="monotone" dataKey="ml-cluster-1" name="ML Cluster" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={memoryUsageData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "Memory Usage (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value}%`, "Memory Usage"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-1"
                      name="Production Cluster 1"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-2"
                      name="Production Cluster 2"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="stream-cluster-1"
                      name="Streaming Cluster"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line type="monotone" dataKey="ml-cluster-1" name="ML Cluster" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={jobsData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "Number of Jobs", angle: -90, position: "insideLeft" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed Jobs" fill="#10b981" />
                    <Bar dataKey="running" name="Running Jobs" fill="#3b82f6" />
                    <Bar dataKey="failed" name="Failed Jobs" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardContent className="pt-6">
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dataProcessedData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis label={{ value: "Data Processed (TB)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value} TB`, "Data Processed"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-1"
                      name="Production Cluster 1"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="prod-cluster-2"
                      name="Production Cluster 2"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="stream-cluster-1"
                      name="Streaming Cluster"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line type="monotone" dataKey="ml-cluster-1" name="ML Cluster" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

