import type { SceneData } from "@wge/shared";
import type * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import { PhysicsSystem } from "./PhysicsSystem";

export const createPhysicsSystem = async (
  scene: SceneData,
  objectsByEntityId: Map<string, THREE.Object3D>
): Promise<PhysicsSystem> => {
  await RAPIER.init();

  const physics = new PhysicsSystem();

  for (const entity of scene.entities) {
    const obj = objectsByEntityId.get(entity.id);
    if (!obj) continue;
    physics.addEntity(entity, obj);
  }

  return physics;
};
