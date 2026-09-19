import { l as todayISO, s as nowHHMM } from "./utils-C8V_sHGQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/draft-DPWSbq1K.js
function emptyDraft(last) {
	return {
		date: todayISO(),
		start: nowHHMM(),
		end: nowHHMM(),
		ended: false,
		workId: last.workId,
		streetId: last.streetId,
		equipmentId: last.equipmentId,
		activityId: last.activityId,
		estaca: "",
		pv: "",
		quantity: "",
		notes: ""
	};
}
function draftFromApontamento(a) {
	return {
		id: a.id,
		date: a.date,
		start: a.start,
		end: a.end ?? nowHHMM(),
		ended: Boolean(a.end),
		workId: a.workId,
		streetId: a.streetId,
		equipmentId: a.equipmentId,
		activityId: a.activityId,
		estaca: a.estaca,
		pv: a.pv,
		quantity: a.quantity == null ? "" : String(a.quantity),
		notes: a.notes
	};
}
//#endregion
export { emptyDraft as n, draftFromApontamento as t };
