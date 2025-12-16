export type Vec3 = [number, number, number];

export type TransformComponent = {
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

export type MeshComponent = {
  assetId: string;
};

export type PhysicsComponent = {
  type: "dynamic" | "static";
  collider: "box" | "sphere";
  mass?: number;
  isTrigger?: boolean;
};

export type LogicComponent = {
  graph: string;
};

export type BlueprintEventType =
  | "onStart"
  | "onClick"
  | "onCollision"
  | "onTriggerEnter"
  | "onTriggerExit"
  | "onKeyPress";

export type BlueprintActionType =
  | "move"
  | "rotate"
  | "scale"
  | "applyForce"
  | "playAnimation"
  | "setVisibility"
  | "destroyEntity";

export type BlueprintConditionType = "ifElse" | "compare" | "and" | "or";

export type BlueprintNode = {
  id: string;
  kind: "event" | "action" | "condition";
  op: BlueprintEventType | BlueprintActionType | BlueprintConditionType;
  params?: Record<string, unknown>;
};

export type BlueprintPortRef = {
  nodeId: string;
  port: string;
};

export type BlueprintEdge = {
  from: BlueprintPortRef;
  to: BlueprintPortRef;
};

export type BlueprintGraph = {
  id: string;
  name: string;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
};

export type BlueprintFile = {
  version: 2;
  graphs: BlueprintGraph[];
};

export type Entity = {
  id: string;
  name: string;
  components: {
    transform?: TransformComponent;
    mesh?: MeshComponent;
    physics?: PhysicsComponent;
    logic?: LogicComponent;
  };
};

export type SceneData = {
  entities: Entity[];
};

export type AssetIndexEntry = {
  type: "model";
  path: string;
  preview: string;
};

export type AssetIndex = Record<string, AssetIndexEntry>;
