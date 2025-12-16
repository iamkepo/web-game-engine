import React from "react";
import { EditorLayout } from "./layout/EditorLayout";
import { Viewport3D } from "./ui/Viewport3D";
import { MenuBar } from "./ui/MenuBar";
import { ToolBar } from "./ui/ToolBar";
import { SceneTree } from "./ui/SceneTree";
import { Inspector } from "./ui/Inspector";
import { AssetBrowser } from "./ui/AssetBrowser";
import { BlueprintGraph } from "./ui/BlueprintGraph";
import { StatsPanel } from "./ui/StatsPanel";

export function App(): JSX.Element {
  return (
    <EditorLayout
      menu={<MenuBar />}
      toolbar={<ToolBar />}

      sceneTree={<SceneTree />}

      inspector={<Inspector />}

      assetBrowser={<AssetBrowser />}

      viewport={<Viewport3D />}

      graph={<BlueprintGraph />}

      stats={<StatsPanel />}
    />
  );
}