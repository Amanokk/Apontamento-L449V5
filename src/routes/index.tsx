import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clock, Plus, Repeat, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { GpsBanner } from "@/components/gps-banner";
import { collectMarkers, LiveMap } from "@/components/live-map";
import { ScreenLoader } from "@/components/screen-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emptyDraft } from "@/lib/draft";
import { getCrewLabel, getDeviceId, loadLast, saveLast, setCrewLabel, useGps } from "@/lib/geo";
import { getSnapshot } from "@/lib/api";
import { useCloseApontamento, useLivePresence, usePresencePing, useSnapshot, useUpsertApontamento } from "@/lib/use-snapshot";
import { formatDateBR, formatDuration, minutesBetween, nowHHMM, todayISO, uid } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: () => getSnapshot(),
  staleTime: 60_000,
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const initial = Route.useLoaderData();
  const { data, isLoading } = useSnapshot(initial);
  const gps = useGps();
  const closeMut = useCloseApontamento();
  const upsert = useUpsertApontamento();
  const { data: livePresence } = useLivePresence(true, initial.presence);
  const [tick, setTick] = useState(nowHHMM());
  const [estaca, setEstaca] = useState("");
  const [pv, setPv] = useState("");
  const [last, setLast] = useState(loadLast);
  const [label, setLabel] = useState("");
  const [labelOpen, setLabelOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(nowHHMM()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLabel(getCrewLabel());
    setLabelOpen(!getCrewLabel());
  }, []);

  usePresencePing(gps, last);

  const today = todayISO();
  const rows = useMemo(
    () =>
      (data?.apontamentos ?? [])
        .filter((a) => a.date === today)
        .sort((a, b) => a.start.localeCompare(b.start) || a.createdAt.localeCompare(b.createdAt)),
    [data?.apontamentos, today],
  );
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

  const markers = useMemo(
    () =>
      collectMarkers({
        gps,
        presence,
        apontamentos: rows,
        deviceId: typeof window === "undefined" ? "" : getDeviceId(),
      }),
    // gps object identity changes; depend on the stable reading instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gpsLat, gpsLng, gpsAcc, presence, rows],
  );

  function setWork(workId: string) {
    const next = { ...last, workId };
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
      void navigate({ to: "/novo" });
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
      deviceId: getDeviceId(),
    });
    setEstaca("");
    setPv("");
    toast.success("Salvo para toda a equipe");
  }

  if (isLoading && !data) {
    return (
      <AppShell>
        <ScreenLoader />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Apontador</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold leading-none text-fg">{formatDateBR(today)}</h1>
          <p className="text-sm tabular-nums text-muted">{tick}</p>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {(data?.works ?? [])
            .filter((w) => w.active)
            .map((w) => {
              const on = w.id === last.workId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWork(w.id)}
                  className={
                    on
                      ? "h-9 shrink-0 rounded-full bg-primary px-3 text-sm font-medium text-primary-fg"
                      : "h-9 shrink-0 rounded-full border border-border bg-surface px-3 text-sm text-fg"
                  }
                >
                  {w.code} {w.name}
                </button>
              );
            })}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pb-6">
        <GpsBanner gps={gps} />

        {labelOpen ? (
          <section className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <p className="text-sm font-semibold">Como a equipe te acha no mapa?</p>
            <p className="mb-2 text-xs text-muted">Apelido da frente, código da máquina ou “Equipe 1”.</p>
            <div className="flex gap-2">
              <Input
                value={label}
                maxLength={24}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex.: Frente 1"
              />
              <Button
                onClick={() => {
                  setCrewLabel(label);
                  setLabelOpen(false);
                }}
              >
                Ok
              </Button>
            </div>
          </section>
        ) : null}

        <Link to="/mapa" className="block">
          <LiveMap markers={markers} />
        </Link>

        <Link
          to="/novo"
          className="flex min-h-16 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-lg font-semibold text-primary-fg shadow-card"
        >
          <Plus className="size-5" />
          Novo apontamento
        </Link>

        {open.length > 0 ? (
          <section className="rounded-xl border border-border bg-surface p-3 shadow-card">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Em andamento</p>
            <div className="flex flex-col gap-2">
              {open.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg bg-surface-2 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.equipmentName}</p>
                    <p className="truncate text-xs text-muted">
                      {a.activityName} · desde {a.start}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      closeMut.mutate({ id: a.id, end: nowHHMM() });
                      toast.success("Encerrado");
                    }}
                  >
                    <Square className="size-3.5 fill-current" />
                    Encerrar
                  </Button>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {lastEq && lastAct && lastStreet ? (
          <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 text-muted">
              <Repeat className="size-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Repetir última</p>
            </div>
            <p className="text-sm font-semibold leading-snug">{lastEq.name}</p>
            <p className="text-sm text-muted">
              {lastAct.name} · {lastStreet.name}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Input placeholder="Estaca" value={estaca} onChange={(e) => setEstaca(e.target.value)} />
              <Input placeholder="PV" value={pv} onChange={(e) => setPv(e.target.value.toUpperCase())} />
            </div>
            <Button className="mt-3 w-full" onClick={() => void quickSave()}>
              Salvar agora
            </Button>
          </section>
        ) : null}

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">Do dia</h2>
            <p className="text-sm tabular-nums text-muted">
              {rows.length} · {formatDuration(hours)}
            </p>
          </div>
          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
              <Clock className="mx-auto mb-2 size-6 text-subtle" />
              <p className="text-sm text-muted">Nenhum apontamento ainda. Comece pela máquina que está na frente.</p>
            </div>
          ) : (
            <ol className="flex flex-col gap-2">
              {rows.map((a) => (
                <li key={a.id}>
                  <Link
                    to="/novo"
                    search={{ edit: a.id }}
                    className="block rounded-xl border border-border bg-surface p-3 shadow-card"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-sm tabular-nums text-muted">
                        {a.start}
                        {a.end ? `–${a.end}` : "–…"}
                      </p>
                      {!a.end ? (
                        <span className="rounded-full bg-ok-fg px-2 py-0.5 text-[11px] font-medium text-ok">
                          andamento
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{a.equipmentName}</p>
                    <p className="text-sm text-muted">
                      {a.activityName}
                      {a.streetName ? ` · ${a.streetName}` : ""}
                      {a.estaca ? ` · E ${a.estaca}` : ""}
                      {a.pv ? ` · ${a.pv}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        {work ? (
          <p className="text-center text-xs text-subtle">
            {work.code} · {work.name} · salvo para toda a equipe
          </p>
        ) : null}
      </main>
    </AppShell>
  );
}
