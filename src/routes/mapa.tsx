import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { GpsBanner } from "@/components/gps-banner";
import { collectMarkers, LiveMap } from "@/components/live-map";
import { ScreenLoader } from "@/components/screen-loader";
import { getCrewLabel, getDeviceId, haversineMeters, loadLast, setCrewLabel, useGps } from "@/lib/geo";
import { getSnapshot } from "@/lib/api";
import { useLivePresence, usePresencePing, useSnapshot } from "@/lib/use-snapshot";
import { formatAccuracy, relativeTime, todayISO } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/mapa")({
  loader: () => getSnapshot(),
  staleTime: 60_000,
  component: Mapa,
});

function Mapa() {
  const initial = Route.useLoaderData();
  const { data, isLoading } = useSnapshot(initial);
  const gps = useGps();
  const last = loadLast();
  const [label, setLabel] = useState(() => (typeof window === "undefined" ? "" : getCrewLabel()));
  const { data: livePresence } = useLivePresence(true, initial.presence);
  usePresencePing(gps, last);

  const today = todayISO();
  const rows = useMemo(
    () => (data?.apontamentos ?? []).filter((a) => a.date === today),
    [data?.apontamentos, today],
  );
  const presence = livePresence ?? data?.presence ?? [];
  const gpsLat = gps.status === "ready" ? gps.lat : null;
  const gpsLng = gps.status === "ready" ? gps.lng : null;
  const gpsAcc = gps.status === "ready" ? gps.accuracy : null;

  const markers = useMemo(
    () =>
      collectMarkers({
        gps,
        presence,
        apontamentos: rows,
        deviceId: typeof window === "undefined" ? "" : getDeviceId(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gpsLat, gpsLng, gpsAcc, presence, rows],
  );

  const deviceId = typeof window === "undefined" ? "" : getDeviceId();
  const others = presence.filter((p) => p.deviceId !== deviceId);

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
        <h1 className="font-display text-2xl font-semibold">Mapa da frente</h1>
        <p className="text-sm text-muted">Quem está no campo agora, e onde cada máquina apontou hoje.</p>
      </header>
      <main className="flex flex-col gap-4 px-4 pb-6">
        <GpsBanner gps={gps} />
        <LiveMap markers={markers} heightClass="h-72" />

        <section className="rounded-xl border border-border bg-surface p-3 shadow-card">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Seu nome no mapa</p>
          <div className="flex gap-2">
            <Input value={label} maxLength={24} onChange={(e) => setLabel(e.target.value)} placeholder="Frente 1" />
            <Button
              variant="outline"
              onClick={() => {
                setCrewLabel(label);
              }}
            >
              Salvar
            </Button>
          </div>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Equipe ao vivo</h2>
          {others.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
              Só você por enquanto. Quando outro aparelho abrir o app com GPS, aparece aqui.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {others.map((p) => {
                const dist = gps.status === "ready" ? haversineMeters({ lat: gps.lat, lng: gps.lng }, p) : null;
                const eq = data?.equipment.find((e) => e.id === p.equipmentId);
                return (
                  <li key={p.deviceId} className="rounded-xl border border-border bg-surface p-3">
                    <p className="text-sm font-semibold">{p.label || "No campo"}</p>
                    <p className="text-xs text-muted">
                      {eq?.name ?? "Em deslocamento"}
                      {dist != null ? ` · ${formatAccuracy(dist)}` : ""}
                      {" · "}
                      {relativeTime(p.updatedAt)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold">Pontos de hoje</h2>
          <ul className="flex flex-col gap-2">
            {rows
              .filter((a) => a.lat != null)
              .map((a) => (
                <li key={a.id}>
                  <Link to="/novo" search={{ edit: a.id }} className="block rounded-xl border border-border bg-surface p-3">
                    <p className="text-sm font-semibold">{a.equipmentName}</p>
                    <p className="text-xs text-muted">
                      {a.activityName} · {a.streetName}
                      {a.locationLabel ? ` · ${a.locationLabel}` : ""}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      </main>
    </AppShell>
  );
}
