import React from "react";
import { NodeEditor, GetSchemes, ClassicPreset, getUID } from "rete";
import { AreaPlugin, AreaExtensions } from "rete-area-plugin";
import { ConnectionPlugin, Presets as ConnectionPresets } from "rete-connection-plugin";
import { ReactPlugin, Presets as ReactPresets, ReactArea2D, useRete } from "rete-react-plugin";
import { createRoot } from "react-dom/client";
import type { BlueprintEdge, BlueprintFile, BlueprintGraph, BlueprintNode, BlueprintEventType, BlueprintActionType, BlueprintConditionType } from "@wge/shared";

// Node Type Definitions
interface NodeTypeDef {
  kind: BlueprintNode['kind'];
  inputs: string[];
  outputs: string[];
  defaultParams?: Record<string, unknown>;
}

type NodeTypeMap = Record<string, NodeTypeDef>;

const NODE_TYPES: NodeTypeMap = {
  // Event Nodes
  onStart: { kind: 'event', inputs: [], outputs: ['then'] },
  onClick: { kind: 'event', inputs: [], outputs: ['then'] },
  onCollision: { kind: 'event', inputs: [], outputs: ['then'] },
  onTriggerEnter: { kind: 'event', inputs: [], outputs: ['then'] },
  onTriggerExit: { kind: 'event', inputs: [], outputs: ['then'] },
  onKeyPress: { 
    kind: 'event', 
    inputs: [], 
    outputs: ['then'],
    defaultParams: { key: 'Space' }
  },
  
  // Action Nodes
  move: { 
    kind: 'action', 
    inputs: ['in'], 
    outputs: ['out'],
    defaultParams: { delta: [0, 0, 0] }
  },
  rotate: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out'],
    defaultParams: { euler: [0, 0, 0] }
  },
  scale: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out'],
    defaultParams: { scale: [1, 1, 1] }
  },
  applyForce: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out'],
    defaultParams: { impulse: [0, 0, 0] }
  },
  setVisibility: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out'],
    defaultParams: { visible: true }
  },
  destroyEntity: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out']
  },
  playAnimation: {
    kind: 'action',
    inputs: ['in'],
    outputs: ['out']
  },
  
  // Condition Nodes
  ifElse: {
    kind: 'condition',
    inputs: ['in'],
    outputs: ['true', 'false']
  },
  compare: {
    kind: 'condition',
    inputs: ['in'],
    outputs: ['true', 'false']
  },
  and: {
    kind: 'condition',
    inputs: ['in'],
    outputs: ['true', 'false']
  },
  or: {
    kind: 'condition',
    inputs: ['in'],
    outputs: ['true', 'false']
  }
} as const;

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;

type AreaExtra = ReactArea2D<Schemes>;

type EditorWithDestroy = {
  editor: NodeEditor<Schemes>;
  destroy: () => void;
};

interface NodeMeta { 
  kind: BlueprintNode["kind"]; 
  op: BlueprintNode["op"]; 
  params?: BlueprintNode["params"];
  position?: { x: number; y: number };
}

type Props = {
  graphId: string;
  blueprint: BlueprintFile;
  onBlueprintChange: (next: BlueprintFile) => void;
};

const socket = new ClassicPreset.Socket("exec");

const getGraph = (blueprint: BlueprintFile, graphId: string): BlueprintGraph => {
  const found = blueprint.graphs.find((g) => g.id === graphId);
  if (found) return found;

  return { id: graphId, name: graphId, nodes: [], edges: [] };
};

const buildNode = async (
  editor: NodeEditor<Schemes>,
  meta: NodeMeta,
  id?: string,
  position?: { x: number; y: number }
): Promise<ClassicPreset.Node> => {
  const nodeType = NODE_TYPES[meta.op];
  if (!nodeType) {
    throw new Error(`Unknown node type: ${meta.op}`);
  }

  const label = `${meta.kind}:${meta.op}`;
  const node = new ClassicPreset.Node(label);
  if (id) node.id = id;

  // Store metadata on the node
  const nodeMeta: NodeMeta = { 
    ...meta, 
    kind: nodeType.kind, // Ensure kind matches the definition
    params: { 
      ...(nodeType.defaultParams || {}),
      ...(meta.params || {})
    },
    position: position || { x: 0, y: 0 }
  };
  
  (node as unknown as { __wge: NodeMeta }).__wge = nodeMeta;

  // Add inputs and outputs based on node type definition
  for (const input of nodeType.inputs) {
    node.addInput(input, new ClassicPreset.Input(socket, input));
  }
  
  for (const output of nodeType.outputs) {
    node.addOutput(output, new ClassicPreset.Output(socket, output));
  }

  await editor.addNode(node);
  return node;
};

const getNodeMeta = (n: ClassicPreset.Node): NodeMeta | undefined => {
  const m = (n as unknown as { __wge?: NodeMeta }).__wge;
  if (m) return m;
  return undefined;
};

const exportGraph = (editor: NodeEditor<Schemes>, graphId: string, prev: BlueprintFile): BlueprintFile => {
  const nodes: BlueprintNode[] = [];
  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  // Export nodes with their metadata
  for (const n of editor.getNodes() as ClassicPreset.Node[]) {
    const meta = getNodeMeta(n);
    if (!meta) continue;
    
    // Create a clean params object without undefined values
    const params = meta.params ? { ...meta.params } : undefined;
    if (params) {
      // Remove any undefined or null values from params
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });
    }
    
    nodes.push({
      id: String(n.id),
      kind: meta.kind,
      op: meta.op,
      ...(params && Object.keys(params).length > 0 ? { params } : {})
    });
    
    // Store node positions for reference (not part of BlueprintNode type)
    if (meta.position) {
      nodePositions[String(n.id)] = meta.position;
    }
  }

  // Export connections
  const edges: BlueprintEdge[] = [];
  for (const conn of editor.getConnections() as any[]) {
    const sourceId = conn.source && typeof conn.source === 'object' ? 
      String(conn.source.id) : String(conn.source);
    const targetId = conn.target && typeof conn.target === 'object' ? 
      String(conn.target.id) : String(conn.target);
    
    const sourcePort = String(conn.sourceOutput || conn.output || 'then');
    const targetPort = String(conn.targetInput || conn.input || 'in');

    edges.push({
      from: { nodeId: sourceId, port: sourcePort },
      to: { nodeId: targetId, port: targetPort }
    });
  }

  // Create the graph with deterministic property order
  const nextGraph: BlueprintGraph = {
    id: graphId,
    name: graphId,
    nodes: [...nodes].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges].sort((a, b) => 
      a.from.nodeId.localeCompare(b.from.nodeId) || 
      a.from.port.localeCompare(b.from.port) ||
      a.to.nodeId.localeCompare(b.to.nodeId) ||
      a.to.port.localeCompare(b.to.port)
    )
  };

  // Update or add the graph
  const graphIndex = prev.graphs.findIndex(g => g.id === graphId);
  const graphs = [...prev.graphs];
  
  if (graphIndex >= 0) {
    graphs[graphIndex] = nextGraph;
  } else {
    graphs.push(nextGraph);
  }

  // Return a new object with deterministic property order
  return {
    version: 2,
    graphs: graphs.sort((a, b) => a.id.localeCompare(b.id))
  };
};

export function BlueprintGraphEditor({ graphId, blueprint, onBlueprintChange }: Props): JSX.Element {
  const graph = React.useMemo(() => getGraph(blueprint, graphId), [blueprint, graphId]);

  const createEditor = React.useCallback(
    async (container: HTMLElement): Promise<EditorWithDestroy> => {
      const editor = new NodeEditor<Schemes>();

      const area = new AreaPlugin<Schemes, AreaExtra>(container);
      const render = new ReactPlugin<Schemes, AreaExtra>({ createRoot });
      render.addPreset(ReactPresets.classic.setup());

      const connections = new ConnectionPlugin<Schemes, AreaExtra>();
      connections.addPreset(ConnectionPresets.classic.setup());

      editor.use(area);
      area.use(render);
      area.use(connections);

      AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
        accumulating: AreaExtensions.accumulateOnCtrl()
      });
      AreaExtensions.simpleNodesOrder(area);

      const nodesById = new Map<string, ClassicPreset.Node>();
      const nodePositions = new Map<string, { x: number; y: number }>();

      // Function to add a node with position tracking
      const addNode = async (meta: NodeMeta, id: string, x: number, y: number) => {
        const node = await buildNode(editor, meta, id, { x, y });
        nodesById.set(id, node);
        nodePositions.set(id, { x, y });
        await area.translate(node.id, { x, y });
        return node;
      };

      if (graph.nodes.length === 0) {
        // Create default nodes for an empty graph
        const ev = await addNode(
          { kind: "event", op: "onStart" },
          `n-${getUID()}`,
          0, 0
        );
        
        const act = await addNode(
          { 
            kind: "action", 
            op: "applyForce",
            params: { impulse: [0, 5, 0] }
          },
          `n-${getUID()}`,
          300, 0
        );

        await editor.addConnection(new ClassicPreset.Connection(ev, "then", act, "in"));
        AreaExtensions.zoomAt(area, editor.getNodes());
      } else {
        // Position nodes in a grid
        const GRID_COLS = 3;
        const NODE_WIDTH = 250;
        const NODE_HEIGHT = 100;
        const PADDING = 20;
        
        // Group nodes by type for better layout
        const events = graph.nodes.filter(n => n.kind === 'event');
        const conditions = graph.nodes.filter(n => n.kind === 'condition');
        const actions = graph.nodes.filter(n => n.kind === 'action');
        
        const allNodes = [...events, ...conditions, ...actions];
        
        // Create nodes and track their positions
        for (let i = 0; i < allNodes.length; i++) {
          const n = allNodes[i];
          if (!n) continue; // Skip if node is undefined
          
          const row = Math.floor(i / GRID_COLS);
          const col = i % GRID_COLS;
          const x = col * (NODE_WIDTH + PADDING) + PADDING;
          const y = row * (NODE_HEIGHT + PADDING) + PADDING;
          
          // Try to use saved position if available
          const savedPos = n.params?.position as { x: number; y: number } | undefined;
          const pos = savedPos || { x, y };
          
          // Remove position from params before creating the node
          const { position: _, ...cleanParams } = n.params || {};
          
          const node = await buildNode(
            editor, 
            { 
              kind: n.kind, 
              op: n.op as any, 
              params: cleanParams
            }, 
            n.id,
            pos
          );
          
          nodesById.set(n.id, node);
          nodePositions.set(n.id, pos);
        }

        // Create connections
        for (const e of graph.edges) {
          const sourceNode = nodesById.get(e.from.nodeId);
          const targetNode = nodesById.get(e.to.nodeId);
          
          if (!sourceNode || !targetNode) continue;
          
          try {
            await editor.addConnection(
              new ClassicPreset.Connection(
                sourceNode, 
                e.from.port || 'then', 
                targetNode, 
                e.to.port || 'in'
              )
            );
          } catch (err) {
            console.warn('Failed to create connection:', e, err);
          }
        }
        
        // Zoom to fit all nodes
        if (allNodes.length > 0) {
          AreaExtensions.zoomAt(area, editor.getNodes());
        }
      }

      return {
        editor,
        destroy: () => {
          area.destroy();
        }
      };
    },
    [graph]
  );

  const [ref, editor] = useRete<EditorWithDestroy>(createEditor);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Graph: {graphId}</div>
        <button
          onClick={() => {
            if (!editor?.editor) return;
            onBlueprintChange(exportGraph(editor.editor, graphId, blueprint));
          }}
          style={{
            background: "#1a1a1a",
            color: "#ddd",
            border: "1px solid #333",
            padding: "6px 8px",
            cursor: "pointer"
          }}
        >
          Export to blueprint.json
        </button>
      </div>

      <div
        ref={ref}
        style={{
          height: 340,
          border: "1px solid #333",
          background: "#0f0f0f"
        }}
      />
    </div>
  );
}

export default BlueprintGraphEditor;
