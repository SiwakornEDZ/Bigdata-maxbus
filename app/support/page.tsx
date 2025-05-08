import Link from "next/link"
import { ArrowLeft, CheckCircle, HelpCircle, Mail, MessageSquare, Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function SupportPage() {
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
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">Support</h1>
        </div>
        <p className="text-muted-foreground">
          Need help with the Enterprise Data Platform? Our support team is here to assist you.
        </p>

        <Tabs defaultValue="contact" className="space-y-4">
          <TabsList>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Fill out the form below to get in touch with our support team.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email address" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Brief description of your issue" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Detailed description of your issue or question" rows={5} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="low">Low - General question or feedback</option>
                    <option value="medium">Medium - Issue affecting some functionality</option>
                    <option value="high">High - Significant issue affecting core functionality</option>
                    <option value="critical">Critical - System down or data loss</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Submit Support Request</Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Support</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Send us an email and we'll get back to you within 24 hours.</p>
                  <p className="mt-2 text-sm font-medium">support@dataplatform.example.com</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Phone Support</CardTitle>
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Call us directly for urgent issues requiring immediate assistance.</p>
                  <p className="mt-2 text-sm font-medium">+1 (555) 123-4567</p>
                  <p className="text-xs text-muted-foreground">Available Monday-Friday, 9am-5pm ET</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Chat</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Chat with a support representative in real-time.</p>
                  <Button variant="outline" className="mt-2 w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions about the Enterprise Data Platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I reset my password?</h3>
                    <p className="text-sm text-muted-foreground">
                      To reset your password, click on the "Forgot password?" link on the login page. You will receive
                      an email with instructions to reset your password. If you don't receive the email, check your spam
                      folder or contact support.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I connect to a new data source?</h3>
                    <p className="text-sm text-muted-foreground">
                      To connect to a new data source, navigate to the Data Import page and select the "Data Source"
                      tab. Choose the type of data source you want to connect to (Database, API, or Streaming) and enter
                      the connection details. Test the connection to ensure it works, then configure import options and
                      click "Connect and Import Data".
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I create a new Spark job?</h3>
                    <p className="text-sm text-muted-foreground">
                      To create a new Spark job, navigate to the Spark page and select the "Jobs" tab. Click the "New
                      Job" button and fill out the job details, including the job name, type, cluster, and
                      configuration. You can either upload a JAR file or use the Pipeline Designer to create a job
                      without writing code.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I monitor Kafka topics?</h3>
                    <p className="text-sm text-muted-foreground">
                      To monitor Kafka topics, navigate to the Streaming page and select the "Kafka Topics" tab. You'll
                      see a list of all topics with their key metrics like partitions, messages per second, and size.
                      Click on a topic to view more detailed metrics and configuration. You can also view real-time
                      events by selecting the "Live Events" tab.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">How do I export query results?</h3>
                    <p className="text-sm text-muted-foreground">
                      After executing a query in the Query Builder, you'll see the results displayed in the Query
                      Results section. Click the "Export" button in the top-right corner of the results table to
                      download the data as a CSV file. You can also save the query for future use by clicking the "Save
                      Query" button.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Contact our support team.
                </p>
                <Button variant="outline">Contact Support</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>Access comprehensive documentation for the Enterprise Data Platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">User Guide</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Comprehensive guide to using the Enterprise Data Platform, including step-by-step instructions
                        for all features.
                      </p>
                      <div className="mt-4">
                        <Link href="/documentation" className="text-sm font-medium text-primary">
                          View User Guide
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">API Reference</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Detailed documentation of the REST API, including endpoints, request/response formats, and
                        examples.
                      </p>
                      <div className="mt-4">
                        <Link href="/documentation?tab=api" className="text-sm font-medium text-primary">
                          View API Reference
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tutorials</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Step-by-step tutorials for common tasks and workflows in the Enterprise Data Platform.
                      </p>
                      <div className="mt-4">
                        <Link href="/tutorials" className="text-sm font-medium text-primary">
                          View Tutorials
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Release Notes</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Information about the latest features, improvements, and bug fixes in each release.
                      </p>
                      <div className="mt-4">
                        <Link href="/release-notes" className="text-sm font-medium text-primary">
                          View Release Notes
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Best Practices</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Recommendations and best practices for using the Enterprise Data Platform effectively.
                      </p>
                      <div className="mt-4">
                        <Link href="/best-practices" className="text-sm font-medium text-primary">
                          View Best Practices
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Troubleshooting</CardTitle>
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Solutions to common issues and problems you might encounter while using the platform.
                      </p>
                      <div className="mt-4">
                        <Link href="/troubleshooting" className="text-sm font-medium text-primary">
                          View Troubleshooting Guide
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
