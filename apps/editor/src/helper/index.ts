// apps/editor/src/helper/index.ts
export type AssetType = 'folder' | 'model' | 'texture' | 'material' | 'script' | 'other';

// Helper function to determine file type
export const getFileType = (filename: string): AssetType => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return 'other';
  
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
  const modelTypes = ['fbx', 'glb', 'gltf', 'obj'];
  const scriptTypes = ['ts', 'js', 'tsx', 'jsx'];
  const materialTypes = ['mat', 'material'];
  
  if (imageTypes.includes(ext)) return 'texture';
  if (modelTypes.includes(ext)) return 'model';
  if (scriptTypes.includes(ext)) return 'script';
  if (materialTypes.includes(ext)) return 'material';
  return 'other';
};

// Helper function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};