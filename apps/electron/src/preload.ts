import { contextBridge } from "electron";

contextBridge.exposeInMainWorld("wge", {
  version: "0.0.0"
});

declare global {
  interface Window {
    wge: {
      version: string;
    };
  }
}
