import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { c as WORKS, n as EQUIPMENT, s as STREETS, t as ACTIVITIES } from "./catalog-Dpw3AA8E.mjs";
import { l as todayISO, u as uid } from "./utils-C8V_sHGQ.mjs";
import { t as buildDescription } from "./description-g2nIFaeH.mjs";
import { a as number, n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api--T8NXJcM.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_schema_default = "create table if not exists works (\n  id text primary key,\n  code text not null,\n  name text not null,\n  active boolean not null default true\n);\n\ncreate table if not exists streets (\n  id text primary key,\n  name text not null,\n  work_id text not null references works (id),\n  active boolean not null default true\n);\n\ncreate table if not exists activities (\n  id text primary key,\n  name text not null,\n  kind text not null,\n  code text\n);\n\ncreate table if not exists equipment (\n  id text primary key,\n  code text not null,\n  name text not null,\n  kind text not null,\n  plate text,\n  activity_ids jsonb not null default '[]'::jsonb,\n  active boolean not null default true\n);\n\ncreate table if not exists apontamentos (\n  id text primary key,\n  date date not null,\n  start_time text not null,\n  end_time text,\n  work_id text not null,\n  work_name text not null,\n  street_id text not null,\n  street_name text not null,\n  equipment_id text not null,\n  equipment_name text not null,\n  equipment_kind text not null,\n  activity_id text not null,\n  activity_name text not null,\n  estaca text not null default '',\n  pv text not null default '',\n  quantity double precision,\n  notes text not null default '',\n  description text not null default '',\n  lat double precision,\n  lng double precision,\n  accuracy double precision,\n  location_label text not null default '',\n  device_id text not null default '',\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists apontamentos_date_idx on apontamentos (date desc, start_time desc);\n\ncreate table if not exists presence (\n  device_id text primary key,\n  label text not null default '',\n  lat double precision not null,\n  lng double precision not null,\n  accuracy double precision,\n  work_id text,\n  equipment_id text,\n  street_id text,\n  updated_at timestamptz not null default now()\n);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_schema.sql": _0002_schema_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function asIds(v) {
	if (Array.isArray(v)) return v.map(String);
	if (typeof v === "string") try {
		const p = JSON.parse(v);
		return Array.isArray(p) ? p.map(String) : [];
	} catch {
		return [];
	}
	return [];
}
function asKind(v) {
	if (v === "retro" || v === "rolo" || v === "basculante" || v === "pipa" || v === "van" || v === "truck") return v;
	return "truck";
}
function asActKind(v) {
	if (v === "servico" || v === "status" || v === "deslocamento") return v;
	return "servico";
}
function iso(v) {
	if (v instanceof Date) return v.toISOString();
	if (typeof v === "string") return v;
	return (/* @__PURE__ */ new Date()).toISOString();
}
function num(v) {
	if (v == null) return null;
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : null;
}
function mapWork(r) {
	return {
		id: r.id,
		code: r.code,
		name: r.name,
		active: Boolean(r.active)
	};
}
function mapStreet(r) {
	return {
		id: r.id,
		name: r.name,
		workId: r.work_id,
		active: Boolean(r.active)
	};
}
function mapActivity(r) {
	return {
		id: r.id,
		name: r.name,
		kind: asActKind(r.kind),
		code: r.code ?? void 0
	};
}
function mapEq(r) {
	return {
		id: r.id,
		code: r.code,
		name: r.name,
		kind: asKind(r.kind),
		plate: r.plate ?? void 0,
		activityIds: asIds(r.activity_ids),
		active: Boolean(r.active)
	};
}
function mapApt(r) {
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
		updatedAt: iso(r.updated_at)
	};
}
function mapPresence(r) {
	return {
		deviceId: r.device_id,
		label: r.label,
		lat: Number(r.lat),
		lng: Number(r.lng),
		accuracy: num(r.accuracy),
		workId: r.work_id,
		equipmentId: r.equipment_id,
		streetId: r.street_id,
		updatedAt: iso(r.updated_at)
	};
}
async function ensureSeed() {
	const sql = await getSql();
	if (((await sql`select count(*)::int as n from works`)[0]?.n ?? 0) > 0) return;
	for (const w of WORKS) await sql`insert into works (id, code, name, active) values (${w.id}, ${w.code}, ${w.name}, ${w.active})`;
	for (const s of STREETS) await sql`insert into streets (id, name, work_id, active) values (${s.id}, ${s.name}, ${s.workId}, ${s.active})`;
	for (const a of ACTIVITIES) await sql`insert into activities (id, name, kind, code) values (${a.id}, ${a.name}, ${a.kind}, ${a.code ?? null})`;
	for (const e of EQUIPMENT) {
		const ids = JSON.stringify(e.activityIds);
		await sql`insert into equipment (id, code, name, kind, plate, activity_ids, active)
      values (${e.id}, ${e.code}, ${e.name}, ${e.kind}, ${e.plate ?? null}, ${ids}::jsonb, ${e.active})`;
	}
	const day = todayISO();
	const samples = [
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
			notes: ""
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
			notes: "3 viagens"
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
			notes: ""
		}
	];
	for (const s of samples) {
		const act = ACTIVITIES.find((a) => a.id === s.actId);
		const work = WORKS.find((w) => w.id === s.street.workId);
		const description = buildDescription({
			equipmentName: s.eq.name,
			activityName: act?.name ?? "",
			streetName: s.street.name,
			estaca: s.estaca,
			pv: s.pv
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
var getSnapshot_createServerFn_handler = createServerRpc({
	id: "8d42ed533f9e880af7d4b9c7f833591bfa25f76948cdffd848723661f020b3dc",
	name: "getSnapshot",
	filename: "src/lib/api.ts"
}, (opts) => getSnapshot.__executeServer(opts));
var getSnapshot = createServerFn({ method: "GET" }).handler(getSnapshot_createServerFn_handler, async () => {
	await ensureSeed();
	const sql = await getSql();
	const [works, streets, equipment, activities, apontamentos, presence] = await Promise.all([
		sql`select id, code, name, active from works order by code`,
		sql`select id, name, work_id, active from streets order by name`,
		sql`select id, code, name, kind, plate, activity_ids, active from equipment order by code`,
		sql`select id, name, kind, code from activities order by name`,
		sql`select * from apontamentos order by date desc, start_time desc limit 400`,
		sql`select * from presence where updated_at > now() - interval '4 minutes'`
	]);
	return {
		works: works.map(mapWork),
		streets: streets.map(mapStreet),
		equipment: equipment.map(mapEq),
		activities: activities.map(mapActivity),
		apontamentos: apontamentos.map(mapApt),
		presence: presence.map(mapPresence)
	};
});
var saveSchema = object({
	id: string().min(1),
	date: string().min(8),
	start: string().min(4),
	end: string().nullable(),
	workId: string(),
	streetId: string(),
	equipmentId: string(),
	activityId: string(),
	estaca: string(),
	pv: string(),
	quantity: number().nullable(),
	notes: string(),
	lat: number().nullable(),
	lng: number().nullable(),
	accuracy: number().nullable(),
	locationLabel: string(),
	deviceId: string()
});
var upsertApontamento_createServerFn_handler = createServerRpc({
	id: "ce847625bb57870d3161edb5b1541a32a2202cd294a7b5430ce2b1fde6de1c25",
	name: "upsertApontamento",
	filename: "src/lib/api.ts"
}, (opts) => upsertApontamento.__executeServer(opts));
var upsertApontamento = createServerFn({ method: "POST" }).validator(saveSchema).handler(upsertApontamento_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const [work] = await sql`select * from works where id = ${data.workId}`;
	const [street] = await sql`select * from streets where id = ${data.streetId}`;
	const [eq] = await sql`select * from equipment where id = ${data.equipmentId}`;
	const [act] = await sql`select * from activities where id = ${data.activityId}`;
	const workName = work ? `${work.code} ${work.name}` : "";
	const streetName = street?.name ?? "";
	const equipmentName = eq?.name ?? "";
	const activityName = act?.name ?? "";
	const description = buildDescription({
		equipmentName,
		activityName,
		streetName,
		estaca: data.estaca,
		pv: data.pv
	});
	if (!data.end) await sql`update apontamentos
        set end_time = ${data.start}, updated_at = now()
        where equipment_id = ${data.equipmentId}
          and end_time is null
          and date = ${data.date}::date
          and id <> ${data.id}`;
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
	const [row] = await sql`select * from apontamentos where id = ${data.id}`;
	return mapApt(row);
});
var closeApontamento_createServerFn_handler = createServerRpc({
	id: "5c192a039b56d8e46a700abb17a5ffee18cbbf2d67bd0f12298a306bdd13d0e7",
	name: "closeApontamento",
	filename: "src/lib/api.ts"
}, (opts) => closeApontamento.__executeServer(opts));
var closeApontamento = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	end: string()
})).handler(closeApontamento_createServerFn_handler, async ({ data }) => {
	await (await getSql())`update apontamentos set end_time = ${data.end}, updated_at = now() where id = ${data.id}`;
	return { ok: true };
});
var deleteApontamento_createServerFn_handler = createServerRpc({
	id: "c0663af8e30866edb8347b722afe0e997ea4d393f77a8ef50929d7c835316f64",
	name: "deleteApontamento",
	filename: "src/lib/api.ts"
}, (opts) => deleteApontamento.__executeServer(opts));
var deleteApontamento = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(deleteApontamento_createServerFn_handler, async ({ data }) => {
	await (await getSql())`delete from apontamentos where id = ${data.id}`;
	return { ok: true };
});
var presenceSchema = object({
	deviceId: string().min(1),
	label: string(),
	lat: number(),
	lng: number(),
	accuracy: number().nullable(),
	workId: string().nullable(),
	equipmentId: string().nullable(),
	streetId: string().nullable()
});
var pingPresence_createServerFn_handler = createServerRpc({
	id: "eef9a9df9c5ee2b86cde8892389b36bf627bdf3a94ed759df0f5daccf6550719",
	name: "pingPresence",
	filename: "src/lib/api.ts"
}, (opts) => pingPresence.__executeServer(opts));
var pingPresence = createServerFn({ method: "POST" }).validator(presenceSchema).handler(pingPresence_createServerFn_handler, async ({ data }) => {
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
var getPresence_createServerFn_handler = createServerRpc({
	id: "00292b52dd7688df04a75490ecb496222dc0fa08d0395f0171ed923baec56cf8",
	name: "getPresence",
	filename: "src/lib/api.ts"
}, (opts) => getPresence.__executeServer(opts));
var getPresence = createServerFn({ method: "GET" }).handler(getPresence_createServerFn_handler, async () => {
	return (await (await getSql())`select * from presence where updated_at > now() - interval '4 minutes'`).map(mapPresence);
});
var reverseGeocode_createServerFn_handler = createServerRpc({
	id: "9adbf68a15d15b1c3afe18f38f6440b0816972ca3405db633a16ff37230a28af",
	name: "reverseGeocode",
	filename: "src/lib/api.ts"
}, (opts) => reverseGeocode.__executeServer(opts));
var reverseGeocode = createServerFn({ method: "POST" }).validator(object({
	lat: number(),
	lng: number()
})).handler(reverseGeocode_createServerFn_handler, async ({ data }) => {
	const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${Number(data.lat.toFixed(4))}&lon=${Number(data.lng.toFixed(4))}&zoom=18&addressdetails=1`;
	try {
		const res = await fetch(url, { headers: {
			"User-Agent": "Apontador/1.0 (field timesheet)",
			Accept: "application/json"
		} });
		if (!res.ok) return {
			label: "",
			road: "",
			city: ""
		};
		const json = await res.json();
		const road = json.address?.road || json.address?.pedestrian || "";
		const city = json.address?.city || json.address?.town || json.address?.village || json.address?.suburb || "";
		return {
			label: [road, city].filter(Boolean).join(" · ") || json.display_name || "",
			road,
			city
		};
	} catch {
		return {
			label: "",
			road: "",
			city: ""
		};
	}
});
var addWork_createServerFn_handler = createServerRpc({
	id: "bcb49d7dde462ae0dc5126adee0ca7fccca81b652363a307d1137dada119b28a",
	name: "addWork",
	filename: "src/lib/api.ts"
}, (opts) => addWork.__executeServer(opts));
var addWork = createServerFn({ method: "POST" }).validator(object({
	code: string().min(1),
	name: string().min(1)
})).handler(addWork_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = uid();
	await sql`insert into works (id, code, name, active) values (${id}, ${data.code}, ${data.name}, true)`;
	return { id };
});
var addStreet_createServerFn_handler = createServerRpc({
	id: "9cff1b772483fd6081dbf3a0cabbcfdfb0caa742731a4ba634c078ffca059d09",
	name: "addStreet",
	filename: "src/lib/api.ts"
}, (opts) => addStreet.__executeServer(opts));
var addStreet = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1),
	workId: string()
})).handler(addStreet_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = uid();
	await sql`insert into streets (id, name, work_id, active) values (${id}, ${data.name}, ${data.workId}, true)`;
	return { id };
});
var addEquipment_createServerFn_handler = createServerRpc({
	id: "248ee50e388b9300d95f63360cb601a04b13b11dedadbe2c9f883c8601c0a51d",
	name: "addEquipment",
	filename: "src/lib/api.ts"
}, (opts) => addEquipment.__executeServer(opts));
var addEquipment = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1),
	code: string().min(1),
	kind: _enum([
		"retro",
		"rolo",
		"basculante",
		"pipa",
		"van",
		"truck"
	]),
	activityIds: array(string())
})).handler(addEquipment_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = uid();
	const ids = JSON.stringify(data.activityIds);
	await sql`insert into equipment (id, code, name, kind, activity_ids, active)
      values (${id}, ${data.code}, ${data.name}, ${data.kind}, ${ids}::jsonb, true)`;
	return { id };
});
var updateEquipment_createServerFn_handler = createServerRpc({
	id: "3d1c7dda79a7fdc17ceaf7ce20ff72734e2352e3f10bb2afdbfade1555773006",
	name: "updateEquipment",
	filename: "src/lib/api.ts"
}, (opts) => updateEquipment.__executeServer(opts));
var updateEquipment = createServerFn({ method: "POST" }).validator(object({
	id: string(),
	name: string().optional(),
	code: string().optional(),
	kind: _enum([
		"retro",
		"rolo",
		"basculante",
		"pipa",
		"van",
		"truck"
	]).optional(),
	activityIds: array(string()).optional(),
	active: boolean().optional()
})).handler(updateEquipment_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const [cur] = await sql`select * from equipment where id = ${data.id}`;
	if (!cur) return { ok: false };
	const name = data.name ?? cur.name;
	const code = data.code ?? cur.code;
	const kind = data.kind ?? cur.kind;
	const active = data.active ?? cur.active;
	await sql`update equipment set name = ${name}, code = ${code}, kind = ${kind}, activity_ids = ${JSON.stringify(data.activityIds ?? asIds(cur.activity_ids))}::jsonb, active = ${active} where id = ${data.id}`;
	return { ok: true };
});
var toggleStreet_createServerFn_handler = createServerRpc({
	id: "1a2e2f9a5e6c0cc2b16ff18ef04730889735175557329211235f34cd2ae03aab",
	name: "toggleStreet",
	filename: "src/lib/api.ts"
}, (opts) => toggleStreet.__executeServer(opts));
var toggleStreet = createServerFn({ method: "POST" }).validator(object({ id: string() })).handler(toggleStreet_createServerFn_handler, async ({ data }) => {
	await (await getSql())`update streets set active = not active where id = ${data.id}`;
	return { ok: true };
});
var addActivity_createServerFn_handler = createServerRpc({
	id: "572516a8071f85131a32827d9675f8cfa4007eecf89ca944dfe1c2fd25c2a9e9",
	name: "addActivity",
	filename: "src/lib/api.ts"
}, (opts) => addActivity.__executeServer(opts));
var addActivity = createServerFn({ method: "POST" }).validator(object({
	name: string().min(1),
	equipmentId: string().optional()
})).handler(addActivity_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const id = uid();
	await sql`insert into activities (id, name, kind) values (${id}, ${data.name}, ${"servico"})`;
	if (data.equipmentId) {
		const [eq] = await sql`select * from equipment where id = ${data.equipmentId}`;
		if (eq) await sql`update equipment set activity_ids = ${JSON.stringify([...asIds(eq.activity_ids), id])}::jsonb where id = ${data.equipmentId}`;
	}
	return { id };
});
//#endregion
export { addActivity_createServerFn_handler, addEquipment_createServerFn_handler, addStreet_createServerFn_handler, addWork_createServerFn_handler, closeApontamento_createServerFn_handler, deleteApontamento_createServerFn_handler, getPresence_createServerFn_handler, getSnapshot_createServerFn_handler, pingPresence_createServerFn_handler, reverseGeocode_createServerFn_handler, toggleStreet_createServerFn_handler, updateEquipment_createServerFn_handler, upsertApontamento_createServerFn_handler };
