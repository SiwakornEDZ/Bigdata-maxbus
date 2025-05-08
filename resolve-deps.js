const fs = require("fs")
const path = require("path")

// This script helps resolve common dependency issues
console.log("Checking for dependency issues...")

// Create a package.json if it doesn't exist
if (!fs.existsSync("package.json")) {
  console.log("Creating package.json...")
  const packageJson = {
    name: "big-data-enterprise",
    version: "0.1.0",
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
      lint: "next lint",
    },
    dependencies: {
      next: "latest",
      react: "latest",
      "react-dom": "latest",
    },
  }

  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
  console.log("Created package.json")
}

console.log("Dependency check complete")
