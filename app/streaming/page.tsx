import { BarChart3, Clock, Play, Pause, RefreshCw, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"
import { KafkaTopicsTable } from "@/components/kafka-topics-table"
import { StreamingMetricsChart } from "@/components/streaming-metrics-chart"
import { StreamingEventsTable } from "@/components/streaming-events-table"
import { StreamProcessorStatus } from "@/components/stream-processor-status"

export default function StreamingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Real-time Data Streaming</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              <span>Start All</span>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Topics</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Per Second</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.8K</div>
              <p className="text-xs text-muted-foreground">+24% from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consumers</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">38</div>
              <p className="text-xs text-muted-foreground">+5 from last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Latency</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42ms</div>
              <p className="text-xs text-muted-foreground">-8ms from last hour</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="topics">Kafka Topics</TabsTrigger>
            <TabsTrigger value="processors">Stream Processors</TabsTrigger>
            <TabsTrigger value="events">Live Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Streaming Metrics</CardTitle>
                  <CardDescription>Real-time throughput and latency metrics</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <StreamingMetricsChart />
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Stream Processor Status</CardTitle>
                  <CardDescription>Current status of stream processing jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  <StreamProcessorStatus />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Top Kafka Topics</CardTitle>
                  <CardDescription>Topics with highest throughput</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["user-events", "transactions", "clickstream", "sensor-data", "notifications"].map((topic, i) => (
                      <div key={topic} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{topic}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{Math.floor(10000 / (i + 1))} msg/s</div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Topics
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Recent Events</CardTitle>
                  <CardDescription>Latest messages from high-priority topics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { topic: "alerts", message: "System CPU usage above 90%", time: "2 min ago" },
                      { topic: "user-events", message: "New user registration: user_id=12345", time: "5 min ago" },
                      { topic: "transactions", message: "Payment processed: txn_id=T-9876", time: "8 min ago" },
                      { topic: "errors", message: "API rate limit exceeded: service=auth", time: "12 min ago" },
                      { topic: "metrics", message: "Daily active users: 28,450 (+5.2%)", time: "15 min ago" },
                    ].map((event, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{event.topic}</div>
                          <div className="text-sm text-muted-foreground">{event.message}</div>
                        </div>
                        <div className="text-xs text-muted-foreground">{event.time}</div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      View All Events
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="topics">
            <Card>
              <CardHeader>
                <CardTitle>Kafka Topics</CardTitle>
                <CardDescription>Manage and monitor Kafka topics</CardDescription>
              </CardHeader>
              <CardContent>
                <KafkaTopicsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processors">
            <Card>
              <CardHeader>
                <CardTitle>Stream Processors</CardTitle>
                <CardDescription>Manage stream processing applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "User Activity Processor",
                      type: "Kafka Streams",
                      status: "running",
                      source: "user-events",
                      sink: "user-activity-aggregated",
                      instances: 3,
                    },
                    {
                      name: "Transaction Enrichment",
                      type: "Spark Streaming",
                      status: "running",
                      source: "transactions",
                      sink: "enriched-transactions",
                      instances: 5,
                    },
                    {
                      name: "Anomaly Detection",
                      type: "Flink",
                      status: "running",
                      source: "sensor-data",
                      sink: "anomalies",
                      instances: 2,
                    },
                    {
                      name: "Clickstream Analytics",
                      type: "Spark Streaming",
                      status: "stopped",
                      source: "clickstream",
                      sink: "user-insights",
                      instances: 0,
                    },
                    {
                      name: "Notification Router",
                      type: "Kafka Streams",
                      status: "running",
                      source: "notifications",
                      sink: "notification-channels",
                      instances: 2,
                    },
                  ].map((processor, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">{processor.name}</div>
                          <div className="text-sm text-muted-foreground">Type: {processor.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-1 rounded-full text-xs ${
                              processor.status === "running" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {processor.status}
                          </div>
                          <Button variant="outline" size="sm">
                            {processor.status === "running" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-sm font-medium">Source</div>
                          <div className="text-sm">{processor.source}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Sink</div>
                          <div className="text-sm">{processor.sink}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Instances</div>
                          <div className="text-sm">{processor.instances}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Live Events</CardTitle>
                <CardDescription>Real-time data flowing through Kafka topics</CardDescription>
              </CardHeader>
              <CardContent>
                <StreamingEventsTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

