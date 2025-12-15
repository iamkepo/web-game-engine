import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import type { Entity, PhysicsComponent } from "@wge/shared";

type BodyBinding = {
  body: RAPIER.RigidBody;
  object: THREE.Object3D;
};

export class PhysicsSystem {
  private world: RAPIER.World;
  private bindings = new Map<string, BodyBinding>();

  constructor() {
    this.world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  }

  addEntity(entity: Entity, object: THREE.Object3D): void {
    const physics = entity.components.physics;
    if (!physics) return;

    const transform = entity.components.transform;

    const bodyDesc = this.createBodyDesc(physics);

    if (transform) {
      bodyDesc.setTranslation(transform.position[0], transform.position[1], transform.position[2]);
      const q = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(transform.rotation[0], transform.rotation[1], transform.rotation[2])
      );
      bodyDesc.setRotation({ x: q.x, y: q.y, z: q.z, w: q.w });
    }

    if (physics.type === "dynamic" && typeof physics.mass === "number") {
      bodyDesc.setAdditionalMass(physics.mass);
    }

    const body = this.world.createRigidBody(bodyDesc);

    const colliderDesc = this.createColliderDesc(physics, transform?.scale);
    this.world.createCollider(colliderDesc, body);

    this.bindings.set(entity.id, { body, object });
  }

  stepFixed(): void {
    this.world.timestep = 1 / 60;
    this.world.step();

    for (const binding of this.bindings.values()) {
      const t = binding.body.translation();
      const r = binding.body.rotation();
      binding.object.position.set(t.x, t.y, t.z);
      binding.object.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  private createBodyDesc(physics: PhysicsComponent): RAPIER.RigidBodyDesc {
    if (physics.type === "dynamic") return RAPIER.RigidBodyDesc.dynamic();
    return RAPIER.RigidBodyDesc.fixed();
  }

  private createColliderDesc(physics: PhysicsComponent, scale?: [number, number, number]): RAPIER.ColliderDesc {
    const sx = scale?.[0] ?? 1;
    const sy = scale?.[1] ?? 1;
    const sz = scale?.[2] ?? 1;

    if (physics.collider === "sphere") {
      const r = Math.max(sx, sy, sz) * 0.5;
      return RAPIER.ColliderDesc.ball(r);
    }

    return RAPIER.ColliderDesc.cuboid(sx * 0.5, sy * 0.5, sz * 0.5);
  }
}
