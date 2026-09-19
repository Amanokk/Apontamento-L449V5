import type { Apontamento, Draft, LastUsed } from "./types";
import { nowHHMM, todayISO } from "./utils";

export function emptyDraft(last: LastUsed): Draft {
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
    notes: "",
  };
}

export function draftFromApontamento(a: Apontamento): Draft {
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
    notes: a.notes,
  };
}
