import * as THREE from "three";
import RAPIER from "@dimforge/rapier3d-compat";
import type { Entity, PhysicsComponent } from "@wge/shared";

type BodyBinding = {
  body: RAPIER.RigidBody;
  object: THREE.Object3D;
};

export type PhysicsEvent =
  | { type: "collisionStart"; a: string; b: string }
  | { type: "collisionEnd"; a: string; b: string }
  | { type: "triggerEnter"; trigger: string; other: string }
  | { type: "triggerExit"; trigger: string; other: string };

type ColliderBinding = {
  entityId: string;
  isTrigger: boolean;
};

export class PhysicsSystem {
  private world: RAPIER.World;
  private bindings = new Map<string, BodyBinding>();
  private eventQueue = new RAPIER.EventQueue(true);
  private colliderBindings = new Map<number, ColliderBinding>();
  private listeners = new Set<(ev: PhysicsEvent) => void>();

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
    colliderDesc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
    if (physics.isTrigger) colliderDesc.setSensor(true);
    const collider = this.world.createCollider(colliderDesc, body);
    this.colliderBindings.set(collider.handle, { entityId: entity.id, isTrigger: !!physics.isTrigger });

    this.bindings.set(entity.id, { body, object });
  }

  stepFixed(): void {
    this.world.timestep = 1 / 60;
    this.world.step(this.eventQueue);

    this.eventQueue.drainCollisionEvents((h1, h2, started) => {
      const a = this.colliderBindings.get(h1);
      const b = this.colliderBindings.get(h2);
      if (!a || !b) return;

      if (a.isTrigger || b.isTrigger) {
        if (started) {
          if (a.isTrigger) this.emit({ type: "triggerEnter", trigger: a.entityId, other: b.entityId });
          if (b.isTrigger) this.emit({ type: "triggerEnter", trigger: b.entityId, other: a.entityId });
        } else {
          if (a.isTrigger) this.emit({ type: "triggerExit", trigger: a.entityId, other: b.entityId });
          if (b.isTrigger) this.emit({ type: "triggerExit", trigger: b.entityId, other: a.entityId });
        }

        return;
      }

      this.emit({ type: started ? "collisionStart" : "collisionEnd", a: a.entityId, b: b.entityId });
    });

    for (const binding of this.bindings.values()) {
      const t = binding.body.translation();
      const r = binding.body.rotation();
      binding.object.position.set(t.x, t.y, t.z);
      binding.object.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  onEvent(listener: (ev: PhysicsEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  applyImpulse(entityId: string, impulse: { x: number; y: number; z: number }): void {
    const binding = this.bindings.get(entityId);
    if (!binding) return;
    binding.body.applyImpulse(impulse, true);
  }

  removeEntity(entityId: string): void {
    const binding = this.bindings.get(entityId);
    if (!binding) return;
    this.world.removeRigidBody(binding.body);
    this.bindings.delete(entityId);

    for (const [handle, meta] of this.colliderBindings) {
      if (meta.entityId === entityId) this.colliderBindings.delete(handle);
    }
  }

  private emit(ev: PhysicsEvent): void {
    for (const l of this.listeners) l(ev);
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
