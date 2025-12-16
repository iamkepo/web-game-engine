import { Engine } from "@wge/engine";
import { loadProjectData } from "./project/loadProjectData";
import { loadSceneIntoEngine } from "./project/loadSceneIntoEngine";
import { createPhysicsSystem } from "./physics/createPhysicsSystem";
import type { PhysicsSystem } from "./physics/PhysicsSystem";
import { BlueprintRuntime } from "./blueprint/BlueprintRuntime";

const canvas = document.querySelector<HTMLCanvasElement>("#app");
if (!canvas) throw new Error("Missing #app canvas");

const engine = new Engine({ canvas });
let physics: PhysicsSystem | undefined;
let blueprintRuntime: BlueprintRuntime | undefined;

const boot = async (): Promise<void> => {
  const data = await loadProjectData();
  const objectsByEntityId = await loadSceneIntoEngine(engine, data);
  physics = await createPhysicsSystem(data.scene, objectsByEntityId);

  if (data.blueprint) {
    blueprintRuntime = new BlueprintRuntime({
      engine,
      entities: data.scene.entities,
      objectsByEntityId,
      physics,
      blueprint: data.blueprint
    });
    blueprintRuntime.start();
  }
};

const tick = () => {
  physics?.stepFixed();
  engine.render();
  requestAnimationFrame(tick);
};

boot()
  .then(() => tick())
  .catch((err) => {
    console.error(err);
  });
