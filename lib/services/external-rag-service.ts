export const RAG_API_URL = process.env.RAG_API_URL || "https://your-rag-api.onrender.com"

export async function uploadDocuments(files: File[], namespace = "default", deleteExisting = false) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append("files", file)
  })

  formData.append("namespace", namespace)
  formData.append("delete_existing", deleteExisting.toString())

  const response = await fetch(`${RAG_API_URL}/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to upload documents")
  }

  return await response.json()
}

export async function askQuestion(query: string, namespace = "default", returnSources = false, verbose = false) {
  const response = await fetch(`${RAG_API_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      namespace,
      return_sources: returnSources,
      verbose,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to process query")
  }

  return await response.json()
}

export async function clearNamespace(namespace = "default") {
  const response = await fetch(`${RAG_API_URL}/clear`, {
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
    throw new Error(error.error || "Failed to clear namespace")
  }

  return await response.json()
}

export async function getNamespaces() {
  const response = await fetch(`${RAG_API_URL}/namespaces`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to list namespaces")
  }

  return await response.json()
}

export async function getStatus() {
  const response = await fetch(`${RAG_API_URL}/status`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to get status")
  }

  return await response.json()
}

export async function checkHealth() {
  const response = await fetch(`${RAG_API_URL}/health`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Health check failed")
  }

  return await response.json()
}
