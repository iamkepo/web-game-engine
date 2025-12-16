import React from 'react';
import { useEditorStore } from '../store/editorStore';

const transformTools = [
  { id: 'select', icon: '🖱️', label: 'Select (V)' },
  { id: 'move', icon: '✋', label: 'Move (W)' },
  { id: 'rotate', icon: '🔄', label: 'Rotate (E)' },
  { id: 'scale', icon: '📏', label: 'Scale (R)' },
];

const playControls = [
  { id: 'play', icon: '▶️', label: 'Play (Ctrl+P)' },
  { id: 'pause', icon: '⏸️', label: 'Pause' },
  { id: 'step', icon: '⏭️', label: 'Step' },
];

export function ToolBar() {
  const { 
    editorMode, 
    setEditorMode,
    activeDocument,
    saveScene,
    createNewScene
  } = useEditorStore();

  const handleToolClick = (toolId: string) => {
    console.log('Selected tool:', toolId);
    // Tool selection logic would go here
  };

  const handlePlayControl = (controlId: string) => {
    console.log('Play control:', controlId);
    // Play control logic would go here
  };

  if (!activeDocument) {
    return (
      <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 text-sm text-gray-500">
        No active document
        <button
          className="ml-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => createNewScene()}
        >
          Create New Scene
        </button>
      </div>
    );
  }

  return (
    <div className="h-10 bg-gray-100 border-b border-gray-200 flex items-center px-4 space-x-4">
      {/* Scene/Blueprint Toggle */}
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        <button
          className={`px-3 py-1 text-sm ${
            editorMode === 'scene' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setEditorMode('scene')}
        >
          Scene
        </button>
        <button
          className={`px-3 py-1 text-sm ${
            editorMode === 'blueprint' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => setEditorMode('blueprint')}
        >
          Blueprint
        </button>
      </div>

      <div className="h-6 border-l border-gray-300 mx-2"></div>

      {/* Transform Tools */}
      <div className="flex space-x-1">
        {transformTools.map((tool) => (
          <button
            key={tool.id}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
            title={tool.label}
            onClick={() => handleToolClick(tool.id)}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="h-6 border-l border-gray-300 mx-2"></div>

      {/* Play Controls */}
      <div className="flex space-x-1">
        {playControls.map((control) => (
          <button
            key={control.id}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200"
            title={control.label}
            onClick={() => handlePlayControl(control.id)}
          >
            {control.icon}
          </button>
        ))}
      </div>

      <div className="flex-1"></div>

      {/* Right-aligned actions */}
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={saveScene}
        >
          Save (Ctrl+S)
        </button>
      </div>
    </div>
  );
}