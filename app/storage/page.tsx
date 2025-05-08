import { DashboardLayout } from "@/components/dashboard-layout"
import { StorageOverview } from "@/components/storage-overview"
import { Button } from "@/components/ui/button"
import { HardDrive, Plus } from "lucide-react"

export default function StoragePage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-semibold">Storage Management</h1>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Storage</span>
          </Button>
        </div>
        <p className="text-muted-foreground">
          Manage your data storage, monitor usage, and configure storage policies.
        </p>

        <StorageOverview />
      </div>
    </DashboardLayout>
  )
}
