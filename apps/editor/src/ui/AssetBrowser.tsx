import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  Image, 
  Box, 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Grid, 
  List, 
  ChevronDown,
  ChevronRight,
  FolderPlus 
} from 'lucide-react';

import { AssetType, getFileType, formatFileSize } from '../helper';

interface Asset {
  id: string;
  name: string;
  type: AssetType; // Now using the imported type
  path: string;
  size?: string;
  modified: string | undefined;
  children?: Asset[];
}

const AssetIcon = ({ type, size = 4 }: { type: AssetType; size?: number }) => {
  const className = `w-${size} h-${size} text-gray-500`;
  
  switch (type) {
    case 'folder':
      return <Folder className={className} />;
    case 'model':
      return <Box className={className} />;
    case 'texture':
      return <Image className={className} />;
    case 'script':
      return <FileText className={className} />;
    default:
      return <File className={className} />;
  }
};

const AssetItem: React.FC<{ 
  asset: Asset; 
  onSelect: (asset: Asset) => void;
  selectedId: string | null;
}> = ({ asset, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = asset.children && asset.children.length > 0;
  const isSelected = selectedId === asset.id;

  return (
    <div>
      <div 
        className={`flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
        onClick={() => onSelect(asset)}
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
        
        <div className="flex items-center flex-1 min-w-0">
          <div className="mr-2">
            <AssetIcon type={asset.type} size={4} />
          </div>
          <span className="truncate text-sm">{asset.name}</span>
        </div>
        
        {asset.size && (
          <span className="text-xs text-gray-500 ml-2">{asset.size}</span>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-4">
          {asset.children?.map((child) => (
            <AssetItem
              key={child.id}
              asset={child}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export function AssetBrowser() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - in a real app, this would come from your asset management system
  const [assets, setAssets] = useState<Asset>({
    id: 'root',
    name: 'Assets',
    type: 'folder',
    path: '/',
    modified: '2023-05-15',
    children: [
      {
        id: 'models',
        name: 'Models',
        type: 'folder',
        path: '/Models',
        modified: '2023-05-10',
        children: [
          {
            id: 'character',
            name: 'Character.fbx',
            type: 'model',
            path: '/Models/Character.fbx',
            size: '2.4 MB',
            modified: '2023-05-08',
          },
          {
            id: 'environment',
            name: 'Environment.glb',
            type: 'model',
            path: '/Models/Environment.glb',
            size: '5.1 MB',
            modified: '2023-05-05',
          },
        ],
      },
      {
        id: 'textures',
        name: 'Textures',
        type: 'folder',
        path: '/Textures',
        modified: '2023-05-12',
        children: [
          {
            id: 'albedo',
            name: 'Albedo.png',
            type: 'texture',
            path: '/Textures/Albedo.png',
            size: '1.2 MB',
            modified: '2023-05-10',
          },
          {
            id: 'normal',
            name: 'Normal.png',
            type: 'texture',
            path: '/Textures/Normal.png',
            size: '1.2 MB',
            modified: '2023-05-10',
          },
        ],
      },
      {
        id: 'scripts',
        name: 'Scripts',
        type: 'folder',
        path: '/Scripts',
        modified: '2023-05-14',
        children: [
          {
            id: 'player',
            name: 'PlayerController.ts',
            type: 'script',
            path: '/Scripts/PlayerController.ts',
            size: '24 KB',
            modified: '2023-05-12',
          },
        ],
      },
    ],
  });

  const handleSelect = (asset: Asset) => {
    setSelectedAsset(asset.id);
    // In a real app, you might want to preview the asset or load it into the editor
    console.log('Selected asset:', asset);
  };

const handleUpload = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.onchange = (e: Event) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      Array.from(files).forEach(file => {
        const fileType = getFileType(file.name);
        const newFile: Asset = {
          id: `file-${Date.now()}-${file.name}`,
          name: file.name,
          type: fileType,
          path: `/${file.name}`,
          size: formatFileSize(file.size),
          modified: new Date(file.lastModified).toISOString().split('T')[0]
        };

        setAssets(prev => ({
          ...prev,
          children: [...(prev.children || []), newFile]
        }));
      });
    }
  };
  input.click();
};

const handleCreateFolder = () => {
  const newFolder: Asset = {
    id: `folder-${Date.now()}`,
    name: 'New Folder',
    type: 'folder',
    path: '/New Folder',
    modified: new Date().toISOString().split('T')[0],
    children: []
  };

  setAssets(prev => ({
    ...prev,
    children: [...(prev.children || []), newFolder]
  }));
};

// Helper function to determine file type
const getFileType = (filename: string): AssetType => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const modelTypes = ['fbx', 'glb', 'gltf', 'obj'];
  const scriptTypes = ['ts', 'js', 'tsx', 'jsx'];
  
  if (imageTypes.includes(ext)) return 'texture';
  if (modelTypes.includes(ext)) return 'model';
  if (scriptTypes.includes(ext)) return 'script';
  return 'other';
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-sm">Assets</h3>
        <div className="flex space-x-1">
          <button 
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={16} />
          </button>
          <button 
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-2 border-b border-gray-200 flex space-x-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            className="w-full pl-8 pr-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          onClick={handleUpload}
          title="Upload Asset"
        >
          <Upload size={16} />
        </button>
        <button 
          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
          onClick={handleCreateFolder}
          title="Create Folder"
        >
          <FolderPlus size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-1">
        <AssetItem 
          asset={assets} 
          onSelect={handleSelect} 
          selectedId={selectedAsset} 
        />
      </div>
      
      <div className="p-2 border-t border-gray-200 text-xs text-gray-500">
        {selectedAsset ? `Selected: ${selectedAsset}` : 'No asset selected'}
      </div>
    </div>
  );
}