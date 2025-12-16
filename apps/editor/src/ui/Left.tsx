import React from "react";
import type { SceneData } from "@wge/shared";

export function Left({
  scene,
  selectedEntityId,
  setSelectedEntityId
}: {
  scene: SceneData;
  selectedEntityId: string;
  setSelectedEntityId: (id: string) => void;
}): JSX.Element {
  return (
    <div style={{ padding: 12, color: "#ddd" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Entities</div>
      <div style={{ display: "grid", gap: 6 }}>
        {scene.entities.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedEntityId(e.id)}
            style={{
              textAlign: "left",
              background: e.id === selectedEntityId ? "#2a2a2a" : "#1a1a1a",
              color: "#ddd",
              border: "1px solid #333",
              padding: "6px 8px",
              cursor: "pointer"
            }}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16, fontWeight: 700, marginBottom: 8 }}>Assets</div>
      <div style={{ opacity: 0.8 }}>Coming soon (V1/V2).</div>
    </div>
  );
}

export default Left;