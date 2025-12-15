import React from "react";

export function EditorBoard({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "260px 1fr 300px" }}>
      <div style={{ borderRight: "1px solid #333" }}>Assets</div>
      <div style={{ background: "#111" }}>
        {children}
      </div>
      <div style={{ borderLeft: "1px solid #333" }}>Inspector</div>
    </div>
  );
}
