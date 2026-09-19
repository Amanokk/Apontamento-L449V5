import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSpreadsheet, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ScreenLoader } from "@/components/screen-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDeleteApontamento, useSnapshot } from "@/lib/use-snapshot";
import { getSnapshot } from "@/lib/api";
import { formatDateBR } from "@/lib/utils";

export const Route = createFileRoute("/historico")({
  loader: () => getSnapshot(),
  staleTime: 60_000,
  component: Historico,
});

function Historico() {
  const initial = Route.useLoaderData();
  const { data, isLoading } = useSnapshot(initial);
  const del = useDeleteApontamento();
  const [q, setQ] = useState("");
  const [eq, setEq] = useState("");
  const [st, setSt] = useState("");
  const [act, setAct] = useState("");
  const [date, setDate] = useState("");

  const apontamentos = data?.apontamentos ?? [];
  const equipment = data?.equipment ?? [];
  const streets = data?.streets ?? [];
  const activities = data?.activities ?? [];

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...apontamentos]
      .filter((a) => !date || a.date === date)
      .filter((a) => !eq || a.equipmentId === eq)
      .filter((a) => !st || a.streetId === st)
      .filter((a) => !act || a.activityId === act)
      .filter((a) => {
        if (!query) return true;
        const hay =
          `${a.equipmentName} ${a.activityName} ${a.streetName} ${a.estaca} ${a.pv} ${a.notes} ${a.description}`.toLowerCase();
        return hay.includes(query);
      })
      .sort((a, b) => (a.date === b.date ? b.start.localeCompare(a.start) : b.date.localeCompare(a.date)));
  }, [apontamentos, q, eq, st, act, date]);

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">Histórico</h1>
            <p className="text-sm text-muted">Tudo o que a equipe apontou, em qualquer aparelho.</p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/relatorio">
              <FileSpreadsheet className="size-4" />
              Relatório
            </Link>
          </Button>
        </div>
      </header>
      <main className="flex flex-col gap-3 px-4 pb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <Input className="pl-9" placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="grid grid-cols-1 gap-2">
          <select
            className="h-12 rounded-md border border-border bg-surface px-3 text-base"
            value={eq}
            onChange={(e) => setEq(e.target.value)}
          >
            <option value="">Todas as máquinas</option>
            {equipment
              .filter((e) => e.active)
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
          </select>
          <select
            className="h-12 rounded-md border border-border bg-surface px-3 text-base"
            value={st}
            onChange={(e) => setSt(e.target.value)}
          >
            <option value="">Todas as ruas</option>
            {streets
              .filter((s) => s.active)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
          </select>
          <select
            className="h-12 rounded-md border border-border bg-surface px-3 text-base"
            value={act}
            onChange={(e) => setAct(e.target.value)}
          >
            <option value="">Todas as atividades</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">Nada encontrado.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((a) => (
              <li key={a.id} className="rounded-xl border border-border bg-surface p-3 shadow-card">
                <p className="text-xs text-muted">
                  {formatDateBR(a.date)} · {a.start}
                  {a.end ? `–${a.end}` : "–…"}
                </p>
                <p className="text-sm font-semibold">{a.equipmentName}</p>
                <p className="text-sm text-muted">
                  {a.activityName} · {a.streetName}
                  {a.estaca ? ` · E ${a.estaca}` : ""}
                  {a.pv ? ` · ${a.pv}` : ""}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/novo" search={{ edit: a.id }}>
                      Editar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger"
                    onClick={() => {
                      if (confirm("Excluir este apontamento?")) {
                        del.mutate(a.id);
                        toast.success("Excluído");
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                    Excluir
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
