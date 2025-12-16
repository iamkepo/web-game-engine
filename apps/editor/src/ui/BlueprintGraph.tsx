// apps/editor/src/ui/BlueprintGraph.tsx
import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border border-gray-200 relative">
      <Handle 
        type="source" 
        position={Position.Right} 
        id="source"
        style={{ 
          width: 8,
          height: 8,
          background: '#555',
          right: -4
        }} 
      />
      <div className="font-bold">{data.label}</div>
      {data.description && (
        <div className="text-xs text-gray-500">{data.description}</div>
      )}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="target"
        style={{ 
          width: 8,
          height: 8,
          background: '#555',
          left: -4
        }} 
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { label: 'Start', description: 'Game starts here' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 400, y: 50 },
    data: { label: 'Spawn Player', description: 'Player spawn point' },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 400, y: 150 },
    data: { label: 'Load Level', description: 'Load game level' },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    sourceHandle: 'source',
    targetHandle: 'target',
    type: 'smoothstep'
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3',
    sourceHandle: 'source',
    targetHandle: 'target',
    type: 'smoothstep'
  },
];

export function BlueprintGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#555' },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const onNodeDragStop = useCallback((_: any, node: Node) => {
    console.log('Node moved:', node);
  }, []);

  return (
    <div className="h-full w-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        nodesDraggable
        nodesConnectable
        elementsSelectable
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#555' },
        }}
      >
        <Background 
          gap={16} 
          size={1} 
          color="#e5e7eb" 
          className="bg-gray-800 text-white"
        />
        <Controls className="bg-gray-800 text-white p-1 rounded shadow" />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'custom') return '#fff';
            return '#eee';
          }}
          nodeStrokeWidth={3}
          nodeBorderRadius={2}
        />
      </ReactFlow>
    </div>
  );
}