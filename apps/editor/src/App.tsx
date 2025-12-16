import React from "react";
import { EditorBoard } from "./layout/EditorBoard";
import { Viewport3D } from "./ui/Viewport3D";
import type { BlueprintFile, Entity, SceneData } from "@wge/shared";
import Left from "./ui/Left";
import Right from "./ui/Right";

const initialScene: SceneData = {
  entities: [
    {
      id: "ground",
      name: "Ground",
      components: {
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [10, 1, 10]
        },
        physics: {
          type: "static",
          collider: "box"
        }
      }
    },
    {
      id: "cube",
      name: "Cube",
      components: {
        transform: {
          position: [0, 5, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        },
        physics: {
          type: "dynamic",
          collider: "box",
          mass: 1
        }
      }
    }
  ]
};

const initialBlueprint: BlueprintFile = {
  version: 2,
  graphs: [
    {
      id: "blueprint-1",
      name: "Cube Interactions",
      nodes: [
        { id: "ev-start", kind: "event", op: "onStart" },
        {
          id: "act-boost",
          kind: "action",
          op: "applyForce",
          params: { impulse: [0, 8, 0] }
        },
        { id: "ev-space", kind: "event", op: "onKeyPress", params: { key: " " } },
        {
          id: "act-jump",
          kind: "action",
          op: "applyForce",
          params: { impulse: [0, 6, 0] }
        }
      ],
      edges: [
        { from: { nodeId: "ev-start", port: "then" }, to: { nodeId: "act-boost", port: "in" } },
        { from: { nodeId: "ev-space", port: "then" }, to: { nodeId: "act-jump", port: "in" } }
      ]
    }
  ]
};

export function App(): JSX.Element {
  const [scene, setScene] = React.useState<SceneData>(initialScene);
  const [blueprint, setBlueprint] = React.useState<BlueprintFile>(initialBlueprint);
  const [selectedEntityId, setSelectedEntityId] = React.useState<string>(scene.entities[0]?.id ?? "");
  const [blueprintText, setBlueprintText] = React.useState<string>(
    JSON.stringify(initialBlueprint, null, 2)
  );
  const [blueprintError, setBlueprintError] = React.useState<string | null>(null);

  const selectedEntity = scene.entities.find((e) => e.id === selectedEntityId);

  const graphIds = React.useMemo(() => blueprint.graphs.map((g) => g.id), [blueprint]);

  const updateEntity = React.useCallback((entityId: string, updater: (e: Entity) => Entity) => {
    setScene((prev) => ({
      ...prev,
      entities: prev.entities.map((e) => (e.id === entityId ? updater(e) : e))
    }));
  }, []);

  const applyBlueprintJson = React.useCallback(() => {
    try {
      const parsed = JSON.parse(blueprintText) as BlueprintFile;
      if (parsed.version !== 2) throw new Error("Invalid blueprint.json: version must be 2");
      if (!Array.isArray(parsed.graphs)) throw new Error("Invalid blueprint.json: graphs must be an array");
      setBlueprint(parsed);
      setBlueprintError(null);
    } catch (err) {
      setBlueprintError(err instanceof Error ? err.message : String(err));
    }
  }, [blueprintText]);

  const onBlueprintChange = React.useCallback((next: BlueprintFile) => {
    setBlueprint(next);
    setBlueprintText(JSON.stringify(next, null, 2));
    setBlueprintError(null);
  }, []);

  return (
    <EditorBoard
      left={
        <Left
          scene={scene}
          selectedEntityId={selectedEntityId}
          setSelectedEntityId={setSelectedEntityId}
        />
      }
      right={
        <Right
          selectedEntity={selectedEntity}
          graphIds={graphIds}
          updateEntity={updateEntity}
          blueprint={blueprint}
          onBlueprintChange={onBlueprintChange}
          applyBlueprintJson={applyBlueprintJson}
          blueprintText={blueprintText}
          setBlueprintText={setBlueprintText}
          blueprintError={blueprintError}
        />
      }
    >
      <Viewport3D />
    </EditorBoard>
  );
}
