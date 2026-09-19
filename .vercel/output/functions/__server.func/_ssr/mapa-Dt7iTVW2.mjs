import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as relativeTime, l as todayISO, n as formatAccuracy } from "./utils-C8V_sHGQ.mjs";
import { i as Route$2 } from "./router-WD2I4uvC.mjs";
import { C as useSnapshot, S as usePresencePing, c as getCrewLabel, d as haversineMeters, f as loadLast, g as setCrewLabel, i as Input, l as getDeviceId, n as Button, o as ScreenLoader, t as AppShell, x as useLivePresence, y as useGps } from "./use-snapshot-lfjpPdkZ.mjs";
import { t as GpsBanner } from "./gps-banner-C59qSifn.mjs";
import { n as collectMarkers, t as LiveMap } from "./live-map-BtAcbF-l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mapa-Dt7iTVW2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Mapa() {
	const initial = Route$2.useLoaderData();
	const { data, isLoading } = useSnapshot(initial);
	const gps = useGps();
	const last = loadLast();
	const [label, setLabel] = (0, import_react.useState)(() => typeof window === "undefined" ? "" : getCrewLabel());
	const { data: livePresence } = useLivePresence(true, initial.presence);
	usePresencePing(gps, last);
	const today = todayISO();
	const rows = (0, import_react.useMemo)(() => (data?.apontamentos ?? []).filter((a) => a.date === today), [data?.apontamentos, today]);
	const presence = livePresence ?? data?.presence ?? [];
	const gpsLat = gps.status === "ready" ? gps.lat : null;
	const gpsLng = gps.status === "ready" ? gps.lng : null;
	const gpsAcc = gps.status === "ready" ? gps.accuracy : null;
	const markers = (0, import_react.useMemo)(() => collectMarkers({
		gps,
		presence,
		apontamentos: rows,
		deviceId: typeof window === "undefined" ? "" : getDeviceId()
	}), [
		gpsLat,
		gpsLng,
		gpsAcc,
		presence,
		rows
	]);
	const deviceId = typeof window === "undefined" ? "" : getDeviceId();
	const others = presence.filter((p) => p.deviceId !== deviceId);
	if (isLoading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoader, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Mapa da frente"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Quem está no campo agora, e onde cada máquina apontou hoje."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-col gap-4 px-4 pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsBanner, { gps }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, {
				markers,
				heightClass: "h-72"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-3 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
					children: "Seu nome no mapa"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: label,
						maxLength: 24,
						onChange: (e) => setLabel(e.target.value),
						placeholder: "Frente 1"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: () => {
							setCrewLabel(label);
						},
						children: "Salvar"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-lg font-semibold",
				children: "Equipe ao vivo"
			}), others.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted",
				children: "Só você por enquanto. Quando outro aparelho abrir o app com GPS, aparece aqui."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: others.map((p) => {
					const dist = gps.status === "ready" ? haversineMeters({
						lat: gps.lat,
						lng: gps.lng
					}, p) : null;
					const eq = data?.equipment.find((e) => e.id === p.equipmentId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: p.label || "No campo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								eq?.name ?? "Em deslocamento",
								dist != null ? ` · ${formatAccuracy(dist)}` : "",
								" · ",
								relativeTime(p.updatedAt)
							]
						})]
					}, p.deviceId);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-2 font-display text-lg font-semibold",
				children: "Pontos de hoje"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: rows.filter((a) => a.lat != null).map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/novo",
					search: { edit: a.id },
					className: "block rounded-xl border border-border bg-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: a.equipmentName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							a.activityName,
							" · ",
							a.streetName,
							a.locationLabel ? ` · ${a.locationLabel}` : ""
						]
					})]
				}) }, a.id))
			})] })
		]
	})] });
}
//#endregion
export { Mapa as component };
