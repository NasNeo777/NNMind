import { BrowserWindow as e, Menu as t, Tray as n, app as r, nativeImage as i, shell as a } from "electron";
import { dirname as o, join as s } from "node:path";
import { fileURLToPath as c } from "node:url";
//#region electron/main.ts
var l = o(c(import.meta.url)), u = null, d = null, f = !1;
function p() {
	let e = Buffer.alloc(256 * 4);
	for (let t = 0; t < 16; t++) for (let n = 0; n < 16; n++) {
		let r = (t * 16 + n) * 4, i = n < 2, a = n >= 14, o = Math.abs(n - t) <= 1, s = i || a || o;
		e[r] = 255, e[r + 1] = 255, e[r + 2] = 255, e[r + 3] = s ? 255 : 0;
	}
	return i.createFromBuffer(e, {
		width: 16,
		height: 16
	});
}
function m() {
	u = new e({
		width: 1400,
		height: 900,
		minWidth: 900,
		minHeight: 600,
		title: "NNMind",
		webPreferences: {
			preload: s(l, "preload.js"),
			contextIsolation: !0,
			nodeIntegration: !1
		}
	}), u.webContents.setWindowOpenHandler(({ url: e }) => ((e.startsWith("https:") || e.startsWith("http:")) && a.openExternal(e), { action: "deny" })), process.env.VITE_DEV_SERVER_URL ? (u.loadURL(process.env.VITE_DEV_SERVER_URL), u.webContents.openDevTools()) : u.loadFile(s(l, "../dist/index.html")), u.on("close", (e) => {
		f || (e.preventDefault(), u?.hide());
	}), u.on("closed", () => {
		u = null;
	});
}
function h() {
	d = new n(p()), d.setToolTip("NNMind");
	let e = t.buildFromTemplate([
		{
			label: "显示 NnMind",
			click: () => {
				u ? (u.show(), u.focus()) : m();
			}
		},
		{ type: "separator" },
		{
			label: "退出",
			click: () => {
				f = !0, r.quit();
			}
		}
	]);
	d.setContextMenu(e), d.on("click", () => {
		u ? u.isVisible() ? u.hide() : (u.show(), u.focus()) : m();
	});
}
r.on("activate", () => {
	u ? u.show() : m();
}), r.on("before-quit", () => {
	f = !0;
}), r.on("window-all-closed", () => {
	process.platform !== "darwin" && r.quit();
}), r.whenReady().then(() => {
	h(), m();
});
//#endregion
export {};
