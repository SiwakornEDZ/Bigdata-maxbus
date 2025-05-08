import { UsersTable } from "@/components/users-table"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Users Management</h1>
        <p className="text-muted-foreground">Manage users for the Enterprise Data Platform.</p>
        <UsersTable />
      </div>
    </DashboardLayout>
  )
}
