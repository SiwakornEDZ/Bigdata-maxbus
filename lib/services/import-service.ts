import { sql } from "@/lib/db"
import { databaseService } from "./database-service"
import type { ImportJob } from "@/types/database"

/**
 * บริการนำเข้าข้อมูล
 * รับผิดชอบการนำเข้าข้อมูลจากไฟล์ต่างๆ
 */
export class ImportService {
  /**
   * สร้าง import job ใหม่
   */
  async createImportJob(filename: string, tableName: string, totalRows: number): Promise<number> {
    try {
      const result = await sql`
        INSERT INTO import_jobs (
          filename, 
          table_name, 
          status, 
          rows_processed, 
          total_rows, 
          created_at, 
          updated_at
        ) 
        VALUES (
          ${filename}, 
          ${tableName}, 
          ${"pending"}, 
          ${0}, 
          ${totalRows}, 
          NOW(), 
          NOW()
        )
        RETURNING id
      `

      return result[0]?.id
    } catch (error) {
      console.error("Error creating import job:", error)
      throw error
    }
  }

  /**
   * อัปเดตสถานะของ import job
   */
  async updateImportJobStatus(
    jobId: number,
    status: string,
    rowsProcessed: number,
    errorMessage?: string,
  ): Promise<void> {
    try {
      if (errorMessage) {
        await sql`
          UPDATE import_jobs 
          SET 
            status = ${status}, 
            rows_processed = ${rowsProcessed}, 
            error_message = ${errorMessage},
            updated_at = NOW()
          WHERE id = ${jobId}
        `
      } else {
        await sql`
          UPDATE import_jobs 
          SET 
            status = ${status}, 
            rows_processed = ${rowsProcessed},
            updated_at = NOW()
          WHERE id = ${jobId}
        `
      }
    } catch (error) {
      console.error("Error updating import job status:", error)
      throw error
    }
  }

  /**
   * ดึงข้อมูล import job ทั้งหมด
   */
  async getAllImportJobs(): Promise<ImportJob[]> {
    try {
      const jobs = await sql`
        SELECT 
          id, 
          filename, 
          table_name as "tableName", 
          status, 
          rows_processed as "rowsProcessed", 
          total_rows as "totalRows", 
          error_message as "error",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM import_jobs
        ORDER BY created_at DESC
      `

      return jobs
    } catch (error) {
      console.error("Error getting import jobs:", error)
      return []
    }
  }

  /**
   * ดึงข้อมูล import job ตาม ID
   */
  async getImportJobById(jobId: number): Promise<ImportJob | null> {
    try {
      const jobs = await sql`
        SELECT 
          id, 
          filename, 
          table_name as "tableName", 
          status, 
          rows_processed as "rowsProcessed", 
          total_rows as "totalRows", 
          error_message as "error",
          created_at as "createdAt", 
          updated_at as "updatedAt"
        FROM import_jobs
        WHERE id = ${jobId}
      `

      return jobs.length > 0 ? jobs[0] : null
    } catch (error) {
      console.error(`Error getting import job ${jobId}:`, error)
      return null
    }
  }

  /**
   * ลบ import job
   */
  async deleteImportJob(jobId: number): Promise<boolean> {
    try {
      await sql`
        DELETE FROM import_jobs
        WHERE id = ${jobId}
      `

      return true
    } catch (error) {
      console.error(`Error deleting import job ${jobId}:`, error)
      return false
    }
  }

  /**
   * ตรวจสอบว่าตาราง import_jobs มีอยู่หรือไม่ ถ้าไม่มีให้สร้าง
   */
  async ensureImportJobsTableExists(): Promise<void> {
    try {
      const exists = await databaseService.tableExists("import_jobs")

      if (!exists) {
        await sql`
          CREATE TABLE import_jobs (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL,
            table_name TEXT NOT NULL,
            status TEXT NOT NULL,
            rows_processed INTEGER NOT NULL DEFAULT 0,
            total_rows INTEGER NOT NULL DEFAULT 0,
            error_message TEXT,
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
          )
        `
        console.log("Created import_jobs table")
      }
    } catch (error) {
      console.error("Error ensuring import_jobs table exists:", error)
      throw error
    }
  }
}

// สร้าง singleton instance และ export
export const importService = new ImportService()
