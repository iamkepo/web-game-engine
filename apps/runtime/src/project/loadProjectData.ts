import type { AssetIndex, BlueprintFile, SceneData } from "@wge/shared";

export type ProjectData = {
  scene: SceneData;
  assetsIndex: AssetIndex;
  blueprint?: BlueprintFile;
};

const readEmbeddedJson = <T>(id: string): T | undefined => {
  const el = document.getElementById(id);
  if (!el) return undefined;

  const text = (el.textContent ?? "").trim();
  if (!text) return undefined;

  return JSON.parse(text) as T;
};

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
};

const fetchOptionalJson = async <T>(url: string): Promise<T | undefined> => {
  const res = await fetch(url, { cache: "no-cache" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
};

export const loadProjectData = async (): Promise<ProjectData> => {
  const embeddedScene = readEmbeddedJson<SceneData>("wge-scene");
  const embeddedAssetsIndex = readEmbeddedJson<AssetIndex>("wge-assets-index");
  const embeddedBlueprint = readEmbeddedJson<BlueprintFile>("wge-blueprints");

  if (embeddedScene && embeddedAssetsIndex) {
    const base: ProjectData = { scene: embeddedScene, assetsIndex: embeddedAssetsIndex };
    return embeddedBlueprint ? { ...base, blueprint: embeddedBlueprint } : base;
  }

  const [scene, assetsIndex, blueprint] = await Promise.all([
    fetchJson<SceneData>("./scene.json"),
    fetchJson<AssetIndex>("./assets.index.json"),
    fetchOptionalJson<BlueprintFile>("./blueprint.json")
  ]);

  const base: ProjectData = { scene, assetsIndex };
  return blueprint ? { ...base, blueprint } : base;
};
