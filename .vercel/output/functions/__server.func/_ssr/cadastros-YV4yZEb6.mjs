import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { r as KIND_LABEL } from "./catalog-Dpw3AA8E.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as addActivity, d as addWork, l as addEquipment, o as Route$4, u as addStreet, v as toggleStreet, y as updateEquipment } from "./router-WD2I4uvC.mjs";
import { C as useSnapshot, a as Label, b as useInvalidateSnapshot, i as Input, n as Button, o as ScreenLoader, t as AppShell } from "./use-snapshot-lfjpPdkZ.mjs";
import { r as ToggleList } from "./choice-DtEvLaaF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cadastros-YV4yZEb6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	"Máquinas",
	"Ruas",
	"Atividades"
];
function Cadastros() {
	const [tab, setTab] = (0, import_react.useState)("Máquinas");
	const initial = Route$4.useLoaderData();
	const { data, isLoading } = useSnapshot(initial);
	if (isLoading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoader, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "Cadastros"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "O que você cadastrar aparece para todo mundo."
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-4 mb-4 grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1",
			children: TABS.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(t),
				className: tab === t ? "h-10 rounded-md bg-surface text-sm font-semibold text-fg" : "h-10 rounded-md text-sm font-medium text-muted",
				children: t
			}, t))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "px-4 pb-6",
			children: [
				tab === "Máquinas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MaquinasTab, {}) : null,
				tab === "Ruas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuasTab, {}) : null,
				tab === "Atividades" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AtividadesTab, {}) : null
			]
		})
	] });
}
function MaquinasTab() {
	const { data } = useSnapshot();
	const invalidate = useInvalidateSnapshot();
	const equipment = data?.equipment ?? [];
	const activities = data?.activities ?? [];
	const [name, setName] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("retro");
	const [editId, setEditId] = (0, import_react.useState)(null);
	const editing = equipment.find((e) => e.id === editId);
	const actOpts = (0, import_react.useMemo)(() => activities.map((a) => ({
		id: a.id,
		label: a.name
	})), [activities]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-xl border border-border bg-surface p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-base font-semibold",
					children: editing ? "Editar equipamento" : "Novo equipamento"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mb-2",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Retroescavadeira 02"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Código" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mb-2",
					value: code,
					onChange: (e) => setCode(e.target.value),
					placeholder: "LOK 453"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Tipo" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mb-3 h-12 w-full rounded-md border border-border bg-surface px-3",
					value: kind,
					onChange: (e) => setKind(e.target.value),
					children: Object.keys(KIND_LABEL).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: k,
						children: KIND_LABEL[k]
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					disabled: !name.trim(),
					onClick: () => {
						(async () => {
							if (editing) {
								await updateEquipment({ data: {
									id: editing.id,
									name: name.trim(),
									code: code.trim() || name.trim(),
									kind
								} });
								toast.success("Equipamento atualizado");
								setEditId(null);
							} else {
								const template = equipment.find((e) => e.kind === kind);
								await addEquipment({ data: {
									name: name.trim(),
									code: code.trim() || name.trim(),
									kind,
									activityIds: template?.activityIds ?? []
								} });
								toast.success("Equipamento cadastrado");
							}
							setName("");
							setCode("");
							await invalidate();
						})();
					},
					children: editing ? "Salvar" : "Cadastrar"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex flex-col gap-2",
			children: equipment.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-xl border border-border bg-surface p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: e.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							e.code,
							" · ",
							KIND_LABEL[e.kind],
							" · ",
							e.activityIds.length,
							" atividades"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								setEditId(e.id);
								setName(e.name);
								setCode(e.code);
								setKind(e.kind);
							},
							children: "Editar"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => {
								updateEquipment({ data: {
									id: e.id,
									active: !e.active
								} }).then(() => invalidate());
							},
							children: e.active ? "Ocultar" : "Ativar"
						})]
					}),
					editId === e.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 max-h-64 overflow-y-auto rounded-lg bg-surface-2 p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs text-muted",
							children: "Atividades desta máquina"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleList, {
							options: actOpts,
							selected: e.activityIds,
							onToggle: (id) => {
								const activityIds = e.activityIds.includes(id) ? e.activityIds.filter((x) => x !== id) : [...e.activityIds, id];
								updateEquipment({ data: {
									id: e.id,
									activityIds
								} }).then(() => invalidate());
							}
						})]
					}) : null
				]
			}, e.id))
		})]
	});
}
function RuasTab() {
	const { data } = useSnapshot();
	const invalidate = useInvalidateSnapshot();
	const streets = data?.streets ?? [];
	const works = data?.works ?? [];
	const [name, setName] = (0, import_react.useState)("");
	const [workId, setWorkId] = (0, import_react.useState)(works[0]?.id ?? "");
	const [obraCode, setObraCode] = (0, import_react.useState)("");
	const [obraName, setObraName] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-base font-semibold",
						children: "Nova rua"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome da rua" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mb-2",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Rua das Flores"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Obra" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "mb-3 h-12 w-full rounded-md border border-border bg-surface px-3",
						value: workId,
						onChange: (e) => setWorkId(e.target.value),
						children: works.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: w.id,
							children: [
								w.code,
								" ",
								w.name
							]
						}, w.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: !name.trim() || !workId,
						onClick: () => {
							addStreet({ data: {
								name: name.trim(),
								workId
							} }).then(() => {
								setName("");
								toast.success("Rua cadastrada");
								invalidate();
							});
						},
						children: "Cadastrar rua"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-base font-semibold",
						children: "Nova obra"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: obraCode,
							onChange: (e) => setObraCode(e.target.value),
							placeholder: "L449"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: obraName,
							onChange: (e) => setObraName(e.target.value),
							placeholder: "São Joaquim"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3 w-full",
						variant: "outline",
						disabled: !obraCode.trim() || !obraName.trim(),
						onClick: () => {
							addWork({ data: {
								code: obraCode.trim().toUpperCase(),
								name: obraName.trim()
							} }).then((r) => {
								setWorkId(r.id);
								setObraCode("");
								setObraName("");
								toast.success("Obra cadastrada");
								invalidate();
							});
						},
						children: "Cadastrar obra"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: streets.map((s) => {
					const w = works.find((x) => x.id === s.workId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								w ? `${w.code} ${w.name}` : "",
								" ",
								s.active ? "" : "· oculta"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => void toggleStreet({ data: { id: s.id } }).then(() => invalidate()),
							children: s.active ? "Ocultar" : "Ativar"
						})]
					}, s.id);
				})
			})
		]
	});
}
function AtividadesTab() {
	const { data } = useSnapshot();
	const invalidate = useInvalidateSnapshot();
	const activities = data?.activities ?? [];
	const equipment = data?.equipment ?? [];
	const [name, setName] = (0, import_react.useState)("");
	const [eqId, setEqId] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-base font-semibold",
						children: "Nova atividade"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mb-2",
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Abertura de vala"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mb-3 h-12 w-full rounded-md border border-border bg-surface px-3",
						value: eqId,
						onChange: (e) => setEqId(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Vincular a uma máquina (opcional)"
						}), equipment.filter((e) => e.active).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: e.id,
							children: e.name
						}, e.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						disabled: !name.trim(),
						onClick: () => {
							addActivity({ data: {
								name: name.trim(),
								equipmentId: eqId || void 0
							} }).then(() => {
								setName("");
								toast.success("Atividade incluída");
								invalidate();
							});
						},
						children: "Cadastrar"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: "As opções de cada máquina vêm dos diários reais (LOK 453, LYC 154, pipa LYC 025, van LYC 303, rolo LOC 073…)."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-1.5",
				children: activities.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-surface px-3 py-2 text-sm",
					children: [a.name, a.code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs text-muted",
						children: a.code
					}) : null]
				}, a.id))
			})
		]
	});
}
//#endregion
export { Cadastros as component };
