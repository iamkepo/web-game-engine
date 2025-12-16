import * as THREE from "three";
import type { Engine } from "@wge/engine";
import type { BlueprintFile, BlueprintGraph, BlueprintNode, BlueprintPortRef, Entity } from "@wge/shared";
import type { PhysicsEvent, PhysicsSystem } from "../physics/PhysicsSystem";

type Ctx = {
  entityId: string;
  otherEntityId?: string;
};

const edgeKey = (ref: BlueprintPortRef): string => `${ref.nodeId}:${ref.port}`;

export class BlueprintRuntime {
  private engine: Engine;
  private entitiesById = new Map<string, Entity>();
  private objectsByEntityId: Map<string, THREE.Object3D>;
  private physics: PhysicsSystem | undefined;
  private graphsById = new Map<string, BlueprintGraph>();

  private keydownHandler: ((ev: KeyboardEvent) => void) | undefined;
  private offPhysics: (() => void) | undefined;

  constructor(args: {
    engine: Engine;
    entities: Entity[];
    objectsByEntityId: Map<string, THREE.Object3D>;
    physics?: PhysicsSystem;
    blueprint: BlueprintFile;
  }) {
    this.engine = args.engine;
    this.objectsByEntityId = args.objectsByEntityId;
    this.physics = args.physics;

    for (const e of args.entities) this.entitiesById.set(e.id, e);
    for (const g of args.blueprint.graphs) this.graphsById.set(g.id, g);
  }

  start(): void {
    this.fireOnStart();

    this.keydownHandler = (ev: KeyboardEvent) => {
      this.fireOnKeyPress(ev.key);
    };

    window.addEventListener("keydown", this.keydownHandler);

    if (this.physics) {
      this.offPhysics = this.physics.onEvent((ev) => this.onPhysicsEvent(ev));
    }
  }

  dispose(): void {
    if (this.keydownHandler) window.removeEventListener("keydown", this.keydownHandler);
    this.keydownHandler = undefined;

    if (this.offPhysics) this.offPhysics();
    this.offPhysics = undefined;
  }

  private fireOnStart(): void {
    for (const e of this.entitiesById.values()) {
      const graphId = e.components.logic?.graph;
      if (!graphId) continue;

      const graph = this.graphsById.get(graphId);
      if (!graph) continue;

      const ctx: Ctx = { entityId: e.id };
      this.runEvent(graph, ctx, "onStart", undefined);
    }
  }

  private fireOnKeyPress(key: string): void {
    for (const e of this.entitiesById.values()) {
      const graphId = e.components.logic?.graph;
      if (!graphId) continue;

      const graph = this.graphsById.get(graphId);
      if (!graph) continue;

      const ctx: Ctx = { entityId: e.id };
      this.runEvent(graph, ctx, "onKeyPress", { key });
    }
  }

  private onPhysicsEvent(ev: PhysicsEvent): void {
    if (ev.type === "collisionStart") {
      this.fireForEntity(ev.a, "onCollision", { otherEntityId: ev.b });
      this.fireForEntity(ev.b, "onCollision", { otherEntityId: ev.a });
      return;
    }

    if (ev.type === "triggerEnter") {
      this.fireForEntity(ev.trigger, "onTriggerEnter", { otherEntityId: ev.other });
      return;
    }

    if (ev.type === "triggerExit") {
      this.fireForEntity(ev.trigger, "onTriggerExit", { otherEntityId: ev.other });
    }
  }

  private fireForEntity(entityId: string, op: string, ctxExtra?: { otherEntityId?: string }): void {
    const e = this.entitiesById.get(entityId);
    if (!e) return;
    const graphId = e.components.logic?.graph;
    if (!graphId) return;
    const graph = this.graphsById.get(graphId);
    if (!graph) return;
    const ctx: Ctx = { entityId };
    if (typeof ctxExtra?.otherEntityId === "string") ctx.otherEntityId = ctxExtra.otherEntityId;
    this.runEvent(graph, ctx, op, undefined);
  }

  private runEvent(
    graph: BlueprintGraph,
    ctx: Ctx,
    op: string,
    match?: { key?: string }
  ): void {
    const { nodes, outgoing } = this.indexGraph(graph);

    for (const n of nodes.values()) {
      if (n.kind !== "event") continue;
      if (n.op !== op) continue;

      if (op === "onKeyPress") {
        const expected = typeof n.params?.key === "string" ? n.params.key : undefined;
        if (expected && match?.key !== expected) continue;
      }

      this.runFromPort(graph, ctx, nodes, outgoing, { nodeId: n.id, port: "then" });
    }
  }

  private indexGraph(graph: BlueprintGraph): {
    nodes: Map<string, BlueprintNode>;
    outgoing: Map<string, BlueprintPortRef[]>;
  } {
    const nodes = new Map<string, BlueprintNode>();
    for (const n of graph.nodes) nodes.set(n.id, n);

    const outgoing = new Map<string, BlueprintPortRef[]>();
    for (const e of graph.edges) {
      const k = edgeKey(e.from);
      const list = outgoing.get(k);
      if (list) list.push(e.to);
      else outgoing.set(k, [e.to]);
    }

    return { nodes, outgoing };
  }

  private runFromPort(
    graph: BlueprintGraph,
    ctx: Ctx,
    nodes: Map<string, BlueprintNode>,
    outgoing: Map<string, BlueprintPortRef[]>,
    from: BlueprintPortRef
  ): void {
    const next = outgoing.get(edgeKey(from));
    if (!next) return;

    const budget = 128;
    let steps = 0;

    const queue: BlueprintPortRef[] = [...next];
    while (queue.length > 0) {
      if (steps++ > budget) return;

      const ref = queue.shift();
      if (!ref) continue;

      const node = nodes.get(ref.nodeId);
      if (!node) continue;

      if (node.kind === "action") {
        this.execAction(ctx, node);
        const out = outgoing.get(edgeKey({ nodeId: node.id, port: "out" }));
        if (out) queue.push(...out);
        continue;
      }

      if (node.kind === "condition") {
        const out = outgoing.get(edgeKey({ nodeId: node.id, port: "true" }));
        if (out) queue.push(...out);
        continue;
      }

      const out = outgoing.get(edgeKey({ nodeId: node.id, port: "then" }));
      if (out) queue.push(...out);
    }
  }

  private execAction(ctx: Ctx, node: BlueprintNode): void {
    const targetParam = typeof node.params?.targetEntityId === "string" ? node.params.targetEntityId : undefined;
    const targetEntityId =
      targetParam === "$other" ? ctx.otherEntityId ?? ctx.entityId : targetParam ?? ctx.entityId;

    const obj = this.objectsByEntityId.get(targetEntityId);
    if (!obj) return;

    if (node.op === "setVisibility") {
      const visible = typeof node.params?.visible === "boolean" ? node.params.visible : true;
      obj.visible = visible;
      return;
    }

    if (node.op === "destroyEntity") {
      obj.removeFromParent();
      this.objectsByEntityId.delete(targetEntityId);
      this.physics?.removeEntity(targetEntityId);
      return;
    }

    if (node.op === "move") {
      const d = node.params?.delta;
      if (Array.isArray(d) && d.length === 3) {
        const dx = Number(d[0]) || 0;
        const dy = Number(d[1]) || 0;
        const dz = Number(d[2]) || 0;
        obj.position.x += dx;
        obj.position.y += dy;
        obj.position.z += dz;
      }
      return;
    }

    if (node.op === "applyForce") {
      const imp = node.params?.impulse;
      if (Array.isArray(imp) && imp.length === 3) {
        const x = Number(imp[0]) || 0;
        const y = Number(imp[1]) || 0;
        const z = Number(imp[2]) || 0;
        this.physics?.applyImpulse(targetEntityId, { x, y, z });
      }
      return;
    }

    if (node.op === "rotate") {
      const e = node.params?.euler;
      if (Array.isArray(e) && e.length === 3) {
        const rx = Number(e[0]) || 0;
        const ry = Number(e[1]) || 0;
        const rz = Number(e[2]) || 0;
        obj.rotation.x += rx;
        obj.rotation.y += ry;
        obj.rotation.z += rz;
      }
    }

    if (node.op === "scale") {
      const s = node.params?.scale;
      if (Array.isArray(s) && s.length === 3) {
        const sx = Number(s[0]) || 1;
        const sy = Number(s[1]) || 1;
        const sz = Number(s[2]) || 1;
        obj.scale.set(obj.scale.x * sx, obj.scale.y * sy, obj.scale.z * sz);
      }
    }

    if (node.op === "playAnimation") {
      return;
    }
  }
}
