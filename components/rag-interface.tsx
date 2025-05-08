"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Search, Trash2, Database, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Namespace {
  name: string
  vectorCount: number
}

interface Source {
  text: string
  source: string
  score: number
}

export function RagInterface() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [answer, setAnswer] = useState("")
  const [timeTaken, setTimeTaken] = useState<number | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [selectedNamespace, setSelectedNamespace] = useState("default")
  const [returnSources, setReturnSources] = useState(true)
  const [verbose, setVerbose] = useState(false)
  const [deleteExisting, setDeleteExisting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchNamespaces = async () => {
    try {
      const response = await fetch("/api/rag/namespaces")
      const data = await response.json()
      setNamespaces(data.namespaces || [])
    } catch (error) {
      console.error("Error fetching namespaces:", error)
      toast({
        title: "Error",
        description: "Failed to fetch namespaces",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!fileInputRef.current?.files?.length) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setUploadStatus("Uploading files...")

    try {
      const formData = new FormData()

      for (let i = 0; i < fileInputRef.current.files.length; i++) {
        formData.append("files", fileInputRef.current.files[i])
      }

      formData.append("namespace", selectedNamespace)
      formData.append("delete_existing", deleteExisting.toString())

      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadStatus(`Success: ${data.message}`)
        toast({
          title: "Upload successful",
          description: data.message,
        })
        fetchNamespaces()
      } else {
        setUploadStatus(`Error: ${data.error}`)
        toast({
          title: "Upload failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setUploadStatus(`Error: ${error.message}`)
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAsk = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!query.trim()) {
      toast({
        title: "Empty query",
        description: "Please enter a question",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setAnswer("")
    setTimeTaken(null)
    setSources([])

    try {
      const response = await fetch("/api/rag/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          namespace: selectedNamespace,
          return_sources: returnSources,
          verbose,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswer(data.answer)
        setTimeTaken(data.timeTaken)
        setSources(data.sources || [])
      } else {
        toast({
          title: "Query failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearNamespace = async () => {
    if (!confirm(`Are you sure you want to delete all data in namespace "${selectedNamespace}"?`)) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/rag/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace: selectedNamespace,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Namespace cleared",
          description: data.message,
        })
        fetchNamespaces()
      } else {
        toast({
          title: "Failed to clear namespace",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Failed to clear namespace",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch namespaces on component mount
  useEffect(() => {
    fetchNamespaces()
  }, [])

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>RAG System</CardTitle>
        <CardDescription>Upload documents and ask questions using Retrieval-Augmented Generation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="ask">Ask</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="flex items-center space-x-4 mb-4">
              <Label htmlFor="namespace">Namespace:</Label>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger id="namespace" className="w-[180px]">
                  <SelectValue placeholder="Select namespace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">default</SelectItem>
                  {namespaces.map(
                    (ns) =>
                      ns.name !== "default" && (
                        <SelectItem key={ns.name} value={ns.name}>
                          {ns.name} ({ns.vectorCount})
                        </SelectItem>
                      ),
                  )}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={fetchNamespaces} disabled={isLoading}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="upload">
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="files">Upload Documents</Label>
                  <Input
                    ref={fileInputRef}
                    id="files"
                    type="file"
                    multiple
                    accept=".txt,.pdf,.csv,.doc,.docx"
                    disabled={isLoading}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Supported formats: .txt, .pdf, .csv, .doc, .docx</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="delete-existing"
                    checked={deleteExisting}
                    onCheckedChange={setDeleteExisting}
                    disabled={isLoading}
                  />
                  <Label htmlFor="delete-existing">Delete existing data in namespace</Label>
                </div>

                {uploadStatus && <div className="text-sm p-2 border rounded bg-muted">{uploadStatus}</div>}

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="ask">
            <form onSubmit={handleAsk}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="query">Your Question</Label>
                  <Textarea
                    id="query"
                    placeholder="Ask a question about your documents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={isLoading}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="return-sources"
                      checked={returnSources}
                      onCheckedChange={setReturnSources}
                      disabled={isLoading}
                    />
                    <Label htmlFor="return-sources">Return source documents</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="verbose" checked={verbose} onCheckedChange={setVerbose} disabled={isLoading} />
                    <Label htmlFor="verbose">Verbose response (include reasoning)</Label>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
            </form>

            {answer && (
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Answer</h3>
                  <div className="p-4 border rounded bg-muted whitespace-pre-wrap">{answer}</div>
                  {timeTaken !== null && (
                    <p className="text-sm text-muted-foreground mt-1">Response time: {timeTaken.toFixed(2)} seconds</p>
                  )}
                </div>

                {sources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium">Sources</h3>
                    <div className="space-y-2">
                      {sources.map((source, index) => (
                        <div key={index} className="p-3 border rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{source.source}</span>
                            <span className="text-muted-foreground">Score: {source.score.toFixed(4)}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground line-clamp-3">{source.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manage">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Namespaces</h3>
                {namespaces.length > 0 ? (
                  <div className="space-y-2">
                    {namespaces.map((ns) => (
                      <div key={ns.name} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <span className="font-medium">{ns.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">{ns.vectorCount} vectors</span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedNamespace(ns.name)
                            handleClearNamespace()
                          }}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No namespaces found</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Create New Namespace</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter namespace name"
                    value={selectedNamespace !== "default" ? selectedNamespace : ""}
                    onChange={(e) => setSelectedNamespace(e.target.value || "default")}
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedNamespace && selectedNamespace !== "default") {
                        toast({
                          title: "Namespace created",
                          description: `Namespace "${selectedNamespace}" is ready for use`,
                        })
                        fetchNamespaces()
                      }
                    }}
                    disabled={isLoading || !selectedNamespace || selectedNamespace === "default"}
                  >
                    <Database className="h-4 w-4 mr-1" />
                    Create
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">Powered by External RAG API</p>
      </CardFooter>
    </Card>
  )
}
