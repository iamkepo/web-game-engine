import { create } from "zustand";
import { Entity } from "../types/entity";

interface SceneData {
  entities: Record<string, Entity>;
}

export interface Document<T = any> {
  id: string;
  name: string;
  type: 'scene' | 'blueprint';
  lastModified: Date;
  unsavedChanges: boolean;
  data: T;
}

interface EditorState {
  // State
  documents: Document[];
  activeDocumentId: string | null;
  activeDocument: Document<SceneData> | null;
  selectedEntityId: string | null;
  activeGraphId: string | null;
  editorMode: "scene" | "blueprint";
  
  // Actions
  setSelectedEntity: (id: string | null) => void;
  setActiveGraph: (id: string | null) => void;
  setEditorMode: (mode: EditorState["editorMode"]) => void;
  createNewScene: () => void;
  saveScene: () => Promise<boolean>;
  loadScene: (id: string) => Promise<void>;
  updateDocument: (updates: Partial<Document>) => void;
  updateEntity: (entityId: string, updates: Partial<Entity>) => void;
};
export const useEditorStore = create<EditorState>((set, get) => ({
  // Initial State
  documents: [],
  activeDocumentId: null,
  activeDocument: null,
  entities: {},
  selectedEntityId: null,
  activeGraphId: null,
  editorMode: "scene",
  // Actions
  
  setSelectedEntity: (id) => set({ selectedEntityId: id }),
  setActiveGraph: (id) => set({ activeGraphId: id }),
  setEditorMode: (mode) => set({ editorMode: mode }),
  
  // Entity Actions
  updateEntity: (entityId, updates) => set((state) => {
    if (!state.activeDocument) return state;
    
    const currentEntities = state.activeDocument.data.entities || {};
    const currentEntity = currentEntities[entityId];
    
    if (!currentEntity) return state;

    // Create updated entity with required fields preserved
    const updatedEntity: Entity = {
      ...currentEntity,
      ...updates,
      id: currentEntity.id, // Preserve original ID
      name: updates.name ?? currentEntity.name, // Default to current name if not provided
    };

    // Create updated document
    const updatedDocument: Document<SceneData> = {
      ...state.activeDocument,
      data: {
        ...state.activeDocument.data,
        entities: {
          ...currentEntities,
          [entityId]: updatedEntity
        }
      },
      lastModified: new Date(),
      unsavedChanges: true,
    };

    return {
      ...state,
      activeDocument: updatedDocument,
      documents: state.documents.map(doc => 
        doc.id === state.activeDocumentId ? updatedDocument : doc
      )
    };
  }),
  
  // Document Actions
  createNewScene: () => {
    const newDoc: Document<SceneData> = {
      id: `doc-${Date.now()}`,
      name: `Untitled Scene ${get().documents.length + 1}`,
      type: 'scene',
      lastModified: new Date(),
      unsavedChanges: true,
      data: {
        entities: {}
      }
    };
    
    set((state) => ({
      documents: [...state.documents, newDoc],
      activeDocumentId: newDoc.id,
      activeDocument: newDoc,
    }));
  },

  
  saveScene: async () => {
    const { activeDocument } = get();
    if (!activeDocument) return false;
    
    // In a real app, this would be an API call
    console.log('Saving document:', activeDocument.id);
    
    // Simulate async save
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    const updatedDocument: Document<SceneData> = {
      ...activeDocument,
      lastModified: now,
      unsavedChanges: false
    };
    
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === activeDocument.id ? updatedDocument : doc
      ),
      activeDocument: updatedDocument
    }));
    
    return true;
  },
  
  loadScene: async (id: string) => {
    // In a real app, this would fetch the document
    const doc = get().documents.find(d => d.id === id);
    if (doc) {
      set({
        activeDocumentId: doc.id,
        activeDocument: doc,
        editorMode: doc.type === 'scene' ? 'scene' : 'blueprint'
      });
    }
  },
  
  updateDocument: (updates) => {
    const { activeDocument } = get();
    if (!activeDocument) return;
    
    const updatedDoc = { ...activeDocument, ...updates, lastModified: new Date() };
    
    set(state => ({
      documents: state.documents.map(doc => 
        doc.id === updatedDoc.id ? updatedDoc : doc
      ),
      activeDocument: updatedDoc
    }));
  }
}));