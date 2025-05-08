import { LoginFormStandalone } from "@/components/login-form-standalone"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Database className="h-8 w-8" />
        </div>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginFormStandalone />
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-center text-muted-foreground mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline-offset-4 hover:underline">
            Register
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
