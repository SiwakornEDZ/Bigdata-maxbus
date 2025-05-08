"use client"

import { useState } from "react"
import { Check, Database, Globe, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DataSourceConnector() {
  const [connectionType, setConnectionType] = useState("database")
  const [testStatus, setTestStatus] = useState<null | "success" | "error">(null)

  const handleTestConnection = () => {
    // Simulate connection test
    setTestStatus("success")
  }

  return (
    <Tabs defaultValue="database" onValueChange={setConnectionType} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="database" className="flex items-center gap-2">
          <Database className="h-4 w-4" />
          <span>Database</span>
        </TabsTrigger>
        <TabsTrigger value="api" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>API</span>
        </TabsTrigger>
        <TabsTrigger value="streaming" className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          <span>Streaming</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="database" className="space-y-6">
        <div className="space-y-2">
          <Label>Database Type</Label>
          <RadioGroup defaultValue="sql" className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">SQL Database</CardTitle>
                <CardDescription>MySQL, PostgreSQL, SQL Server, Oracle</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroupItem value="sql" id="sql" className="absolute top-4 right-4" />
              </CardContent>
            </Card>
            <Card className="cursor-pointer relative">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">NoSQL Database</CardTitle>
                <CardDescription>MongoDB, Cassandra, Redis, DynamoDB</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroupItem value="nosql" id="nosql" className="absolute top-4 right-4" />
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="db-type">Database</Label>
              <Select defaultValue="postgresql">
                <SelectTrigger id="db-type">
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="sqlserver">SQL Server</SelectItem>
                  <SelectItem value="oracle">Oracle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input id="connection-name" placeholder="My Database Connection" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="host">Host</Label>
              <Input id="host" placeholder="localhost or IP address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" placeholder="5432" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="database">Database Name</Label>
              <Input id="database" placeholder="database_name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schema">Schema</Label>
              <Input id="schema" placeholder="public" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="username" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>

            {testStatus === "success" && (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="h-4 w-4" />
                <span>Connection successful</span>
              </div>
            )}

            {testStatus === "error" && (
              <div className="flex items-center gap-2 text-red-500">
                <span>Connection failed</span>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="api" className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api-name">API Name</Label>
              <Input id="api-name" placeholder="My API Connection" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-type">API Type</Label>
              <Select defaultValue="rest">
                <SelectTrigger id="api-type">
                  <SelectValue placeholder="Select API type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rest">REST API</SelectItem>
                  <SelectItem value="graphql">GraphQL</SelectItem>
                  <SelectItem value="soap">SOAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-url">API URL</Label>
            <Input id="api-url" placeholder="https://api.example.com/data" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-type">Authentication Type</Label>
            <Select defaultValue="none">
              <SelectTrigger id="auth-type">
                <SelectValue placeholder="Select authentication type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Authentication</SelectItem>
                <SelectItem value="basic">Basic Auth</SelectItem>
                <SelectItem value="bearer">Bearer Token</SelectItem>
                <SelectItem value="apikey">API Key</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username-api">Username</Label>
              <Input id="username-api" placeholder="username" disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password-api">Password</Label>
              <Input id="password-api" type="password" placeholder="••••••••" disabled />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="streaming" className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stream-name">Stream Name</Label>
              <Input id="stream-name" placeholder="My Streaming Connection" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream-type">Stream Type</Label>
              <Select defaultValue="kafka">
                <SelectTrigger id="stream-type">
                  <SelectValue placeholder="Select stream type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kafka">Apache Kafka</SelectItem>
                  <SelectItem value="kinesis">AWS Kinesis</SelectItem>
                  <SelectItem value="pubsub">Google Pub/Sub</SelectItem>
                  <SelectItem value="eventhub">Azure Event Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bootstrap-servers">Bootstrap Servers</Label>
              <Input id="bootstrap-servers" placeholder="localhost:9092" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Stream</Label>
              <Input id="topic" placeholder="my-topic" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="security-protocol">Security Protocol</Label>
            <Select defaultValue="plaintext">
              <SelectTrigger id="security-protocol">
                <SelectValue placeholder="Select security protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plaintext">PLAINTEXT</SelectItem>
                <SelectItem value="ssl">SSL</SelectItem>
                <SelectItem value="sasl_plaintext">SASL_PLAINTEXT</SelectItem>
                <SelectItem value="sasl_ssl">SASL_SSL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleTestConnection}>
              Test Connection
            </Button>
          </div>
        </div>
      </TabsContent>

      <Button className="w-full mt-6" disabled={connectionType !== "database"}>
        Connect and Import Data
      </Button>
    </Tabs>
  )
}
