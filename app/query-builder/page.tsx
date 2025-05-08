import { VisualQueryBuilder } from "@/components/visual-query-builder"

export default function QueryBuilderPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Query Builder</h1>
      <p className="text-muted-foreground">
        Build SQL queries visually by selecting tables, columns, and defining relationships.
      </p>
      <VisualQueryBuilder />
    </div>
  )
}
