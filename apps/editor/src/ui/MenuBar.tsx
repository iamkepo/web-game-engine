import React from 'react';
import { useEditorStore } from '../store/editorStore';

export function MenuBar() {
  const { activeDocument, createNewScene, saveScene, loadScene } = useEditorStore();

  return (
    <div className="flex items-center h-8 px-4 bg-gray-800 text-white text-sm">
      <div className="mr-4 font-semibold">Web Game Engine</div>
      
      <div className="menu-group">
        <button className="px-2 py-1 hover:bg-gray-700 rounded" onClick={createNewScene}>
          File
        </button>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" disabled={!activeDocument}>
          Edit
        </button>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" disabled={!activeDocument}>
          View
        </button>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" disabled={!activeDocument}>
          Scene
        </button>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" disabled={!activeDocument}>
          Tools
        </button>
        <button className="px-2 py-1 hover:bg-gray-700 rounded" disabled={!activeDocument}>
          Help
        </button>
      </div>
      
      <div className="ml-auto">
        {activeDocument && (
          <span className="text-xs text-gray-400">
            {activeDocument.name} {activeDocument.unsavedChanges && '(unsaved)'}
          </span>
        )}
      </div>
    </div>
  );
}