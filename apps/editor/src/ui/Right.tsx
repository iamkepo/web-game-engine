import React from "react";
import type { Entity } from "@wge/shared";
import type { BlueprintFile } from "@wge/shared";
import { BlueprintGraphEditor } from "./BlueprintGraphEditor";

export function Right({
  selectedEntity,
  graphIds,
  updateEntity,
  blueprint,
  onBlueprintChange,
  applyBlueprintJson,
  blueprintText,
  setBlueprintText,
  blueprintError
}: {
  selectedEntity: Entity | undefined;
  graphIds: string[];
  updateEntity: (entityId: string, updater: (e: Entity) => Entity) => void;
  blueprint: BlueprintFile;
  onBlueprintChange: (next: BlueprintFile) => void;
  applyBlueprintJson: () => void;
  blueprintText: string;
  setBlueprintText: (txt: string) => void;
  blueprintError: string | null;
}): JSX.Element {
  const graphId = selectedEntity?.components.logic?.graph ?? graphIds[0] ?? "blueprint-1";

  return (
    <div style={{ padding: 12, color: "#ddd", display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Inspector</div>
        {!selectedEntity ? (
          <div style={{ opacity: 0.8 }}>No selection</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <div style={{ opacity: 0.8, fontSize: 12 }}>Entity</div>
              <div>{selectedEntity.name}</div>
              <div style={{ opacity: 0.6, fontSize: 12 }}>{selectedEntity.id}</div>
            </div>

            <div>
              <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 4 }}>Logic graph (V2)</div>
              <select
                aria-label="Logic graph"
                value={selectedEntity.components.logic?.graph ?? ""}
                onChange={(ev) => {
                  const graph = ev.target.value;
                  updateEntity(selectedEntity.id, (prev) => {
                    if (!graph) {
                      const { logic, ...rest } = prev.components;
                      return { ...prev, components: { ...rest } };
                    }
                    return { ...prev, components: { ...prev.components, logic: { graph } } };
                  });
                }}
                style={{ width: "100%", background: "#111", color: "#ddd", border: "1px solid #333" }}
              >
                <option value="">(none)</option>
                {graphIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            <pre
              style={{
                background: "#111",
                border: "1px solid #333",
                padding: 8,
                margin: 0,
                overflow: "auto",
                maxHeight: 220
              }}
            >
              {JSON.stringify(selectedEntity, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Blueprint</div>
        <div style={{ opacity: 0.8, fontSize: 12, marginBottom: 6 }}>
          Editing in-memory blueprint.json (V2). Runtime loads blueprint.json at export time.
        </div>

        <BlueprintGraphEditor
          key={graphId}
          graphId={graphId}
          blueprint={blueprint}
          onBlueprintChange={onBlueprintChange}
        />

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={applyBlueprintJson}
              style={{
                background: "#1a1a1a",
                color: "#ddd",
                border: "1px solid #333",
                padding: "6px 8px",
                cursor: "pointer"
              }}
            >
              Apply JSON
            </button>
            {blueprintError ? (
              <div style={{ color: "#ff8080", fontSize: 12 }}>{blueprintError}</div>
            ) : (
              <div style={{ color: "#80ff80", fontSize: 12 }}>OK</div>
            )}
          </div>

          <textarea
            aria-label="Blueprint JSON"
            value={blueprintText}
            onChange={(ev) => setBlueprintText(ev.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: 260,
              background: "#111",
              color: "#ddd",
              border: "1px solid #333",
              padding: 8,
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: 12
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Right;