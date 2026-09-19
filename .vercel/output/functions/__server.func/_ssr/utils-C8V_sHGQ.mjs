import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-C8V_sHGQ.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function todayISO() {
	const d = /* @__PURE__ */ new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function nowHHMM() {
	const d = /* @__PURE__ */ new Date();
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function formatDateBR(iso) {
	const [y, m, d] = iso.split("-");
	if (!y || !m || !d) return iso;
	return `${d}/${m}/${y}`;
}
function formatEstaca(value) {
	const v = value.trim();
	if (!v) return "";
	if (/^e\s?/i.test(v) || /\+/.test(v)) return v.replace(/^e\s*/i, "E ").toUpperCase();
	if (/^\d+$/.test(v)) return `E ${v}`;
	return v;
}
function minutesBetween(start, end) {
	const [sh, sm] = start.split(":").map(Number);
	const [eh, em] = end.split(":").map(Number);
	if ([
		sh,
		sm,
		eh,
		em
	].some((n) => Number.isNaN(n))) return 0;
	return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}
function formatDuration(mins) {
	if (mins <= 0) return "0 min";
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	if (h === 0) return `${m} min`;
	if (m === 0) return `${h}h`;
	return `${h}h ${String(m).padStart(2, "0")}`;
}
function uid() {
	if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
	return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function formatAccuracy(m) {
	if (m >= 1e3) return `${(m / 1e3).toFixed(1)} km`;
	return `${Math.round(m)} m`;
}
function relativeTime(iso) {
	const t = new Date(iso).getTime();
	if (!Number.isFinite(t)) return "";
	const diff = Math.max(0, Date.now() - t);
	const sec = Math.round(diff / 1e3);
	if (sec < 20) return "agora";
	if (sec < 60) return `${sec}s`;
	const min = Math.round(sec / 60);
	if (min < 60) return `${min} min`;
	return `${Math.round(min / 60)}h`;
}
//#endregion
export { formatEstaca as a, relativeTime as c, formatDuration as i, todayISO as l, formatAccuracy as n, minutesBetween as o, formatDateBR as r, nowHHMM as s, cn as t, uid as u };
