import * as THREE from "three";
import type { TransformComponent } from "@wge/shared";

export const applyTransform = (obj: THREE.Object3D, transform: TransformComponent): void => {
  obj.position.set(transform.position[0], transform.position[1], transform.position[2]);
  obj.rotation.set(transform.rotation[0], transform.rotation[1], transform.rotation[2]);
  obj.scale.set(transform.scale[0], transform.scale[1], transform.scale[2]);
};
