import { redirect } from "next/navigation"

export default function ProfileRedirect() {
  redirect("/simple-profile")
  return null
}

