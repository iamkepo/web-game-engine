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
};

export type Entity = {
  id: string;
  name: string;
  components: {
    transform?: TransformComponent;
    mesh?: MeshComponent;
    physics?: PhysicsComponent;
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
