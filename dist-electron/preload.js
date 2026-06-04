import { contextBridge as e } from "electron";
//#region electron/preload.ts
e.exposeInMainWorld("electronAPI", {
	platform: process.platform,
	isElectron: !0
});
//#endregion
export {};
