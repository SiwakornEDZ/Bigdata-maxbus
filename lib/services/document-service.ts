import { getEmbedding } from "./embedding-service"
import { upsertVectors, type PineconeMetadata } from "./pinecone-service"
import { v4 as uuidv4 } from "uuid"
import * as fs from "fs"
import * as path from "path"
import { PDFLoader } from "langchain/document_loaders/fs/pdf"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { CSVLoader } from "langchain/document_loaders/fs/csv"
import { DocxLoader } from "langchain/document_loaders/fs/docx"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

export interface ProcessedDocument {
  chunks: number
  filename: string
}

export async function processDocument(
  filePath: string,
  fileName: string,
  namespace = "default",
): Promise<ProcessedDocument> {
  // Determine file type and use appropriate loader
  const extension = path.extname(fileName).toLowerCase()
  let text = ""

  try {
    if (extension === ".pdf") {
      const loader = new PDFLoader(filePath)
      const docs = await loader.load()
      text = docs.map((doc) => doc.pageContent).join("\n")
    } else if (extension === ".txt") {
      const loader = new TextLoader(filePath)
      const docs = await loader.load()
      text = docs[0].pageContent
    } else if (extension === ".csv") {
      const loader = new CSVLoader(filePath)
      const docs = await loader.load()
      text = docs.map((doc) => doc.pageContent).join("\n")
    } else if (extension === ".docx" || extension === ".doc") {
      const loader = new DocxLoader(filePath)
      const docs = await loader.load()
      text = docs[0].pageContent
    } else {
      throw new Error(`Unsupported file type: ${extension}`)
    }

    // Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    const chunks = await splitter.createDocuments([text])

    // Create embeddings and upsert to Pinecone
    const vectors = await Promise.all(
      chunks.map(async (chunk, index) => {
        const embedding = await getEmbedding(chunk.pageContent)
        return {
          id: uuidv4(),
          values: embedding,
          metadata: {
            text: chunk.pageContent,
            source: fileName,
            chunk: index,
          } as PineconeMetadata,
        }
      }),
    )

    await upsertVectors(vectors, namespace)

    return {
      chunks: chunks.length,
      filename: fileName,
    }
  } catch (error) {
    console.error(`Error processing document ${fileName}:`, error)
    throw error
  } finally {
    // Clean up temporary file
    try {
      fs.unlinkSync(filePath)
    } catch (error) {
      console.error(`Error deleting temporary file ${filePath}:`, error)
    }
  }
}
