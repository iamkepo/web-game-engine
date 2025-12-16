import React from "react";
import { useEditorStore } from "../store/editorStore";

export function EditorLayout(props: {
  menu: React.ReactNode;
  toolbar: React.ReactNode;
  sceneTree: React.ReactNode;
  inspector: React.ReactNode;
  assetBrowser: React.ReactNode;
  viewport: React.ReactNode;
  graph: React.ReactNode;
  stats: React.ReactNode;
}) {
  const {
    menu,
    toolbar,
    sceneTree,
    inspector,
    assetBrowser,
    viewport,
    graph,
    stats
  } = props;
  const editorStore = useEditorStore();
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Menu Bar */}
      <div className="bg-gray-800 text-white p-2 shadow-md">
        {menu}
      </div>
      
      {/* Toolbar */}
      <div className="bg-gray-200 dark:bg-gray-700 p-2 border-b border-gray-300 dark:border-gray-600">
        {toolbar}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-2 p-2 overflow-hidden">
        {/* Scene Tree - Left Panel */}
        <div className="col-span-2 row-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 overflow-y-auto">
          <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Scene Tree</h3>
          <div className="space-y-1">
            {sceneTree}
          </div>
        </div>

        {/* Viewport - Center Panel */}
        <div className="col-span-8 row-span-4 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {editorStore.editorMode === "scene" && viewport}
          {editorStore.editorMode === "blueprint" && graph}
        </div>

        {/* Asset Browser - Bottom Left Panel */}
        <div className="col-span-2 row-span-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 overflow-y-auto">
          <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Assets</h3>
          <div className="space-y-2">
            {assetBrowser}
          </div>
        </div>

        {/* Inspector - Right Panel */}
        <div className="col-span-8 row-span-2 grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 overflow-y-auto">
            <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Inspector</h3>
            {inspector}
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 overflow-y-auto">
            <h3 className="font-semibold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">Stats</h3>
            {stats}
          </div>
        </div>
      </div>
    </div>
  );
}