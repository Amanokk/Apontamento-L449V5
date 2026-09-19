import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as formatDateBR } from "./utils-C8V_sHGQ.mjs";
import { g as FileSpreadsheet, n as Trash2, o as Search } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as Route$3 } from "./router-WD2I4uvC.mjs";
import { C as useSnapshot, i as Input, n as Button, o as ScreenLoader, t as AppShell, v as useDeleteApontamento } from "./use-snapshot-lfjpPdkZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/historico-Cq6711zX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Historico() {
	const initial = Route$3.useLoaderData();
	const { data, isLoading } = useSnapshot(initial);
	const del = useDeleteApontamento();
	const [q, setQ] = (0, import_react.useState)("");
	const [eq, setEq] = (0, import_react.useState)("");
	const [st, setSt] = (0, import_react.useState)("");
	const [act, setAct] = (0, import_react.useState)("");
	const [date, setDate] = (0, import_react.useState)("");
	const apontamentos = data?.apontamentos ?? [];
	const equipment = data?.equipment ?? [];
	const streets = data?.streets ?? [];
	const activities = data?.activities ?? [];
	const rows = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return [...apontamentos].filter((a) => !date || a.date === date).filter((a) => !eq || a.equipmentId === eq).filter((a) => !st || a.streetId === st).filter((a) => !act || a.activityId === act).filter((a) => {
			if (!query) return true;
			return `${a.equipmentName} ${a.activityName} ${a.streetName} ${a.estaca} ${a.pv} ${a.notes} ${a.description}`.toLowerCase().includes(query);
		}).sort((a, b) => a.date === b.date ? b.start.localeCompare(a.start) : b.date.localeCompare(a.date));
	}, [
		apontamentos,
		q,
		eq,
		st,
		act,
		date
	]);
	if (isLoading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoader, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Histórico"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Tudo o que a equipe apontou, em qualquer aparelho."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				size: "sm",
				variant: "outline",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/relatorio",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-4" }), "Relatório"]
				})
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-col gap-3 px-4 pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "pl-9",
					placeholder: "Buscar…",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "date",
				value: date,
				onChange: (e) => setDate(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-12 rounded-md border border-border bg-surface px-3 text-base",
						value: eq,
						onChange: (e) => setEq(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as máquinas"
						}), equipment.filter((e) => e.active).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: e.id,
							children: e.name
						}, e.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-12 rounded-md border border-border bg-surface px-3 text-base",
						value: st,
						onChange: (e) => setSt(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as ruas"
						}), streets.filter((s) => s.active).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s.id,
							children: s.name
						}, s.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "h-12 rounded-md border border-border bg-surface px-3 text-base",
						value: act,
						onChange: (e) => setAct(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Todas as atividades"
						}), activities.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a.id,
							children: a.name
						}, a.id))]
					})
				]
			}),
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-sm text-muted",
				children: "Nada encontrado."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: rows.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-surface p-3 shadow-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								formatDateBR(a.date),
								" · ",
								a.start,
								a.end ? `–${a.end}` : "–…"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: a.equipmentName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								a.activityName,
								" · ",
								a.streetName,
								a.estaca ? ` · E ${a.estaca}` : "",
								a.pv ? ` · ${a.pv}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/novo",
									search: { edit: a.id },
									children: "Editar"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: "ghost",
								className: "text-danger",
								onClick: () => {
									if (confirm("Excluir este apontamento?")) {
										del.mutate(a.id);
										toast.success("Excluído");
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Excluir"]
							})]
						})
					]
				}, a.id))
			})
		]
	})] });
}
//#endregion
export { Historico as component };
