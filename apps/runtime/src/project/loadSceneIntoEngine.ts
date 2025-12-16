import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { AssetIndex, Entity, SceneData } from "@wge/shared";
import type { Engine } from "@wge/engine";
import { applyTransform } from "./applyTransform";
import type { ProjectData } from "./loadProjectData";

const resolveAssetUrl = (assetsIndex: AssetIndex, assetId: string): string => {
  const entry = assetsIndex[assetId];
  if (!entry) throw new Error(`Missing asset in assets.index.json: ${assetId}`);
  return `./${entry.path}`;
};

const addEntity = async (engine: Engine, assetsIndex: AssetIndex, entity: Entity): Promise<void> => {
  const scene = engine.getThreeScene();

  const root = new THREE.Object3D();
  root.name = entity.name;

  const transform = entity.components.transform;
  if (transform) applyTransform(root, transform);

  scene.add(root);

  const mesh = entity.components.mesh;
  if (!mesh) return;

  const url = resolveAssetUrl(assetsIndex, mesh.assetId);

  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(url);
  root.add(gltf.scene);
};

export const loadSceneIntoEngine = async (
  engine: Engine,
  data: ProjectData
): Promise<Map<string, THREE.Object3D>> => {
  const objectsByEntityId = new Map<string, THREE.Object3D>();

  const tasks = data.scene.entities.map(async (e: Entity) => {
    const scene = engine.getThreeScene();

    const root = new THREE.Object3D();
    root.name = e.name;

    const transform = e.components.transform;
    if (transform) applyTransform(root, transform);

    scene.add(root);
    objectsByEntityId.set(e.id, root);

    const mesh = e.components.mesh;
    if (!mesh) {
      const physics = e.components.physics;
      if (!physics) return;

      const material = new THREE.MeshStandardMaterial({ color: 0x66ccff });

      if (physics.collider === "sphere") {
        const geo = new THREE.SphereGeometry(0.5, 24, 16);
        root.add(new THREE.Mesh(geo, material));
        return;
      }

      const geo = new THREE.BoxGeometry(1, 1, 1);
      root.add(new THREE.Mesh(geo, material));
      return;
    }

    const url = resolveAssetUrl(data.assetsIndex, mesh.assetId);
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    root.add(gltf.scene);
  });

  await Promise.all(tasks);
  return objectsByEntityId;
};
