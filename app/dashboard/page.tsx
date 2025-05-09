import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// ส่วนประกอบสำหรับแสดงสถิติฐานข้อมูล
function DatabaseStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>สถิติฐานข้อมูล</CardTitle>
        <CardDescription>ข้อมูลสรุปเกี่ยวกับฐานข้อมูลของคุณ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">จำนวนตาราง</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">จำนวนข้อมูลทั้งหมด</p>
              <p className="text-2xl font-bold">1,234,567</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">การนำเข้าล่าสุด</p>
              <p className="text-2xl font-bold">2 ชั่วโมงที่แล้ว</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">การสืบค้นล่าสุด</p>
              <p className="text-2xl font-bold">5 นาทีที่แล้ว</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ส่วนประกอบสำหรับแสดงกิจกรรมล่าสุด
function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>กิจกรรมล่าสุด</CardTitle>
        <CardDescription>กิจกรรมที่เกิดขึ้นล่าสุดในระบบ</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <div>
              <p className="text-sm font-medium">นำเข้าข้อมูล sales_data.csv สำเร็จ</p>
              <p className="text-xs text-gray-500">2 ชั่วโมงที่แล้ว</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm font-medium">สร้างตาราง customer_feedback</p>
              <p className="text-xs text-gray-500">3 ชั่วโมงที่แล้ว</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <div>
              <p className="text-sm font-medium">ประมวลผล SQL query</p>
              <p className="text-xs text-gray-500">5 ชั่วโมงที่แล้ว</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div>
              <p className="text-sm font-medium">ลบตาราง old_data</p>
              <p className="text-xs text-gray-500">1 วันที่แล้ว</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ส่วนประกอบสำหรับแสดงข้อมูลสรุป
function Summary() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">จำนวนตาราง</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">+2 จากเดือนที่แล้ว</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">จำนวนข้อมูล</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234,567</div>
          <p className="text-xs text-muted-foreground">+12.5% จากเดือนที่แล้ว</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">การนำเข้าข้อมูล</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">+4 จากเดือนที่แล้ว</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">การสืบค้น SQL</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">127</div>
          <p className="text-xs text-muted-foreground">+14% จากเดือนที่แล้ว</p>
        </CardContent>
      </Card>
    </div>
  )
}

// ส่วนประกอบสำหรับแสดง loading
function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px] mb-2" />
            <Skeleton className="h-4 w-[120px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">แดชบอร์ด</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
          <TabsTrigger value="analytics">วิเคราะห์</TabsTrigger>
          <TabsTrigger value="reports">รายงาน</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<DashboardSkeleton />}>
            <Summary />
          </Suspense>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Suspense fallback={<Skeleton className="h-[300px] md:col-span-4" />}>
              <Card className="md:col-span-4">
                <CardHeader>
                  <CardTitle>ภาพรวมข้อมูล</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px]">
                    {/* กราฟจะถูกเพิ่มที่นี่ */}
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">กราฟแสดงข้อมูล</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[300px] md:col-span-3" />}>
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>การใช้งานล่าสุด</CardTitle>
                  <CardDescription>กิจกรรมที่เกิดขึ้นล่าสุดในระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Suspense fallback={<Skeleton className="h-[300px]" />}>
              <DatabaseStats />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-[300px]" />}>
              <Card>
                <CardHeader>
                  <CardTitle>การใช้งานทรัพยากร</CardTitle>
                  <CardDescription>การใช้งานทรัพยากรของระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    {/* กราฟจะถูกเพิ่มที่นี่ */}
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">กราฟแสดงการใช้งานทรัพยากร</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <Suspense fallback={<Skeleton className="h-[400px]" />}>
              <Card>
                <CardHeader>
                  <CardTitle>รายงาน</CardTitle>
                  <CardDescription>รายงานสรุปข้อมูลในระบบ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {/* รายงานจะถูกเพิ่มที่นี่ */}
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">รายงานสรุปข้อมูล</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

