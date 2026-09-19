import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-C8V_sHGQ.mjs";
import { f as MapPin, u as Navigation } from "../_libs/lucide-react.mjs";
import { d as haversineMeters, m as projectMercator, r as DEFAULT_CENTER } from "./use-snapshot-lfjpPdkZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-map-BtAcbF-l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function collectMarkers(opts) {
	const markers = [];
	if (opts.gps.status === "ready") markers.push({
		id: "me",
		lat: opts.gps.lat,
		lng: opts.gps.lng,
		kind: "me",
		label: "Você",
		accuracy: opts.gps.accuracy
	});
	for (const p of opts.presence) {
		if (p.deviceId === opts.deviceId) continue;
		markers.push({
			id: `p-${p.deviceId}`,
			lat: p.lat,
			lng: p.lng,
			kind: "crew",
			label: p.label || "Equipe",
			accuracy: p.accuracy ?? void 0
		});
	}
	for (const a of opts.apontamentos) {
		if (a.lat == null || a.lng == null) continue;
		markers.push({
			id: `a-${a.id}`,
			lat: a.lat,
			lng: a.lng,
			kind: a.end ? "done" : "open",
			label: a.equipmentName
		});
	}
	return markers;
}
function LiveMap({ markers, className, heightClass = "h-52" }) {
	const ref = (0, import_react.useRef)(null);
	const centerRef = (0, import_react.useRef)(DEFAULT_CENTER);
	const [size, setSize] = (0, import_react.useState)({
		w: 360,
		h: 208
	});
	const zoom = markers.length > 4 ? 15 : 16;
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const sync = () => setSize({
			w: el.clientWidth,
			h: el.clientHeight
		});
		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);
	const center = (0, import_react.useMemo)(() => {
		let target = DEFAULT_CENTER;
		if (markers.length > 0) {
			const me = markers.find((m) => m.kind === "me");
			if (me) target = {
				lat: me.lat,
				lng: me.lng
			};
			else target = {
				lat: markers.reduce((s, m) => s + m.lat, 0) / markers.length,
				lng: markers.reduce((s, m) => s + m.lng, 0) / markers.length
			};
		}
		if (haversineMeters(centerRef.current, target) < 14) return centerRef.current;
		centerRef.current = target;
		return target;
	}, [markers]);
	const layout = (0, import_react.useMemo)(() => {
		const TILE = 256;
		const c = projectMercator(center.lat, center.lng, zoom);
		const cx = c.x * TILE;
		const cy = c.y * TILE;
		const x0 = Math.floor((cx - size.w / 2) / TILE);
		const y0 = Math.floor((cy - size.h / 2) / TILE);
		const x1 = Math.floor((cx + size.w / 2) / TILE);
		const y1 = Math.floor((cy + size.h / 2) / TILE);
		const tiles = [];
		const n = 2 ** zoom;
		for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
			const tx = (x % n + n) % n;
			tiles.push({
				x: tx,
				y,
				left: x * TILE - (cx - size.w / 2),
				top: y * TILE - (cy - size.h / 2)
			});
		}
		const metersPerPx = 156543.03392 * Math.cos(center.lat * Math.PI / 180) / 2 ** zoom;
		return {
			tiles,
			points: markers.map((m) => {
				const p = projectMercator(m.lat, m.lng, zoom);
				return {
					...m,
					left: p.x * TILE - (cx - size.w / 2),
					top: p.y * TILE - (cy - size.h / 2),
					radius: m.accuracy && metersPerPx > 0 ? m.accuracy / metersPerPx : 0
				};
			})
		};
	}, [
		center.lat,
		center.lng,
		markers,
		size.h,
		size.w,
		zoom
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		className: cn("relative overflow-hidden rounded-xl bg-surface-2 shadow-card", heightClass, className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0",
				children: layout.tiles.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					alt: "",
					width: 256,
					height: 256,
					className: "pointer-events-none absolute max-w-none",
					style: {
						left: t.left,
						top: t.top
					},
					src: `https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`,
					crossOrigin: "anonymous"
				}, `${zoom}-${t.x}-${t.y}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/35 to-transparent" }),
			layout.points.map((m) => m.kind === "me" && m.radius > 8 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute z-10 rounded-full bg-primary/20",
				style: {
					left: m.left - m.radius,
					top: m.top - m.radius,
					width: m.radius * 2,
					height: m.radius * 2
				}
			}, `${m.id}-acc`) : null),
			layout.points.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute z-10 -translate-x-1/2 -translate-y-full",
				style: {
					left: m.left,
					top: m.top
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("mb-0.5 max-w-28 truncate rounded-full px-1.5 py-0.5 text-[10px] font-semibold shadow-card", m.kind === "me" ? "bg-primary text-primary-fg" : m.kind === "crew" ? "bg-fg text-bg" : m.kind === "open" ? "bg-ok text-ok-fg" : "bg-surface text-fg"),
						children: m.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("block size-3 rounded-full border-2 border-surface", m.kind === "me" ? "bg-primary" : m.kind === "crew" ? "bg-fg" : m.kind === "open" ? "bg-ok" : "bg-muted") })]
				})
			}, m.id)),
			markers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-surface/70 px-4 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5 text-muted" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-fg",
						children: "Aguardando GPS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Ative a localização para ver a equipe no mapa."
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-surface/90 px-2 py-1 text-[10px] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-3" }), "OpenStreetMap"]
			})
		]
	});
}
//#endregion
export { collectMarkers as n, LiveMap as t };
