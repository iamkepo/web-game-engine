import React from 'react';
import { useEditorStore } from '../store/editorStore';
import { ChevronDown, ChevronRight, Box, Circle, Square, Triangle, Plus, Search } from 'lucide-react';

type Entity = {
  id: string;
  name: string;
  type: 'group' | 'mesh' | 'light' | 'camera';
  children?: Entity[];
  visible: boolean;
};

const EntityIcon = ({ type }: { type: Entity['type'] }) => {
  switch (type) {
    case 'group':
      return <Square className="w-4 h-4 text-blue-500" />;
    case 'mesh':
      return <Box className="w-4 h-4 text-green-500" />;
    case 'light':
      return <Circle className="w-4 h-4 text-yellow-500" />;
    case 'camera':
      return <Triangle className="w-4 h-4 text-purple-500" />;
    default:
      return <Box className="w-4 h-4" />;
  }
};

const EntityItem: React.FC<{
  entity: Entity;
  level?: number;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  selectedId: string | null;
}> = ({ entity, level = 0, onSelect, onToggleVisibility, selectedId }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const hasChildren = entity.children && entity.children.length > 0;
  const isSelected = selectedId === entity.id;

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(entity.id)}
      >
        {hasChildren ? (
          <button 
            className="w-4 h-4 flex items-center justify-center mr-1 text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-4 h-4 mr-1"></div>
        )}
        
        <button 
          className="mr-1 text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(entity.id);
          }}
        >
          {entity.visible ? '👁️' : '👁️‍🗨️'}
        </button>
        
        <EntityIcon type={entity.type} />
        <span className="ml-1 text-sm">{entity.name}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {entity.children?.map((child) => (
            <EntityItem
              key={child.id}
              entity={child}
              level={level + 1}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function SceneTree() {
  const { selectedEntityId, setSelectedEntity } = useEditorStore();
  
  // Mock data - in a real app, this would come from your scene graph
  const [entities, setEntities] = React.useState<Entity[]>([
    {
      id: 'scene',
      name: 'Scene',
      type: 'group',
      visible: true,
      children: [
        {
          id: 'camera-1',
          name: 'Main Camera',
          type: 'camera',
          visible: true,
        },
        {
          id: 'light-1',
          name: 'Directional Light',
          type: 'light',
          visible: true,
        },
        {
          id: 'group-1',
          name: 'Environment',
          type: 'group',
          visible: true,
          children: [
            {
              id: 'mesh-1',
              name: 'Ground',
              type: 'mesh',
              visible: true,
            },
            {
              id: 'mesh-2',
              name: 'Skybox',
              type: 'mesh',
              visible: true,
            },
          ],
        },
      ],
    },
  ]);

  const handleSelect = (id: string) => {
    setSelectedEntity(id);
  };

  const toggleVisibility = (id: string) => {
    const updateEntityVisibility = (items: Entity[]): Entity[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, visible: !item.visible };
        }
        if (item.children) {
          return { ...item, children: updateEntityVisibility(item.children) };
        }
        return item;
      });
    };

    setEntities(prevEntities => updateEntityVisibility(prevEntities));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-sm">Scene Hierarchy</h3>
        <div className="flex space-x-1">
          <button className="p-1 hover:bg-gray-100 rounded" title="Create New">
            <Plus size={16} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title="Search">
            <Search size={16} />
          </button>
        </div>
      </div>
      
      <div className="py-1">
        {entities.map((entity) => (
          <EntityItem
            key={entity.id}
            entity={entity}
            onSelect={handleSelect}
            onToggleVisibility={toggleVisibility}
            selectedId={selectedEntityId}
          />
        ))}
      </div>
    </div>
  );
}