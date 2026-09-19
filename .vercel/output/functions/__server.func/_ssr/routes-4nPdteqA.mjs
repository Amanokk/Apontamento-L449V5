import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as formatDuration, l as todayISO, o as minutesBetween, r as formatDateBR, s as nowHHMM, u as uid } from "./utils-C8V_sHGQ.mjs";
import { l as Plus, r as Square, s as Repeat, y as Clock } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as Route$5 } from "./router-WD2I4uvC.mjs";
import { C as useSnapshot, S as usePresencePing, _ as useCloseApontamento, c as getCrewLabel, f as loadLast, g as setCrewLabel, h as saveLast, i as Input, l as getDeviceId, n as Button, o as ScreenLoader, t as AppShell, w as useUpsertApontamento, x as useLivePresence, y as useGps } from "./use-snapshot-lfjpPdkZ.mjs";
import { t as GpsBanner } from "./gps-banner-C59qSifn.mjs";
import { n as collectMarkers, t as LiveMap } from "./live-map-BtAcbF-l.mjs";
import { n as emptyDraft } from "./draft-DPWSbq1K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-4nPdteqA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const navigate = useNavigate();
	const initial = Route$5.useLoaderData();
	const { data, isLoading } = useSnapshot(initial);
	const gps = useGps();
	const closeMut = useCloseApontamento();
	const upsert = useUpsertApontamento();
	const { data: livePresence } = useLivePresence(true, initial.presence);
	const [tick, setTick] = (0, import_react.useState)(nowHHMM());
	const [estaca, setEstaca] = (0, import_react.useState)("");
	const [pv, setPv] = (0, import_react.useState)("");
	const [last, setLast] = (0, import_react.useState)(loadLast);
	const [label, setLabel] = (0, import_react.useState)("");
	const [labelOpen, setLabelOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setTick(nowHHMM()), 3e4);
		return () => clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		setLabel(getCrewLabel());
		setLabelOpen(!getCrewLabel());
	}, []);
	usePresencePing(gps, last);
	const today = todayISO();
	const rows = (0, import_react.useMemo)(() => (data?.apontamentos ?? []).filter((a) => a.date === today).sort((a, b) => a.start.localeCompare(b.start) || a.createdAt.localeCompare(b.createdAt)), [data?.apontamentos, today]);
	const open = rows.filter((a) => !a.end);
	const work = data?.works.find((w) => w.id === last.workId);
	const lastEq = data?.equipment.find((e) => e.id === last.equipmentId);
	const lastAct = data?.activities.find((a) => a.id === last.activityId);
	const lastStreet = data?.streets.find((s) => s.id === last.streetId);
	const hours = rows.reduce((acc, a) => acc + minutesBetween(a.start, a.end ?? tick), 0);
	const gpsLat = gps.status === "ready" ? gps.lat : null;
	const gpsLng = gps.status === "ready" ? gps.lng : null;
	const gpsAcc = gps.status === "ready" ? gps.accuracy : null;
	const presence = livePresence ?? data?.presence ?? [];
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
	function setWork(workId) {
		const next = {
			...last,
			workId
		};
		const first = data?.streets.find((s) => s.active && s.workId === workId);
		if (first) next.streetId = first.id;
		setLast(next);
		saveLast(next);
	}
	async function quickSave() {
		const d = emptyDraft(last);
		d.estaca = estaca;
		d.pv = pv;
		d.ended = false;
		if (!d.equipmentId || !d.activityId || !d.streetId) {
			navigate({ to: "/novo" });
			return;
		}
		await upsert.mutateAsync({
			id: uid(),
			date: d.date,
			start: d.start,
			end: null,
			workId: d.workId,
			streetId: d.streetId,
			equipmentId: d.equipmentId,
			activityId: d.activityId,
			estaca: d.estaca,
			pv: d.pv,
			quantity: null,
			notes: "",
			lat: gpsLat,
			lng: gpsLng,
			accuracy: gpsAcc,
			locationLabel: "",
			deviceId: getDeviceId()
		});
		setEstaca("");
		setPv("");
		toast.success("Salvo para toda a equipe");
	}
	if (isLoading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoader, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium uppercase tracking-[0.16em] text-muted",
				children: "Apontador"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold leading-none text-fg",
					children: formatDateBR(today)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tabular-nums text-muted",
					children: tick
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-2 overflow-x-auto",
				children: (data?.works ?? []).filter((w) => w.active).map((w) => {
					const on = w.id === last.workId;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setWork(w.id),
						className: on ? "h-9 shrink-0 rounded-full bg-primary px-3 text-sm font-medium text-primary-fg" : "h-9 shrink-0 rounded-full border border-border bg-surface px-3 text-sm text-fg",
						children: [
							w.code,
							" ",
							w.name
						]
					}, w.id);
				})
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-1 flex-col gap-4 px-4 pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GpsBanner, { gps }),
			labelOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-3 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Como a equipe te acha no mapa?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs text-muted",
						children: "Apelido da frente, código da máquina ou “Equipe 1”."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: label,
							maxLength: 24,
							onChange: (e) => setLabel(e.target.value),
							placeholder: "Ex.: Frente 1"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => {
								setCrewLabel(label);
								setLabelOpen(false);
							},
							children: "Ok"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/mapa",
				className: "block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveMap, { markers })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/novo",
				className: "flex min-h-16 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-lg font-semibold text-primary-fg shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-5" }), "Novo apontamento"]
			}),
			open.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-3 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium uppercase tracking-wide text-muted",
					children: "Em andamento"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: open.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-semibold",
								children: a.equipmentName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted",
								children: [
									a.activityName,
									" · desde ",
									a.start
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => {
								closeMut.mutate({
									id: a.id,
									end: nowHHMM()
								});
								toast.success("Encerrado");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5 fill-current" }), "Encerrar"]
						})]
					}, a.id))
				})]
			}) : null,
			lastEq && lastAct && lastStreet ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4 shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center gap-2 text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wide",
							children: "Repetir última"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold leading-snug",
						children: lastEq.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							lastAct.name,
							" · ",
							lastStreet.name
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Estaca",
							value: estaca,
							onChange: (e) => setEstaca(e.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "PV",
							value: pv,
							onChange: (e) => setPv(e.target.value.toUpperCase())
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						onClick: () => void quickSave(),
						children: "Salvar agora"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Do dia"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm tabular-nums text-muted",
					children: [
						rows.length,
						" · ",
						formatDuration(hours)
					]
				})]
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "mx-auto mb-2 size-6 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Nenhum apontamento ainda. Comece pela máquina que está na frente."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "flex flex-col gap-2",
				children: rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/novo",
					search: { edit: a.id },
					className: "block rounded-xl border border-border bg-surface p-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm tabular-nums text-muted",
								children: [a.start, a.end ? `–${a.end}` : "–…"]
							}), !a.end ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-ok-fg px-2 py-0.5 text-[11px] font-medium text-ok",
								children: "andamento"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold",
							children: a.equipmentName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								a.activityName,
								a.streetName ? ` · ${a.streetName}` : "",
								a.estaca ? ` · E ${a.estaca}` : "",
								a.pv ? ` · ${a.pv}` : ""
							]
						})
					]
				}) }, a.id))
			})] }),
			work ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-xs text-subtle",
				children: [
					work.code,
					" · ",
					work.name,
					" · salvo para toda a equipe"
				]
			}) : null
		]
	})] });
}
//#endregion
export { Home as component };
