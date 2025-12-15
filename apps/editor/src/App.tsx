import React from "react";
import { EditorBoard } from "./layout/EditorBoard";
import { Viewport3D } from "./ui/Viewport3D";

export function App(): JSX.Element {
  return (
    <EditorBoard>
      <Viewport3D />
    </EditorBoard>
  );
}
