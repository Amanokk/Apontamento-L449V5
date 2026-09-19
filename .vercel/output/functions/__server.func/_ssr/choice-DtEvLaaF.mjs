import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-C8V_sHGQ.mjs";
import { S as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/choice-DtEvLaaF.js
var import_jsx_runtime = require_jsx_runtime();
function ChoiceList({ options, value, onChange, columns = 1 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1"),
		children: options.map((o) => {
			const on = o.id === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(o.id),
				className: cn("flex min-h-12 items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color,color,transform] duration-150 ease-out", on ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg hover:bg-surface-2"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium leading-snug",
						children: o.label
					}), o.hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("block text-xs", on ? "text-primary-fg/80" : "text-muted"),
						children: o.hint
					}) : null]
				}), on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
					className: "size-4 shrink-0",
					strokeWidth: 2.4
				}) : null]
			}, o.id);
		})
	});
}
function ToggleList({ options, selected, onToggle }) {
	const set = new Set(selected);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-1 gap-1.5",
		children: options.map((o) => {
			const on = set.has(o.id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onToggle(o.id),
				className: cn("flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm", on ? "border-primary bg-primary/10 text-fg" : "border-transparent bg-surface text-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("flex size-5 items-center justify-center rounded-sm border", on ? "border-primary bg-primary text-primary-fg" : "border-border"),
					children: on ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3",
						strokeWidth: 3
					}) : null
				}), o.label]
			}, o.id);
		})
	});
}
function ChipRow({ options, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: options.map((o) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(o),
				className: cn("h-9 rounded-full border px-3 text-sm font-medium transition-colors duration-150", o === value ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg"),
				children: o
			}, o);
		})
	});
}
//#endregion
export { ChoiceList as n, ToggleList as r, ChipRow as t };
