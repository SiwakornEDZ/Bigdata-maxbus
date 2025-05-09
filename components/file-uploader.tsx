"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  onUploadComplete?: (success: boolean, data?: any) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUploader({
  onFileSelect,
  onUploadComplete,
  accept = ".csv,.xlsx,.json,.parquet",
  maxSize = 50, // Default 50MB
}: FileUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSize}MB`)
      toast({
        variant: "destructive",
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
      })
      return
    }

    setSelectedFile(file)
    setError(null)
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]

      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds the maximum limit of ${maxSize}MB`)
        toast({
          variant: "destructive",
          title: "File too large",
          description: `Maximum file size is ${maxSize}MB`,
        })
        return
      }

      setSelectedFile(file)
      setError(null)
      onFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const simulateUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          if (onUploadComplete) {
            onUploadComplete(true, { fileName: selectedFile?.name })
          }
          return 100
        }
        return prev + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }

  const startUpload = () => {
    if (!selectedFile) return

    simulateUpload()
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept={accept} />
          <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drag and drop your file here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, Excel, JSON, Parquet (Max {maxSize}MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} disabled={isUploading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isUploading && (
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}

          {!isUploading && (
            <Button onClick={startUpload} className="w-full mt-2" size="sm">
              Upload File
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

