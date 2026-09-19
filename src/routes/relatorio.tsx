import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, Printer, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ScreenLoader } from "@/components/screen-loader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { apontamentosToCsv, buildDiarioText, downloadText, printReport } from "@/lib/export";
import { useSnapshot } from "@/lib/use-snapshot";
import { getSnapshot } from "@/lib/api";
import { formatDateBR, formatDuration, minutesBetween, todayISO } from "@/lib/utils";

export const Route = createFileRoute("/relatorio")({
  loader: () => getSnapshot(),
  staleTime: 60_000,
  component: Relatorio,
});

function Relatorio() {
  const initial = Route.useLoaderData();
  const { data, isLoading } = useSnapshot(initial);
  const [from, setFrom] = useState(todayISO());
  const [to, setTo] = useState(todayISO());
  const apontamentos = data?.apontamentos ?? [];

  const rows = useMemo(
    () =>
      [...apontamentos]
        .filter((a) => a.date >= from && a.date <= to)
        .sort((a, b) => (a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date))),
    [apontamentos, from, to],
  );

  const byEq = useMemo(() => {
    const map = new Map<string, { name: string; n: number; mins: number }>();
    for (const a of rows) {
      const cur = map.get(a.equipmentId) ?? { name: a.equipmentName, n: 0, mins: 0 };
      cur.n += 1;
      if (a.end) cur.mins += minutesBetween(a.start, a.end);
      map.set(a.equipmentId, cur);
    }
    return [...map.values()].sort((a, b) => b.mins - a.mins);
  }, [rows]);

  const text = useMemo(() => {
    if (from === to) return buildDiarioText(from, rows);
    const days = [...new Set(rows.map((r) => r.date))];
    return days.map((d) => buildDiarioText(d, rows.filter((r) => r.date === d))).join("\n\n");
  }, [from, to, rows]);

  async function copy() {
    await navigator.clipboard.writeText(text);
    toast.success("Diário copiado");
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Diário de apontamento", text });
      return;
    }
    await copy();
  }

  function exportCsv() {
    downloadText(`apontamento_${from}_${to}.csv`, apontamentosToCsv(rows), "text/csv;charset=utf-8");
    toast.success("Planilha baixada (abre no Excel)");
  }

  function exportPdf() {
    const table = `
      <h1>Relatório de apontamento</h1>
      <p class="meta">${formatDateBR(from)} a ${formatDateBR(to)} · ${rows.length} registros</p>
      <table>
        <thead><tr>
          <th>Horário</th><th>Máquina</th><th>Atividade</th><th>Rua</th><th>Estaca</th><th>PV</th>
        </tr></thead>
        <tbody>
          ${rows
            .map(
              (a) => `<tr>
            <td>${formatDateBR(a.date)}<br/>${a.start}${a.end ? `–${a.end}` : ""}</td>
            <td>${esc(a.equipmentName)}</td>
            <td>${esc(a.activityName)}${a.notes ? `<div class="desc">${esc(a.notes)}</div>` : ""}</td>
            <td>${esc(a.streetName)}</td>
            <td>${esc(a.estaca)}</td>
            <td>${esc(a.pv)}</td>
          </tr>`,
            )
            .join("")}
        </tbody>
      </table>`;
    printReport("Relatório de apontamento", table);
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
        <h1 className="font-display text-2xl font-semibold">Relatório</h1>
        <p className="text-sm text-muted">Resumo, Excel e PDF do período — de toda a equipe.</p>
      </header>
      <main className="flex flex-col gap-4 px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>De</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>Até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <p className="text-sm text-muted">{rows.length} apontamentos no período</p>
          <ul className="mt-3 flex flex-col gap-2">
            {byEq.map((e) => (
              <li key={e.name} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">{e.name}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {e.n} · {formatDuration(e.mins)}
                </span>
              </li>
            ))}
            {byEq.length === 0 ? <li className="text-sm text-muted">Sem dados neste intervalo.</li> : null}
          </ul>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="size-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Printer className="size-4" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => void copy()}>
            <Copy className="size-4" />
            Copiar
          </Button>
          <Button variant="outline" onClick={() => void share()}>
            <Share2 className="size-4" />
            Enviar
          </Button>
        </div>

        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-surface p-4 font-sans text-sm leading-relaxed text-fg">
          {text || "Nada para exportar."}
        </pre>
      </main>
    </AppShell>
  );
}

function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => {
    if (c === "&") return "\u0026amp;";
    if (c === "<") return "\u0026lt;";
    if (c === ">") return "\u0026gt;";
    return c;
  });
}
