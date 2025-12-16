// apps/editor/src/types/entity.ts
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Component {
  type: string;
  [key: string]: any;
}

export interface Material {
  [key: string]: any;
}

export interface Entity {
  id: string;
  name: string;
  position?: Vector3;
  rotation?: Vector3;
  scale?: Vector3;
  components?: Component[];
  materials?: Material[];
  [key: string]: any;
}

export interface Entities {
  [id: string]: Entity;
}