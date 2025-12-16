// apps/editor/src/ui/Inspector.tsx
import React from 'react';
import { useEditorStore } from '../store/editorStore';

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Component {
  type: string;
  [key: string]: any;
}

interface Material {
  [key: string]: any;
}

interface Entity {
  id: string;
  name: string;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  components?: Component[];
  materials?: Material[];
  [key: string]: any;
}

export function Inspector() {
  const { selectedEntityId, activeDocument, updateEntity } = useEditorStore();
  const entities = activeDocument?.data.entities || {};
  const selectedEntity = selectedEntityId ? entities[selectedEntityId] : null;

  if (!selectedEntity) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>No entity selected</p>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    if (!selectedEntityId) return;
    updateEntity(selectedEntityId, { ...selectedEntity, [field]: value });
  };

  const handleVectorChange = (field: 'position' | 'rotation' | 'scale', axis: 'x' | 'y' | 'z', value: string) => {
    if (!selectedEntityId) return;
    
    const numValue = parseFloat(value) || 0;
    const newValue = {
      ...selectedEntity[field],
      [axis]: numValue
    };
    
    updateEntity(selectedEntityId, {
      ...selectedEntity,
      [field]: newValue
    });
  };

  const handleScaleChange = (value: string) => {
    if (!selectedEntityId) return;
    
    const numValue = parseFloat(value) || 1;
    updateEntity(selectedEntityId, {
      ...selectedEntity,
      scale: { x: numValue, y: numValue, z: numValue }
    });
  };

  const renderVectorInput = (label: string, field: 'position' | 'rotation' | 'scale', step: string = '0.1') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">{axis.toUpperCase()}</span>
            <input
              type="number"
              className="w-full p-1 border rounded text-sm"
              value={selectedEntity[field]?.[axis] || 0}
              onChange={(e) => handleVectorChange(field, axis, e.target.value)}
              step={step}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={selectedEntity.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Transform</h3>
          <div className="space-y-4">
            {renderVectorInput('Position', 'position', '0.1')}
            {renderVectorInput('Rotation', 'rotation', '1')}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale: {selectedEntity.scale?.x?.toFixed(2) || '1.00'}
              </label>
              <input
                type="range"
                className="w-full"
                min="0.1"
                max="5"
                step="0.1"
                value={selectedEntity.scale?.x || 1}
                onChange={(e) => handleScaleChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Components</h3>
          <div className="space-y-2">
            <button 
              className="w-full p-2 border border-dashed rounded text-sm text-gray-500 hover:bg-gray-50"
              onClick={() => console.log('Add component clicked')}
            >
              + Add Component
            </button>
            
            {selectedEntity.components?.map((component, index) => (
              <div key={index} className="border rounded p-2 text-sm">
                <div className="font-medium">{component.type}</div>
                {/* Component properties would go here */}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Materials</h3>
          <div className="space-y-2">
            {selectedEntity.materials?.map((material, index) => (
              <div key={index} className="border rounded p-2 text-sm">
                <div className="font-medium">Material {index + 1}</div>
                {/* Material properties would go here */}
              </div>
            )) || <p className="text-sm text-gray-500">No materials</p>}
          </div>
        </div>
      </div>
    </div>
  );
}