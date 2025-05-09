import { RegisterForm } from "@/components/register-form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Database } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <Card className="mx-auto w-full max-w-md shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-lg bg-primary p-2">
            <Database className="h-8 w-8 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
        <CardDescription>Enter your information to create an account</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex flex-col">
        <div className="text-sm text-center text-muted-foreground mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline-offset-4 hover:underline font-medium">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}

