"use client"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Save, Play, Plus, Settings, FileCode } from "lucide-react"

// Define custom node types
const nodeTypes = {
  source: { width: 150, height: 40, color: "#3b82f6", icon: "database" },
  transform: { width: 150, height: 40, color: "#10b981", icon: "code" },
  sink: { width: 150, height: 40, color: "#f59e0b", icon: "save" },
  join: { width: 150, height: 40, color: "#8b5cf6", icon: "git-merge" },
  filter: { width: 150, height: 40, color: "#ef4444", icon: "filter" },
  aggregate: { width: 150, height: 40, color: "#ec4899", icon: "bar-chart" },
}

// Initial nodes and edges for the pipeline
const initialNodes = [
  {
    id: "1",
    type: "source",
    data: { label: "Kafka Source" },
    position: { x: 250, y: 50 },
    sourcePosition: Position.Bottom,
  },
  {
    id: "2",
    type: "transform",
    data: { label: "JSON Parser" },
    position: { x: 250, y: 150 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "3",
    type: "filter",
    data: { label: "Filter Events" },
    position: { x: 250, y: 250 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "4",
    type: "transform",
    data: { label: "Enrich Data" },
    position: { x: 100, y: 350 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "5",
    type: "aggregate",
    data: { label: "Aggregate" },
    position: { x: 400, y: 350 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "6",
    type: "join",
    data: { label: "Join Results" },
    position: { x: 250, y: 450 },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: "7",
    type: "sink",
    data: { label: "Database Sink" },
    position: { x: 250, y: 550 },
    targetPosition: Position.Top,
  },
]

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#3b82f6" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true,
    style: { stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    animated: true,
    style: { stroke: "#ef4444" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    animated: true,
    style: { stroke: "#ef4444" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e4-6",
    source: "4",
    target: "6",
    animated: true,
    style: { stroke: "#10b981" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e5-6",
    source: "5",
    target: "6",
    animated: true,
    style: { stroke: "#ec4899" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e6-7",
    source: "6",
    target: "7",
    animated: true,
    style: { stroke: "#8b5cf6" },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
]

// Custom node component
const CustomNode = ({ data, type }) => {
  const nodeType = nodeTypes[type] || nodeTypes.transform

  return (
    <div
      style={{
        background: nodeType.color,
        color: "white",
        borderRadius: "4px",
        padding: "10px",
        width: nodeType.width,
        height: nodeType.height,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold",
      }}
    >
      {data.label}
    </div>
  )
}

export function SparkPipelineDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = (params) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          animated: true,
          style: { stroke: "#3b82f6" },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        eds,
      ),
    )
  }

  return (
    <div className="h-[600px] w-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white">
          <Plus className="h-4 w-4" />
          <span>Add Node</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white">
          <FileCode className="h-4 w-4" />
          <span>Code View</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-2 bg-white">
          <Save className="h-4 w-4" />
          <span>Save</span>
        </Button>
        <Button size="sm" className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          <span>Deploy</span>
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        attributionPosition="bottom-right"
        nodesDraggable={true}
        elementsSelectable={true}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        <Background color="#f8fafc" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            const type = n.type || "transform"
            return nodeTypes[type]?.color || "#10b981"
          }}
          nodeColor={(n) => {
            const type = n.type || "transform"
            return nodeTypes[type]?.color || "#10b981"
          }}
        />
      </ReactFlow>
    </div>
  )
}

