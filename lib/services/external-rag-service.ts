// External RAG Service client

class ExternalRagService {
  constructor() {
    this.apiUrl = process.env.RAG_API_URL || "http://localhost:8000"
  }

  async uploadDocument(buffer, filename, contentType, namespace = "default") {
    try {
      const formData = new FormData()
      const blob = new Blob([buffer], { type: contentType })
      formData.append("file", blob, filename)
      formData.append("namespace", namespace)

      const response = await fetch(`${this.apiUrl}/upload`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to upload document")
      }

      return await response.json()
    } catch (error) {
      console.error("Error uploading document:", error)
      throw error
    }
  }

  async askQuestion(query, namespace = "default") {
    try {
      const response = await fetch(`${this.apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          namespace,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to process question")
      }

      return await response.json()
    } catch (error) {
      console.error("Error asking question:", error)
      throw error
    }
  }

  async clearNamespace(namespace = "default") {
    try {
      const response = await fetch(`${this.apiUrl}/clear`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          namespace,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to clear namespace")
      }

      return await response.json()
    } catch (error) {
      console.error("Error clearing namespace:", error)
      throw error
    }
  }

  async getNamespaces() {
    try {
      const response = await fetch(`${this.apiUrl}/namespaces`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to fetch namespaces")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching namespaces:", error)
      throw error
    }
  }

  async getNamespaceStatus(namespace = "default") {
    try {
      const response = await fetch(`${this.apiUrl}/status?namespace=${namespace}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to fetch namespace status")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching namespace status:", error)
      throw error
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`)

      if (!response.ok) {
        return { status: "error", message: "RAG service is not healthy" }
      }

      return await response.json()
    } catch (error) {
      console.error("Error checking RAG service health:", error)
      return { status: "error", message: error.message }
    }
  }

  async getServiceInfo() {
    try {
      const response = await fetch(`${this.apiUrl}/info`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || "Failed to fetch RAG service info")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching RAG service info:", error)
      throw error
    }
  }
}

export const externalRagService = new ExternalRagService()
