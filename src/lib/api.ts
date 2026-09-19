import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ACTIVITIES, EQUIPMENT, STREETS, WORKS } from "./catalog";
import { buildDescription } from "./description";
import { getSql } from "./db";
import type {
  Activity,
  ActivityKind,
  Apontamento,
  Equipment,
  EquipmentKind,
  Presence,
  Snapshot,
  Street,
  Work,
} from "./types";
import { todayISO, uid } from "./utils";

function asIds(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v) as unknown;
      return Array.isArray(p) ? p.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asKind(v: string): EquipmentKind {
  if (v === "retro" || v === "rolo" || v === "basculante" || v === "pipa" || v === "van" || v === "truck") {
    return v;
  }
  return "truck";
}

function asActKind(v: string): ActivityKind {
  if (v === "servico" || v === "status" || v === "deslocamento") return v;
  return "servico";
}

function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  return new Date().toISOString();
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

type WorkRow = { id: string; code: string; name: string; active: boolean };
type StreetRow = { id: string; name: string; work_id: string; active: boolean };
type ActivityRow = { id: string; name: string; kind: string; code: string | null };
type EqRow = {
  id: string;
  code: string;
  name: string;
  kind: string;
  plate: string | null;
  activity_ids: unknown;
  active: boolean;
};
type AptRow = {
  id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  work_id: string;
  work_name: string;
  street_id: string;
  street_name: string;
  equipment_id: string;
  equipment_name: string;
  equipment_kind: string;
  activity_id: string;
  activity_name: string;
  estaca: string;
  pv: string;
  quantity: number | null;
  notes: string;
  description: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  location_label: string;
  device_id: string;
  created_at: unknown;
  updated_at: unknown;
};
type PresenceRow = {
  device_id: string;
  label: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  work_id: string | null;
  equipment_id: string | null;
  street_id: string | null;
  updated_at: unknown;
};

function mapWork(r: WorkRow): Work {
  return { id: r.id, code: r.code, name: r.name, active: Boolean(r.active) };
}
function mapStreet(r: StreetRow): Street {
  return { id: r.id, name: r.name, workId: r.work_id, active: Boolean(r.active) };
}
function mapActivity(r: ActivityRow): Activity {
  return { id: r.id, name: r.name, kind: asActKind(r.kind), code: r.code ?? undefined };
}
function mapEq(r: EqRow): Equipment {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    kind: asKind(r.kind),
    plate: r.plate ?? undefined,
    activityIds: asIds(r.activity_ids),
    active: Boolean(r.active),
  };
}
function mapApt(r: AptRow): Apontamento {
  return {
    id: r.id,
    date: String(r.date).slice(0, 10),
    start: r.start_time,
    end: r.end_time,
    workId: r.work_id,
    workName: r.work_name,
    streetId: r.street_id,
    streetName: r.street_name,
    equipmentId: r.equipment_id,
    equipmentName: r.equipment_name,
    equipmentKind: asKind(r.equipment_kind),
    activityId: r.activity_id,
    activityName: r.activity_name,
    estaca: r.estaca,
    pv: r.pv,
    quantity: num(r.quantity),
    notes: r.notes,
    description: r.description,
    lat: num(r.lat),
    lng: num(r.lng),
    accuracy: num(r.accuracy),
    locationLabel: r.location_label,
    deviceId: r.device_id,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}
function mapPresence(r: PresenceRow): Presence {
  return {
    deviceId: r.device_id,
    label: r.label,
    lat: Number(r.lat),
    lng: Number(r.lng),
    accuracy: num(r.accuracy),
    workId: r.work_id,
    equipmentId: r.equipment_id,
    streetId: r.street_id,
    updatedAt: iso(r.updated_at),
  };
}

async function ensureSeed() {
  const sql = await getSql();
  const count = await sql<{ n: number }>`select count(*)::int as n from works`;
  if ((count[0]?.n ?? 0) > 0) return;

  for (const w of WORKS) {
    await sql`insert into works (id, code, name, active) values (${w.id}, ${w.code}, ${w.name}, ${w.active})`;
  }
  for (const s of STREETS) {
    await sql`insert into streets (id, name, work_id, active) values (${s.id}, ${s.name}, ${s.workId}, ${s.active})`;
  }
  for (const a of ACTIVITIES) {
    await sql`insert into activities (id, name, kind, code) values (${a.id}, ${a.name}, ${a.kind}, ${a.code ?? null})`;
  }
  for (const e of EQUIPMENT) {
    const ids = JSON.stringify(e.activityIds);
    await sql`insert into equipment (id, code, name, kind, plate, activity_ids, active)
      values (${e.id}, ${e.code}, ${e.name}, ${e.kind}, ${e.plate ?? null}, ${ids}::jsonb, ${e.active})`;
  }

  const day = todayISO();
  const samples: Array<{
    id: string;
    start: string;
    end: string | null;
    eq: (typeof EQUIPMENT)[number];
    actId: string;
    street: (typeof STREETS)[number];
    estaca: string;
    pv: string;
    lat: number;
    lng: number;
    notes: string;
  }> = [
    {
      id: "seed-1",
      start: "07:30",
      end: null,
      eq: EQUIPMENT[0],
      actId: "exec-caixa-ralo",
      street: STREETS[0],
      estaca: "15+20",
      pv: "PVD-08",
      lat: -22.8684,
      lng: -43.7718,
      notes: "",
    },
    {
      id: "seed-2",
      start: "08:10",
      end: "09:40",
      eq: EQUIPMENT[6],
      actId: "carreg-bica-base",
      street: STREETS[1],
      estaca: "18+00",
      pv: "",
      lat: -22.8698,
      lng: -43.7742,
      notes: "3 viagens",
    },
    {
      id: "seed-3",
      start: "09:00",
      end: null,
      eq: EQUIPMENT[5],
      actId: "comp-subbase",
      street: STREETS[0],
      estaca: "16+40",
      pv: "PVC-04",
      lat: -22.8671,
      lng: -43.7705,
      notes: "",
    },
  ];

  for (const s of samples) {
    const act = ACTIVITIES.find((a) => a.id === s.actId);
    const work = WORKS.find((w) => w.id === s.street.workId)!;
    const description = buildDescription({
      equipmentName: s.eq.name,
      activityName: act?.name ?? "",
      streetName: s.street.name,
      estaca: s.estaca,
      pv: s.pv,
    });
    await sql`insert into apontamentos (
      id, date, start_time, end_time, work_id, work_name, street_id, street_name,
      equipment_id, equipment_name, equipment_kind, activity_id, activity_name,
      estaca, pv, quantity, notes, description, lat, lng, accuracy, location_label, device_id
    ) values (
      ${s.id}, ${day}::date, ${s.start}, ${s.end}, ${work.id}, ${`${work.code} ${work.name}`},
      ${s.street.id}, ${s.street.name}, ${s.eq.id}, ${s.eq.name}, ${s.eq.kind},
      ${s.actId}, ${act?.name ?? ""}, ${s.estaca}, ${s.pv}, ${s.notes ? 3 : null},
      ${s.notes}, ${description}, ${s.lat}, ${s.lng}, ${12}, ${s.street.name}, ${"seed"}
    )`;
  }
}

export const getSnapshot = createServerFn({ method: "GET" }).handler(async (): Promise<Snapshot> => {
  await ensureSeed();
  const sql = await getSql();
  const [works, streets, equipment, activities, apontamentos, presence] = await Promise.all([
    sql<WorkRow>`select id, code, name, active from works order by code`,
    sql<StreetRow>`select id, name, work_id, active from streets order by name`,
    sql<EqRow>`select id, code, name, kind, plate, activity_ids, active from equipment order by code`,
    sql<ActivityRow>`select id, name, kind, code from activities order by name`,
    sql<AptRow>`select * from apontamentos order by date desc, start_time desc limit 400`,
    sql<PresenceRow>`select * from presence where updated_at > now() - interval '4 minutes'`,
  ]);
  return {
    works: works.map(mapWork),
    streets: streets.map(mapStreet),
    equipment: equipment.map(mapEq),
    activities: activities.map(mapActivity),
    apontamentos: apontamentos.map(mapApt),
    presence: presence.map(mapPresence),
  };
});

const saveSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(8),
  start: z.string().min(4),
  end: z.string().nullable(),
  workId: z.string(),
  streetId: z.string(),
  equipmentId: z.string(),
  activityId: z.string(),
  estaca: z.string(),
  pv: z.string(),
  quantity: z.number().nullable(),
  notes: z.string(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  accuracy: z.number().nullable(),
  locationLabel: z.string(),
  deviceId: z.string(),
});

export type SavePayload = z.infer<typeof saveSchema>;

export const upsertApontamento = createServerFn({ method: "POST" })
  .validator(saveSchema)
  .handler(async ({ data }): Promise<Apontamento> => {
    const sql = await getSql();
    const [work] = await sql<WorkRow>`select * from works where id = ${data.workId}`;
    const [street] = await sql<StreetRow>`select * from streets where id = ${data.streetId}`;
    const [eq] = await sql<EqRow>`select * from equipment where id = ${data.equipmentId}`;
    const [act] = await sql<ActivityRow>`select * from activities where id = ${data.activityId}`;
    const workName = work ? `${work.code} ${work.name}` : "";
    const streetName = street?.name ?? "";
    const equipmentName = eq?.name ?? "";
    const activityName = act?.name ?? "";
    const description = buildDescription({
      equipmentName,
      activityName,
      streetName,
      estaca: data.estaca,
      pv: data.pv,
    });

    if (!data.end) {
      await sql`update apontamentos
        set end_time = ${data.start}, updated_at = now()
        where equipment_id = ${data.equipmentId}
          and end_time is null
          and date = ${data.date}::date
          and id <> ${data.id}`;
    }

    await sql`insert into apontamentos (
      id, date, start_time, end_time, work_id, work_name, street_id, street_name,
      equipment_id, equipment_name, equipment_kind, activity_id, activity_name,
      estaca, pv, quantity, notes, description, lat, lng, accuracy, location_label, device_id, updated_at
    ) values (
      ${data.id}, ${data.date}::date, ${data.start}, ${data.end}, ${data.workId}, ${workName},
      ${data.streetId}, ${streetName}, ${data.equipmentId}, ${equipmentName}, ${eq?.kind ?? "truck"},
      ${data.activityId}, ${activityName}, ${data.estaca}, ${data.pv}, ${data.quantity},
      ${data.notes}, ${description}, ${data.lat}, ${data.lng}, ${data.accuracy}, ${data.locationLabel},
      ${data.deviceId}, now()
    )
    on conflict (id) do update set
      date = excluded.date,
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      work_id = excluded.work_id,
      work_name = excluded.work_name,
      street_id = excluded.street_id,
      street_name = excluded.street_name,
      equipment_id = excluded.equipment_id,
      equipment_name = excluded.equipment_name,
      equipment_kind = excluded.equipment_kind,
      activity_id = excluded.activity_id,
      activity_name = excluded.activity_name,
      estaca = excluded.estaca,
      pv = excluded.pv,
      quantity = excluded.quantity,
      notes = excluded.notes,
      description = excluded.description,
      lat = excluded.lat,
      lng = excluded.lng,
      accuracy = excluded.accuracy,
      location_label = excluded.location_label,
      updated_at = now()`;

    const [row] = await sql<AptRow>`select * from apontamentos where id = ${data.id}`;
    return mapApt(row);
  });

export const closeApontamento = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), end: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update apontamentos set end_time = ${data.end}, updated_at = now() where id = ${data.id}`;
    return { ok: true };
  });

export const deleteApontamento = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from apontamentos where id = ${data.id}`;
    return { ok: true };
  });

const presenceSchema = z.object({
  deviceId: z.string().min(1),
  label: z.string(),
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().nullable(),
  workId: z.string().nullable(),
  equipmentId: z.string().nullable(),
  streetId: z.string().nullable(),
});

export const pingPresence = createServerFn({ method: "POST" })
  .validator(presenceSchema)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from presence where updated_at < now() - interval '10 minutes'`;
    await sql`insert into presence (device_id, label, lat, lng, accuracy, work_id, equipment_id, street_id, updated_at)
      values (${data.deviceId}, ${data.label.slice(0, 24)}, ${data.lat}, ${data.lng}, ${data.accuracy},
        ${data.workId}, ${data.equipmentId}, ${data.streetId}, now())
      on conflict (device_id) do update set
        label = excluded.label,
        lat = excluded.lat,
        lng = excluded.lng,
        accuracy = excluded.accuracy,
        work_id = excluded.work_id,
        equipment_id = excluded.equipment_id,
        street_id = excluded.street_id,
        updated_at = now()`;
    return { ok: true };
  });

export const getPresence = createServerFn({ method: "GET" }).handler(async (): Promise<Presence[]> => {
  const sql = await getSql();
  const presence = await sql<PresenceRow>`select * from presence where updated_at > now() - interval '4 minutes'`;
  return presence.map(mapPresence);
});

export const reverseGeocode = createServerFn({ method: "POST" })
  .validator(z.object({ lat: z.number(), lng: z.number() }))
  .handler(async ({ data }) => {
    const lat = Number(data.lat.toFixed(4));
    const lng = Number(data.lng.toFixed(4));
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Apontador/1.0 (field timesheet)", Accept: "application/json" },
      });
      if (!res.ok) return { label: "", road: "", city: "" };
      const json = (await res.json()) as {
        display_name?: string;
        address?: { road?: string; pedestrian?: string; suburb?: string; city?: string; town?: string; village?: string };
      };
      const road = json.address?.road || json.address?.pedestrian || "";
      const city = json.address?.city || json.address?.town || json.address?.village || json.address?.suburb || "";
      const label = [road, city].filter(Boolean).join(" · ") || json.display_name || "";
      return { label, road, city };
    } catch {
      return { label: "", road: "", city: "" };
    }
  });

export const addWork = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().min(1), name: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = uid();
    await sql`insert into works (id, code, name, active) values (${id}, ${data.code}, ${data.name}, true)`;
    return { id };
  });

export const addStreet = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1), workId: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = uid();
    await sql`insert into streets (id, name, work_id, active) values (${id}, ${data.name}, ${data.workId}, true)`;
    return { id };
  });

export const addEquipment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      name: z.string().min(1),
      code: z.string().min(1),
      kind: z.enum(["retro", "rolo", "basculante", "pipa", "van", "truck"]),
      activityIds: z.array(z.string()),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = uid();
    const ids = JSON.stringify(data.activityIds);
    await sql`insert into equipment (id, code, name, kind, activity_ids, active)
      values (${id}, ${data.code}, ${data.name}, ${data.kind}, ${ids}::jsonb, true)`;
    return { id };
  });

export const updateEquipment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      code: z.string().optional(),
      kind: z.enum(["retro", "rolo", "basculante", "pipa", "van", "truck"]).optional(),
      activityIds: z.array(z.string()).optional(),
      active: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const [cur] = await sql<EqRow>`select * from equipment where id = ${data.id}`;
    if (!cur) return { ok: false };
    const name = data.name ?? cur.name;
    const code = data.code ?? cur.code;
    const kind = data.kind ?? cur.kind;
    const active = data.active ?? cur.active;
    const ids = JSON.stringify(data.activityIds ?? asIds(cur.activity_ids));
    await sql`update equipment set name = ${name}, code = ${code}, kind = ${kind}, activity_ids = ${ids}::jsonb, active = ${active} where id = ${data.id}`;
    return { ok: true };
  });

export const toggleStreet = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`update streets set active = not active where id = ${data.id}`;
    return { ok: true };
  });

export const addActivity = createServerFn({ method: "POST" })
  .validator(z.object({ name: z.string().min(1), equipmentId: z.string().optional() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const id = uid();
    await sql`insert into activities (id, name, kind) values (${id}, ${data.name}, ${"servico"})`;
    if (data.equipmentId) {
      const [eq] = await sql<EqRow>`select * from equipment where id = ${data.equipmentId}`;
      if (eq) {
        const ids = JSON.stringify([...asIds(eq.activity_ids), id]);
        await sql`update equipment set activity_ids = ${ids}::jsonb where id = ${data.equipmentId}`;
      }
    }
    return { id };
  });
