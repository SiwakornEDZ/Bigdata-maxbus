import { sql } from "@/lib/db"
import { hashPassword, comparePasswords } from "@/lib/auth"

/**
 * บริการจัดการผู้ใช้
 * รับผิดชอบการจัดการผู้ใช้ทั้งหมด
 */
export class UserService {
  /**
   * สร้างผู้ใช้ใหม่
   */
  async createUser(name: string, email: string, password: string, role = "user"): Promise<any> {
    try {
      // ตรวจสอบว่าอีเมลซ้ำหรือไม่
      const existingUser = await this.getUserByEmail(email)
      if (existingUser) {
        return {
          success: false,
          error: "Email already exists",
        }
      }

      // แฮชรหัสผ่าน
      const hashedPassword = await hashPassword(password)

      // สร้างผู้ใช้ใหม่
      const result = await sql`
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES (${name}, ${email}, ${hashedPassword}, ${role}, NOW(), NOW())
        RETURNING id, name, email, role, created_at, updated_at
      `

      return {
        success: true,
        user: result[0],
      }
    } catch (error) {
      console.error("Error creating user:", error)
      return {
        success: false,
        error: "Failed to create user",
      }
    }
  }

  /**
   * ดึงข้อมูลผู้ใช้ตาม ID
   */
  async getUserById(id: number): Promise<any | null> {
    try {
      const users = await sql`
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        WHERE id = ${id}
      `

      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error(`Error getting user ${id}:`, error)
      return null
    }
  }

  /**
   * ดึงข้อมูลผู้ใช้ตามอีเมล
   */
  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const users = await sql`
        SELECT id, name, email, password, role, created_at, updated_at
        FROM users
        WHERE email = ${email}
      `

      return users.length > 0 ? users[0] : null
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error)
      return null
    }
  }

  /**
   * อัปเดตข้อมูลผู้ใช้
   */
  async updateUser(id: number, data: { name?: string; email?: string; role?: string }): Promise<any> {
    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
      const user = await this.getUserById(id)
      if (!user) {
        return {
          success: false,
          error: "User not found",
        }
      }

      // ตรวจสอบว่าอีเมลซ้ำหรือไม่
      if (data.email && data.email !== user.email) {
        const existingUser = await this.getUserByEmail(data.email)
        if (existingUser) {
          return {
            success: false,
            error: "Email already exists",
          }
        }
      }

      // อัปเดตข้อมูลผู้ใช้
      const updates = []
      const values = []

      if (data.name) {
        updates.push("name = $1")
        values.push(data.name)
      }

      if (data.email) {
        updates.push(`email = $${values.length + 1}`)
        values.push(data.email)
      }

      if (data.role) {
        updates.push(`role = $${values.length + 1}`)
        values.push(data.role)
      }

      updates.push(`updated_at = $${values.length + 1}`)
      values.push(new Date())

      const updateQuery = `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = $${values.length + 1}
        RETURNING id, name, email, role, created_at, updated_at
      `

      values.push(id)

      const result = await sql.unsafe(updateQuery, ...values)

      return {
        success: true,
        user: result[0],
      }
    } catch (error) {
      console.error(`Error updating user ${id}:`, error)
      return {
        success: false,
        error: "Failed to update user",
      }
    }
  }

  /**
   * เปลี่ยนรหัสผ่านผู้ใช้
   */
  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<any> {
    try {
      // ดึงข้อมูลผู้ใช้
      const users = await sql`
        SELECT id, password
        FROM users
        WHERE id = ${id}
      `

      if (users.length === 0) {
        return {
          success: false,
          error: "User not found",
        }
      }

      const user = users[0]

      // ตรวจสอบรหัสผ่านปัจจุบัน
      const isPasswordValid = await comparePasswords(currentPassword, user.password)
      if (!isPasswordValid) {
        return {
          success: false,
          error: "Current password is incorrect",
        }
      }

      // แฮชรหัสผ่านใหม่
      const hashedPassword = await hashPassword(newPassword)

      // อัปเดตรหัสผ่าน
      await sql`
        UPDATE users
        SET password = ${hashedPassword}, updated_at = NOW()
        WHERE id = ${id}
      `

      return {
        success: true,
        message: "Password changed successfully",
      }
    } catch (error) {
      console.error(`Error changing password for user ${id}:`, error)
      return {
        success: false,
        error: "Failed to change password",
      }
    }
  }

  /**
   * ลบผู้ใช้
   */
  async deleteUser(id: number): Promise<any> {
    try {
      // ตรวจสอบว่าผู้ใช้มีอยู่หรือไม่
      const user = await this.getUserById(id)
      if (!user) {
        return {
          success: false,
          error: "User not found",
        }
      }

      // ลบผู้ใช้
      await sql`
        DELETE FROM users
        WHERE id = ${id}
      `

      return {
        success: true,
        message: "User deleted successfully",
      }
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error)
      return {
        success: false,
        error: "Failed to delete user",
      }
    }
  }

  /**
   * ดึงข้อมูลผู้ใช้ทั้งหมด
   */
  async getAllUsers(): Promise<any[]> {
    try {
      const users = await sql`
        SELECT id, name, email, role, created_at, updated_at
        FROM users
        ORDER BY id
      `

      return users
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  /**
   * ตรวจสอบว่าตาราง users มีอยู่หรือไม่ ถ้าไม่มีให้สร้าง
   */
  async ensureUsersTableExists(): Promise<void> {
    try {
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = 'users'
        );
      `

      if (!tableExists[0]?.exists) {
        await sql`
          CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TIMESTAMP NOT NULL,
            updated_at TIMESTAMP NOT NULL
          )
        `
        console.log("Created users table")

        // สร้างผู้ดูแลระบบเริ่มต้น
        const adminPassword = await hashPassword("admin123")
        await sql`
          INSERT INTO users (name, email, password, role, created_at, updated_at)
          VALUES ('Admin', 'admin@example.com', ${adminPassword}, 'admin', NOW(), NOW())
        `
        console.log("Created default admin user")
      }
    } catch (error) {
      console.error("Error ensuring users table exists:", error)
      throw error
    }
  }
}

// สร้าง singleton instance และ export
export const userService = new UserService()

