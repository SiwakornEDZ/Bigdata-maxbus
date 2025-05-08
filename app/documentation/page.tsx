import Link from "next/link"
import { ArrowLeft, BookOpen, Code, Server, Settings, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function DocumentationPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Documentation</h1>
        </div>
        <p className="text-muted-foreground">
          Welcome to the Enterprise Data Platform documentation. Here you'll find information about how to use the
          platform and its features.
        </p>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data-import">Data Import</TabsTrigger>
            <TabsTrigger value="query-builder">Query Builder</TabsTrigger>
            <TabsTrigger value="streaming">Kafka Streaming</TabsTrigger>
            <TabsTrigger value="spark">Spark Processing</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enterprise Data Platform Overview</CardTitle>
                <CardDescription>A comprehensive platform for big data management and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Introduction</h3>
                  <p>
                    The Enterprise Data Platform is a comprehensive solution for managing, processing, and analyzing big
                    data across your organization. It provides a unified interface for data engineers, data scientists,
                    and business analysts to work with data from various sources.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Key Features</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Data Import:</strong> Import data from various sources including files, databases, APIs,
                      and streaming platforms.
                    </li>
                    <li>
                      <strong>Visual Query Builder:</strong> Build and execute SQL queries using a visual interface
                      without writing code.
                    </li>
                    <li>
                      <strong>Kafka Streaming:</strong> Manage and monitor Kafka topics and streaming data in real-time.
                    </li>
                    <li>
                      <strong>Spark Processing:</strong> Run and monitor Spark jobs for distributed data processing.
                    </li>
                    <li>
                      <strong>Data Visualization:</strong> Create interactive dashboards and reports from your data.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">System Architecture</h3>
                  <p>
                    The platform is built on a modern, scalable architecture that integrates with popular big data
                    technologies:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Frontend:</strong> Next.js React application with server-side rendering for optimal
                      performance.
                    </li>
                    <li>
                      <strong>Backend:</strong> Node.js API services with PostgreSQL database for metadata storage.
                    </li>
                    <li>
                      <strong>Data Processing:</strong> Apache Spark for batch and stream processing of large datasets.
                    </li>
                    <li>
                      <strong>Streaming:</strong> Apache Kafka for real-time data streaming and event processing.
                    </li>
                    <li>
                      <strong>Storage:</strong> Support for various storage solutions including data lakes, data
                      warehouses, and object storage.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Getting Started</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    Learn how to set up your account, configure your environment, and start using the platform.
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/documentation?tab=overview&section=getting-started"
                      className="text-sm font-medium text-primary"
                    >
                      Read more
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">User Management</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">Learn how to manage users, roles, and permissions within the platform.</div>
                  <div className="mt-4">
                    <Link
                      href="/documentation?tab=overview&section=user-management"
                      className="text-sm font-medium text-primary"
                    >
                      Read more
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    Understand the security features and best practices for protecting your data.
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/documentation?tab=overview&section=security"
                      className="text-sm font-medium text-primary"
                    >
                      Read more
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data-import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Import</CardTitle>
                <CardDescription>Import data from various sources into the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>
                    The Data Import feature allows you to bring data from various sources into the platform for
                    processing, analysis, and storage. You can import data from files, databases, APIs, and streaming
                    platforms.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">File Upload</h3>
                  <p>
                    Upload files directly from your computer to the platform. Supported file formats include CSV, JSON,
                    Excel, and Parquet.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Data Import page from the sidebar.</li>
                    <li>Select the "File Upload" tab.</li>
                    <li>Drag and drop files or click to browse your computer.</li>
                    <li>Configure import options such as destination and data processing settings.</li>
                    <li>Click "Start Import" to begin the import process.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Data Source Connection</h3>
                  <p>
                    Connect to external data sources such as databases, APIs, or streaming platforms to import data
                    directly.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Data Import page from the sidebar.</li>
                    <li>Select the "Data Source" tab.</li>
                    <li>Choose the type of data source (Database, API, or Streaming).</li>
                    <li>Enter the connection details for your data source.</li>
                    <li>Test the connection to ensure it works.</li>
                    <li>Configure import options and click "Connect and Import Data".</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Import History</h3>
                  <p>
                    View and manage your previous data imports, including their status, progress, and any errors that
                    occurred.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Data Import page from the sidebar.</li>
                    <li>Select the "Import History" tab.</li>
                    <li>View the list of previous imports with their status and details.</li>
                    <li>Click on an import to view more details or perform actions like reimporting.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="query-builder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visual Query Builder</CardTitle>
                <CardDescription>Build and execute SQL queries using a visual interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>
                    The Visual Query Builder allows you to create SQL queries without writing code. You can select
                    tables, fields, joins, and conditions using a visual interface, and the tool will generate the SQL
                    for you.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Building a Query</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Query Builder page from the sidebar.</li>
                    <li>
                      Select tables from the schema browser on the left by clicking the "+" button next to each table.
                    </li>
                    <li>
                      Select fields from the tables by clicking the "+" button next to each field in the expanded table
                      view.
                    </li>
                    <li>
                      Add joins between tables by clicking the "Add Join" button and configuring the join details.
                    </li>
                    <li>
                      Add conditions to filter the results by clicking the "Add Condition" button and configuring the
                      condition details.
                    </li>
                    <li>Click "Generate SQL" to create the SQL query based on your selections.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Executing a Query</h3>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>After generating the SQL, review it in the SQL tab to ensure it's correct.</li>
                    <li>Click "Execute Query" to run the query against the database.</li>
                    <li>View the results in the Query Results section below.</li>
                    <li>
                      You can export the results to CSV, view query statistics, or save the query for future use using
                      the buttons provided.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Saving and Loading Queries</h3>
                  <p>
                    You can save queries for future use and load them later to avoid rebuilding complex queries from
                    scratch.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>After creating a query, click "Save Query" to save it with a name and description.</li>
                    <li>
                      To load a saved query, go to the Saved Queries section and select the query you want to load.
                    </li>
                    <li>The query will be loaded into the Visual Query Builder for you to modify or execute.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="streaming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kafka Streaming</CardTitle>
                <CardDescription>Manage and monitor Kafka topics and streaming data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>
                    The Kafka Streaming feature allows you to manage and monitor Apache Kafka topics and streaming data
                    in real-time. You can view topic metrics, create new topics, and monitor streaming events.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Kafka Topics</h3>
                  <p>
                    View and manage Kafka topics, including their configuration, partitions, replication factor, and
                    metrics.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Streaming page from the sidebar.</li>
                    <li>Select the "Kafka Topics" tab to view the list of topics.</li>
                    <li>Click "Create Topic" to create a new topic with custom configuration.</li>
                    <li>Click on a topic to view more details or perform actions like editing or deleting.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Stream Processors</h3>
                  <p>
                    Manage stream processing applications that consume data from Kafka topics, process it, and produce
                    results to other topics.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Streaming page from the sidebar.</li>
                    <li>Select the "Stream Processors" tab to view the list of processors.</li>
                    <li>Click on a processor to view more details or perform actions like starting or stopping.</li>
                    <li>
                      Monitor the status, throughput, and consumer lag of each processor to ensure they're working
                      correctly.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Live Events</h3>
                  <p>
                    View real-time events flowing through Kafka topics to monitor data and troubleshoot issues as they
                    occur.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Streaming page from the sidebar.</li>
                    <li>Select the "Live Events" tab to view real-time events.</li>
                    <li>Use the "Pause Stream" button to pause the stream of events for closer inspection.</li>
                    <li>Filter events by topic or content to focus on specific data of interest.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="spark" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Spark Processing</CardTitle>
                <CardDescription>Run and monitor Spark jobs for distributed data processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>
                    The Spark Processing feature allows you to run and monitor Apache Spark jobs for distributed data
                    processing. You can create batch and streaming jobs, monitor their progress, and view results.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Spark Jobs</h3>
                  <p>
                    Create, run, and monitor Spark jobs for batch processing of large datasets or continuous processing
                    of streaming data.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Spark page from the sidebar.</li>
                    <li>Select the "Jobs" tab to view the list of jobs.</li>
                    <li>Click "New Job" to create a new Spark job with custom configuration.</li>
                    <li>
                      Monitor job status, progress, and resource usage to ensure they're running efficiently and
                      correctly.
                    </li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Spark Clusters</h3>
                  <p>
                    Manage and monitor Spark clusters, including their configuration, resource usage, and running
                    applications.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Spark page from the sidebar.</li>
                    <li>Select the "Clusters" tab to view the list of clusters.</li>
                    <li>
                      Monitor cluster status, resource usage (CPU, memory, disk), and running applications to ensure
                      they're working correctly.
                    </li>
                    <li>Click on a cluster to view more details or perform actions like starting or stopping.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Pipeline Designer</h3>
                  <p>
                    Design and deploy Spark data processing pipelines using a visual interface without writing code.
                  </p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Navigate to the Spark page from the sidebar.</li>
                    <li>Select the "Pipeline Designer" tab to open the visual pipeline designer.</li>
                    <li>
                      Drag and drop components like sources, transformations, and sinks to create a data processing
                      pipeline.
                    </li>
                    <li>Configure each component with the necessary parameters and connections.</li>
                    <li>Click "Deploy" to deploy the pipeline as a Spark job.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Reference</CardTitle>
                <CardDescription>Programmatically interact with the Enterprise Data Platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Overview</h3>
                  <p>
                    The Enterprise Data Platform provides a comprehensive REST API that allows you to programmatically
                    interact with all aspects of the platform. You can use the API to automate workflows, integrate with
                    other systems, and build custom applications on top of the platform.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Authentication</h3>
                  <p>
                    All API requests require authentication using JWT tokens. You can obtain a token by authenticating
                    with your username and password.
                  </p>
                  <div className="bg-muted p-4 rounded-md">
                    <Code className="h-4 w-4 inline-block mr-2" />
                    <span className="font-mono text-sm">
                      POST /api/auth/login
                      <br />
                      {`{
  "email": "your-email@example.com",
  "password": "your-password"
}`}
                    </span>
                  </div>
                  <p className="mt-2">
                    The response will include a JWT token that you should include in the Authorization header of all
                    subsequent requests:
                  </p>
                  <div className="bg-muted p-4 rounded-md">
                    <Code className="h-4 w-4 inline-block mr-2" />
                    <span className="font-mono text-sm">Authorization: Bearer your-jwt-token</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">API Endpoints</h3>
                  <p>The API is organized around the following main resources:</p>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Data Import</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <span className="font-mono text-sm">GET /api/import-jobs</span> - List all import jobs
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/import-jobs</span> - Create a new import job
                        </li>
                        <li>
                          <span className="font-mono text-sm">GET /api/import-jobs/:id</span> - Get details of a
                          specific import job
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Data Sources</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <span className="font-mono text-sm">GET /api/data-sources</span> - List all data sources
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/data-sources</span> - Create a new data source
                        </li>
                        <li>
                          <span className="font-mono text-sm">GET /api/data-sources/:id</span> - Get details of a
                          specific data source
                        </li>
                        <li>
                          <span className="font-mono text-sm">PUT /api/data-sources/:id</span> - Update a data source
                        </li>
                        <li>
                          <span className="font-mono text-sm">DELETE /api/data-sources/:id</span> - Delete a data source
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Query Builder</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <span className="font-mono text-sm">GET /api/data-schemas</span> - List all data schemas
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/execute-query</span> - Execute a SQL query
                        </li>
                        <li>
                          <span className="font-mono text-sm">GET /api/saved-queries</span> - List all saved queries
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/saved-queries</span> - Save a new query
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Kafka Streaming</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <span className="font-mono text-sm">GET /api/kafka/topics</span> - List all Kafka topics
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/kafka/topics</span> - Create a new Kafka topic
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium">Spark Processing</h4>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>
                          <span className="font-mono text-sm">GET /api/spark/jobs</span> - List all Spark jobs
                        </li>
                        <li>
                          <span className="font-mono text-sm">POST /api/spark/jobs</span> - Create a new Spark job
                        </li>
                        <li>
                          <span className="font-mono text-sm">GET /api/spark/clusters</span> - List all Spark clusters
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">API Documentation</h3>
                  <p>
                    For detailed API documentation, including request and response formats, error codes, and examples,
                    please refer to the API Documentation portal.
                  </p>
                  <div className="mt-4">
                    <Link href="/api-docs" className="text-sm font-medium text-primary">
                      Open API Documentation Portal
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
