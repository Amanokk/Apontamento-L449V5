import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as formatAccuracy } from "./utils-C8V_sHGQ.mjs";
import { h as LoaderCircle, m as LocateFixed, p as LocateOff } from "../_libs/lucide-react.mjs";
import { _ as reverseGeocode } from "./router-WD2I4uvC.mjs";
import { n as Button, u as gpsQualityLabel } from "./use-snapshot-lfjpPdkZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gps-banner-C59qSifn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var cache = /* @__PURE__ */ new Map();
var inflight = /* @__PURE__ */ new Map();
function placeKey(lat, lng) {
	return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}
function lookupPlace(lat, lng) {
	const key = placeKey(lat, lng);
	const hit = cache.get(key);
	if (hit) return Promise.resolve(hit);
	let pending = inflight.get(key);
	if (!pending) {
		pending = reverseGeocode({ data: {
			lat,
			lng
		} }).then((r) => {
			cache.set(key, r);
			inflight.delete(key);
			return r;
		}).catch(() => {
			inflight.delete(key);
			return {
				label: "",
				road: "",
				city: ""
			};
		});
		inflight.set(key, pending);
	}
	return pending;
}
function usePlaceLabel(lat, lng) {
	const [place, setPlace] = (0, import_react.useState)({
		label: "",
		road: "",
		city: ""
	});
	(0, import_react.useEffect)(() => {
		if (lat == null || lng == null) return;
		let cancelled = false;
		lookupPlace(lat, lng).then((r) => {
			if (!cancelled) setPlace(r);
		});
		return () => {
			cancelled = true;
		};
	}, [lat, lng]);
	return place;
}
function GpsBanner({ gps, onRetry }) {
	const place = usePlaceLabel(gps.status === "ready" ? gps.lat : null, gps.status === "ready" ? gps.lng : null);
	if (gps.status === "ready") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl bg-ok-fg px-3 py-2 text-ok",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateFixed, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-semibold leading-tight",
				children: place.label || "Localização ativa"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] tabular-nums opacity-80",
				children: [
					gpsQualityLabel(gps.quality),
					" · ±",
					formatAccuracy(gps.accuracy)
				]
			})]
		})]
	});
	if (gps.status === "requesting" || gps.status === "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-muted",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 shrink-0 animate-spin" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm",
			children: "Ativando GPS… fique ao ar livre para melhor precisão."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocateOff, { className: "size-4 shrink-0 text-danger" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "min-w-0 flex-1 text-sm text-muted",
				children: gps.message ?? "GPS desligado. Toque para ativar."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				onClick: onRetry ?? gps.retry,
				children: "Ativar"
			})
		]
	});
}
//#endregion
export { usePlaceLabel as n, GpsBanner as t };
