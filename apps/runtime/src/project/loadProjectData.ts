import type { AssetIndex, SceneData } from "@wge/shared";

type ProjectData = {
  scene: SceneData;
  assetsIndex: AssetIndex;
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

export const loadProjectData = async (): Promise<ProjectData> => {
  const embeddedScene = readEmbeddedJson<SceneData>("wge-scene");
  const embeddedAssetsIndex = readEmbeddedJson<AssetIndex>("wge-assets-index");

  if (embeddedScene && embeddedAssetsIndex) {
    return { scene: embeddedScene, assetsIndex: embeddedAssetsIndex };
  }

  const [scene, assetsIndex] = await Promise.all([
    fetchJson<SceneData>("./scene.json"),
    fetchJson<AssetIndex>("./assets.index.json")
  ]);

  return { scene, assetsIndex };
};
