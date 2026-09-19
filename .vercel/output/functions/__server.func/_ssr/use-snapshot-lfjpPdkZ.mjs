import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { f as useRouterState, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C8V_sHGQ.mjs";
import { C as CalendarDays, a as Settings2, b as ClipboardList, d as MapPinned, l as Plus } from "../_libs/lucide-react.mjs";
import { b as upsertApontamento, f as closeApontamento, g as pingPresence, h as getSnapshot, m as getPresence, p as deleteApontamento } from "./router-WD2I4uvC.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-snapshot-lfjpPdkZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/",
		label: "Hoje",
		icon: CalendarDays
	},
	{
		to: "/novo",
		label: "Novo",
		icon: Plus
	},
	{
		to: "/mapa",
		label: "Mapa",
		icon: MapPinned
	},
	{
		to: "/historico",
		label: "Histórico",
		icon: ClipboardList
	},
	{
		to: "/cadastros",
		label: "Cadastros",
		icon: Settings2
	}
];
function AppShell({ children, hideNav }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex min-h-dvh max-w-lg flex-col bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex min-h-0 flex-1 flex-col", hideNav ? "pb-0" : "pb-20"),
			children
		}), hideNav ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "no-print fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)] pt-1",
				children: NAV.map((item) => {
					const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium transition-colors duration-150", active ? "text-primary" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-5",
							strokeWidth: active ? 2.4 : 1.8
						}), item.label]
					}, item.to);
				})
			})
		})]
	});
}
function ScreenLoader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col gap-3 bg-bg px-4 pt-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 animate-pulse rounded-md bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-16 animate-pulse rounded-xl bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-44 animate-pulse rounded-xl bg-surface-2" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-xl bg-surface-2" })
		]
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-fg hover:bg-primary/90",
			secondary: "bg-surface-2 text-fg hover:bg-border",
			outline: "border border-border bg-surface text-fg hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			danger: "bg-danger text-primary-fg hover:bg-danger/90"
		},
		size: {
			default: "h-12 rounded-md px-4 text-base",
			sm: "h-9 rounded-sm px-3 text-sm",
			lg: "h-14 rounded-lg px-5 text-lg",
			icon: "size-12 rounded-md"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-12 w-full rounded-md border border-border bg-surface px-3 text-base text-fg placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-base text-fg placeholder:text-subtle", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("mb-1.5 block text-sm font-medium text-muted", className),
		...props
	});
}
var DEFAULT_CENTER = {
	lat: -22.8711,
	lng: -43.7752
};
function haversineMeters(a, b) {
	const R = 6371e3;
	const dLat = (b.lat - a.lat) * Math.PI / 180;
	const dLng = (b.lng - a.lng) * Math.PI / 180;
	const la1 = a.lat * Math.PI / 180;
	const la2 = b.lat * Math.PI / 180;
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
function projectMercator(lat, lng, zoom) {
	const n = 2 ** zoom;
	const x = (lng + 180) / 360 * n;
	const latRad = lat * Math.PI / 180;
	return {
		x,
		y: (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
	};
}
function gpsQuality(accuracy) {
	if (accuracy <= 10) return "excellent";
	if (accuracy <= 25) return "good";
	if (accuracy <= 50) return "fair";
	return "poor";
}
function gpsQualityLabel(quality) {
	switch (quality) {
		case "excellent": return "Precisão alta";
		case "good": return "Precisão boa";
		case "fair": return "Precisão razoável";
		case "poor": return "Precisão fraca — aguarde o GPS";
	}
}
function matchStreetByLabel(label, streets, workId) {
	const hay = label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
	const list = streets.filter((s) => s.active && (!workId || s.workId === workId));
	const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^(rua|av\.?|avenida|travessa|tv\.?)\s+/i, "");
	return list.find((s) => hay.includes(norm(s.name))) ?? list.find((s) => {
		return norm(s.name).split(/\s+/).some((w) => w.length > 4 && hay.includes(w));
	});
}
var listeners = /* @__PURE__ */ new Set();
var watchId = null;
var stopTimer = null;
var current = { status: "idle" };
var GPS_OPTS = {
	enableHighAccuracy: true,
	maximumAge: 0,
	timeout: 25e3
};
function emit(next) {
	current = next;
	for (const l of listeners) l(next);
}
function normalizeAccuracy(raw) {
	if (!Number.isFinite(raw) || raw <= 0) return 45;
	return raw;
}
function headingOf(coords) {
	const h = coords.heading;
	return typeof h === "number" && Number.isFinite(h) ? h : null;
}
function acceptReading(prev, lat, lng, accuracy) {
	const now = Date.now();
	if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
	if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
	if (!prev) {
		if (accuracy > 5e3) return null;
		return {
			status: "ready",
			lat,
			lng,
			accuracy,
			quality: gpsQuality(accuracy),
			heading: null,
			updatedAt: now
		};
	}
	const moved = haversineMeters(prev, {
		lat,
		lng
	});
	const age = now - prev.updatedAt;
	const better = accuracy < prev.accuracy * .75;
	const similar = accuracy <= prev.accuracy * 1.35;
	if (accuracy > prev.accuracy * 1.8 && accuracy > 35 && prev.accuracy <= 40 && age < 2e4) return null;
	if (accuracy > 100 && prev.accuracy <= 35 && age < 25e3) return null;
	if (moved < 3.5 && !better && age < 8e3) return null;
	if (!better && !similar && moved < 25 && age < 12e3) return null;
	if (moved < 3.5 && better) return {
		...prev,
		accuracy,
		quality: gpsQuality(accuracy),
		updatedAt: now
	};
	let nextLat = lat;
	let nextLng = lng;
	if (moved < 25 && similar) {
		const alpha = Math.min(.7, Math.max(.25, prev.accuracy / (prev.accuracy + accuracy)));
		nextLat = prev.lat * (1 - alpha) + lat * alpha;
		nextLng = prev.lng * (1 - alpha) + lng * alpha;
	}
	return {
		status: "ready",
		lat: nextLat,
		lng: nextLng,
		accuracy: better ? accuracy : Math.min(prev.accuracy * 1.05, accuracy),
		quality: gpsQuality(better ? accuracy : Math.min(prev.accuracy, accuracy)),
		heading: null,
		updatedAt: now
	};
}
function onPosition(pos) {
	const lat = pos.coords.latitude;
	const lng = pos.coords.longitude;
	const accuracy = normalizeAccuracy(pos.coords.accuracy);
	const prev = current.status === "ready" ? current : null;
	const next = acceptReading(prev, lat, lng, accuracy);
	if (!next) return;
	next.heading = headingOf(pos.coords);
	if (prev && Math.abs(prev.lat - next.lat) < 1e-7 && Math.abs(prev.lng - next.lng) < 1e-7 && Math.abs(prev.accuracy - next.accuracy) < 1.5) return;
	emit(next);
}
function onError(err) {
	const denied = err.code === err.PERMISSION_DENIED;
	if (current.status === "ready" && !denied) return;
	emit({
		status: denied ? "denied" : "error",
		message: denied ? "Permita o acesso à localização nas configurações do aparelho." : err.message || "Não foi possível ler o GPS. Tente de novo ao ar livre."
	});
}
function startWatch() {
	if (typeof navigator === "undefined" || !navigator.geolocation) {
		emit({
			status: "unsupported",
			message: "Este aparelho não tem GPS."
		});
		return;
	}
	if (watchId != null) return;
	if (current.status !== "ready") emit({ status: "requesting" });
	navigator.geolocation.getCurrentPosition(onPosition, onError, GPS_OPTS);
	watchId = navigator.geolocation.watchPosition(onPosition, onError, GPS_OPTS);
}
function stopWatch() {
	if (watchId == null || typeof navigator === "undefined") return;
	navigator.geolocation.clearWatch(watchId);
	watchId = null;
}
function useGps() {
	const [state, setState] = (0, import_react.useState)(current);
	const retry = (0, import_react.useCallback)(() => {
		stopWatch();
		emit({ status: "requesting" });
		startWatch();
	}, []);
	(0, import_react.useEffect)(() => {
		listeners.add(setState);
		if (stopTimer != null) {
			window.clearTimeout(stopTimer);
			stopTimer = null;
		}
		startWatch();
		return () => {
			listeners.delete(setState);
			if (listeners.size === 0) stopTimer = window.setTimeout(() => {
				if (listeners.size === 0) stopWatch();
			}, 3e4);
		};
	}, []);
	return {
		...state,
		retry
	};
}
var DEVICE_KEY = "apontador-device-id";
var LABEL_KEY = "apontador-crew-label";
var LAST_KEY = "apontador-last";
function getDeviceId() {
	if (typeof localStorage === "undefined") return "preview";
	let id = localStorage.getItem(DEVICE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(DEVICE_KEY, id);
	}
	return id;
}
function getCrewLabel() {
	if (typeof localStorage === "undefined") return "";
	return localStorage.getItem(LABEL_KEY) ?? "";
}
function setCrewLabel(label) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(LABEL_KEY, label.trim().slice(0, 24));
}
function loadLast() {
	const fallback = {
		workId: "l449",
		streetId: "visconde",
		equipmentId: "lok-453",
		activityId: "exec-caixa-ralo"
	};
	if (typeof localStorage === "undefined") return fallback;
	try {
		const raw = localStorage.getItem(LAST_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return fallback;
}
function saveLast(last) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(LAST_KEY, JSON.stringify(last));
}
var SNAPSHOT_KEY = ["snapshot"];
var PRESENCE_KEY = ["presence"];
function useSnapshot(initial) {
	return useQuery({
		queryKey: SNAPSHOT_KEY,
		queryFn: () => getSnapshot(),
		initialData: initial,
		staleTime: 6e4,
		refetchOnWindowFocus: false,
		refetchInterval: false,
		placeholderData: (prev) => prev ?? initial
	});
}
function useLivePresence(enabled, initial) {
	return useQuery({
		queryKey: PRESENCE_KEY,
		queryFn: () => getPresence(),
		enabled,
		initialData: initial,
		staleTime: 1e4,
		refetchInterval: enabled ? 15e3 : false,
		refetchOnWindowFocus: false
	});
}
function useInvalidateSnapshot() {
	const qc = useQueryClient();
	return () => qc.invalidateQueries({ queryKey: SNAPSHOT_KEY });
}
function useUpsertApontamento() {
	const invalidate = useInvalidateSnapshot();
	return useMutation({
		mutationFn: (data) => upsertApontamento({ data }),
		onSuccess: () => void invalidate()
	});
}
function useCloseApontamento() {
	const invalidate = useInvalidateSnapshot();
	return useMutation({
		mutationFn: (data) => closeApontamento({ data }),
		onSuccess: () => void invalidate()
	});
}
function useDeleteApontamento() {
	const invalidate = useInvalidateSnapshot();
	return useMutation({
		mutationFn: (id) => deleteApontamento({ data: { id } }),
		onSuccess: () => void invalidate()
	});
}
function usePresencePing(gps, last) {
	const lat = gps.status === "ready" ? gps.lat : null;
	const lng = gps.status === "ready" ? gps.lng : null;
	const acc = gps.status === "ready" ? gps.accuracy : null;
	const lastSent = (0, import_react.useRef)({
		lat: 0,
		lng: 0,
		t: 0
	});
	(0, import_react.useEffect)(() => {
		if (lat == null || lng == null) return;
		const send = (force) => {
			const moved = haversineMeters({
				lat,
				lng
			}, lastSent.current);
			const age = Date.now() - lastSent.current.t;
			if (!force && moved < 12 && age < 2e4) return;
			lastSent.current = {
				lat,
				lng,
				t: Date.now()
			};
			pingPresence({ data: {
				deviceId: getDeviceId(),
				label: getCrewLabel() || "No campo",
				lat,
				lng,
				accuracy: acc,
				workId: last.workId || null,
				equipmentId: last.equipmentId || null,
				streetId: last.streetId || null
			} });
		};
		send(false);
		const id = window.setInterval(() => send(true), 2e4);
		return () => window.clearInterval(id);
	}, [
		lat,
		lng,
		acc,
		last.workId,
		last.equipmentId,
		last.streetId
	]);
}
//#endregion
export { useSnapshot as C, usePresencePing as S, useCloseApontamento as _, Label as a, useInvalidateSnapshot as b, getCrewLabel as c, haversineMeters as d, loadLast as f, setCrewLabel as g, saveLast as h, Input as i, getDeviceId as l, projectMercator as m, Button as n, ScreenLoader as o, matchStreetByLabel as p, DEFAULT_CENTER as r, Textarea as s, AppShell as t, gpsQualityLabel as u, useDeleteApontamento as v, useUpsertApontamento as w, useLivePresence as x, useGps as y };
