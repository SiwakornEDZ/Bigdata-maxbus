import { NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"

export async function GET(request, { params }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const user = await userService.getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error(`Error getting user ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const data = await request.json()
    const result = await userService.updateUser(id, data)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result.user)
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    const result = await userService.deleteUser(id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
