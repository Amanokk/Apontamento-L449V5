import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as formatDuration, l as todayISO, o as minutesBetween, r as formatDateBR } from "./utils-C8V_sHGQ.mjs";
import { _ as Download, c as Printer, i as Share2, v as Copy } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route } from "./router-WD2I4uvC.mjs";
import { C as useSnapshot, a as Label, i as Input, n as Button, o as ScreenLoader, t as AppShell } from "./use-snapshot-lfjpPdkZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/relatorio-hDo1JBkq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function csvCell(v) {
	const s = v == null ? "" : String(v);
	if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, "\"\"")}"`;
	return s;
}
function apontamentosToCsv(rows) {
	return `\uFEFF${[[
		"Data",
		"Início",
		"Término",
		"Duração",
		"Obra",
		"Rua",
		"Máquina",
		"Atividade",
		"Estaca",
		"PV",
		"Qtd",
		"Observações",
		"Descrição",
		"Latitude",
		"Longitude",
		"Local GPS"
	], ...rows.map((a) => {
		const dur = a.end ? formatDuration(minutesBetween(a.start, a.end)) : "em andamento";
		return [
			formatDateBR(a.date),
			a.start,
			a.end ?? "",
			dur,
			a.workName,
			a.streetName,
			a.equipmentName,
			a.activityName,
			a.estaca,
			a.pv,
			a.quantity ?? "",
			a.notes,
			a.description,
			a.lat ?? "",
			a.lng ?? "",
			a.locationLabel
		].map(csvCell);
	})].map((r) => r.join(";")).join("\n")}`;
}
function downloadText(filename, content, mime) {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
function buildDiarioText(date, rows) {
	const ordered = [...rows].sort((a, b) => a.start.localeCompare(b.start));
	const title = `${formatDateBR(date)}`;
	const work = ordered[0]?.workName ?? "";
	const lines = [`${title}${work ? ` — ${work}` : ""}`, ""];
	if (ordered.length === 0) {
		lines.push("Nenhum apontamento neste dia.");
		return lines.join("\n");
	}
	for (const a of ordered) {
		const time = a.end ? `${a.start}–${a.end}` : `${a.start}–…`;
		lines.push(`${time}  ${a.equipmentName}`);
		const bits = [
			a.activityName,
			a.streetName,
			a.estaca && `Estaca ${a.estaca}`,
			a.pv
		].filter(Boolean);
		lines.push(bits.join(" — "));
		if (a.locationLabel) lines.push(`GPS: ${a.locationLabel}`);
		if (a.notes) lines.push(`Obs: ${a.notes}`);
		lines.push("");
	}
	return lines.join("\n").trim() + "\n";
}
function printReport(title, html) {
	const w = window.open("", "_blank");
	if (!w) return;
	w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>${title}</title>
<style>
  body { font-family: "Source Sans 3", "Segoe UI", sans-serif; color: #1c1814; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.meta { color: #6b6358; margin: 0 0 20px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd4c6; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #efe8db; font-weight: 600; }
  .desc { color: #6b6358; font-size: 11px; }
  @page { margin: 16mm; }
</style></head><body>${html}</body></html>`);
	w.document.close();
	w.focus();
	w.print();
}
function Relatorio() {
	const initial = Route.useLoaderData();
	const { data, isLoading } = useSnapshot(initial);
	const [from, setFrom] = (0, import_react.useState)(todayISO());
	const [to, setTo] = (0, import_react.useState)(todayISO());
	const apontamentos = data?.apontamentos ?? [];
	const rows = (0, import_react.useMemo)(() => [...apontamentos].filter((a) => a.date >= from && a.date <= to).sort((a, b) => a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)), [
		apontamentos,
		from,
		to
	]);
	const byEq = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const a of rows) {
			const cur = map.get(a.equipmentId) ?? {
				name: a.equipmentName,
				n: 0,
				mins: 0
			};
			cur.n += 1;
			if (a.end) cur.mins += minutesBetween(a.start, a.end);
			map.set(a.equipmentId, cur);
		}
		return [...map.values()].sort((a, b) => b.mins - a.mins);
	}, [rows]);
	const text = (0, import_react.useMemo)(() => {
		if (from === to) return buildDiarioText(from, rows);
		return [...new Set(rows.map((r) => r.date))].map((d) => buildDiarioText(d, rows.filter((r) => r.date === d))).join("\n\n");
	}, [
		from,
		to,
		rows
	]);
	async function copy() {
		await navigator.clipboard.writeText(text);
		toast.success("Diário copiado");
	}
	async function share() {
		if (navigator.share) {
			await navigator.share({
				title: "Diário de apontamento",
				text
			});
			return;
		}
		await copy();
	}
	function exportCsv() {
		downloadText(`apontamento_${from}_${to}.csv`, apontamentosToCsv(rows), "text/csv;charset=utf-8");
		toast.success("Planilha baixada (abre no Excel)");
	}
	function exportPdf() {
		printReport("Relatório de apontamento", `
      <h1>Relatório de apontamento</h1>
      <p class="meta">${formatDateBR(from)} a ${formatDateBR(to)} · ${rows.length} registros</p>
      <table>
        <thead><tr>
          <th>Horário</th><th>Máquina</th><th>Atividade</th><th>Rua</th><th>Estaca</th><th>PV</th>
        </tr></thead>
        <tbody>
          ${rows.map((a) => `<tr>
            <td>${formatDateBR(a.date)}<br/>${a.start}${a.end ? `–${a.end}` : ""}</td>
            <td>${esc(a.equipmentName)}</td>
            <td>${esc(a.activityName)}${a.notes ? `<div class="desc">${esc(a.notes)}</div>` : ""}</td>
            <td>${esc(a.streetName)}</td>
            <td>${esc(a.estaca)}</td>
            <td>${esc(a.pv)}</td>
          </tr>`).join("")}
        </tbody>
      </table>`);
	}
	if (isLoading && !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenLoader, {}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Relatório"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: "Resumo, Excel e PDF do período — de toda a equipe."
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex flex-col gap-4 px-4 pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "De" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: from,
					onChange: (e) => setFrom(e.target.value)
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Até" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					type: "date",
					value: to,
					onChange: (e) => setTo(e.target.value)
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4 shadow-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [rows.length, " apontamentos no período"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 flex flex-col gap-2",
					children: [byEq.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 truncate font-medium",
							children: e.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 tabular-nums text-muted",
							children: [
								e.n,
								" · ",
								formatDuration(e.mins)
							]
						})]
					}, e.name)), byEq.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "Sem dados neste intervalo."
					}) : null]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportCsv,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Excel"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: exportPdf,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), "PDF"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => void copy(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), "Copiar"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => void share(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" }), "Enviar"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 font-sans text-sm leading-relaxed text-fg",
				children: text || "Nada para exportar."
			})
		]
	})] });
}
function esc(s) {
	return s.replace(/[&<>]/g, (c) => {
		if (c === "&") return "&amp;";
		if (c === "<") return "&lt;";
		if (c === ">") return "&gt;";
		return c;
	});
}
//#endregion
export { Relatorio as component };
