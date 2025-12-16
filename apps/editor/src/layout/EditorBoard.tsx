import React from "react";

export function EditorBoard({
  left,
  right,
  children
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div style={{ height: "100vh", display: "grid", gridTemplateColumns: "260px 1fr 300px" }}>
      <div style={{ borderRight: "1px solid #333", overflow: "auto" }}>
        {left}
      </div>
      <div style={{ background: "#111" }}>
        {children}
      </div>
      <div style={{ borderLeft: "1px solid #333", overflow: "auto" }}>
        {right}
      </div>
    </div>
  );
}
