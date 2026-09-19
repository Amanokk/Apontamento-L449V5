import type { Apontamento } from "./types";
import { formatDateBR, formatDuration, minutesBetween, nowHHMM } from "./utils";

function csvCell(v: string | number | null | undefined): string {
  const s = v == null ? "" : String(v);
  if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function apontamentosToCsv(rows: Apontamento[]): string {
  const header = [
    "Data",
    "Início",
    "Término",
    "Duração",
    "Obra",
    "Rua",
    "Máquina",
    "Atividade",
    "Estaca",
    "PV",
    "Qtd",
    "Observações",
    "Descrição",
    "Latitude",
    "Longitude",
    "Local GPS",
  ];
  const body = rows.map((a) => {
    const dur = a.end ? formatDuration(minutesBetween(a.start, a.end)) : "em andamento";
    return [
      formatDateBR(a.date),
      a.start,
      a.end ?? "",
      dur,
      a.workName,
      a.streetName,
      a.equipmentName,
      a.activityName,
      a.estaca,
      a.pv,
      a.quantity ?? "",
      a.notes,
      a.description,
      a.lat ?? "",
      a.lng ?? "",
      a.locationLabel,
    ].map(csvCell);
  });
  return `\uFEFF${[header, ...body].map((r) => r.join(";")).join("\n")}`;
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function buildDiarioText(date: string, rows: Apontamento[]): string {
  const ordered = [...rows].sort((a, b) => a.start.localeCompare(b.start));
  const title = `${formatDateBR(date)}`;
  const work = ordered[0]?.workName ?? "";
  const lines = [`${title}${work ? ` — ${work}` : ""}`, ""];
  if (ordered.length === 0) {
    lines.push("Nenhum apontamento neste dia.");
    return lines.join("\n");
  }
  for (const a of ordered) {
    const time = a.end ? `${a.start}–${a.end}` : `${a.start}–…`;
    lines.push(`${time}  ${a.equipmentName}`);
    const bits = [a.activityName, a.streetName, a.estaca && `Estaca ${a.estaca}`, a.pv].filter(Boolean);
    lines.push(bits.join(" — "));
    if (a.locationLabel) lines.push(`GPS: ${a.locationLabel}`);
    if (a.notes) lines.push(`Obs: ${a.notes}`);
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

export function printReport(title: string, html: string) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"/>
<title>${title}</title>
<style>
  body { font-family: "Source Sans 3", "Segoe UI", sans-serif; color: #1c1814; padding: 24px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  p.meta { color: #6b6358; margin: 0 0 20px; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd4c6; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #efe8db; font-weight: 600; }
  .desc { color: #6b6358; font-size: 11px; }
  @page { margin: 16mm; }
</style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

export function nowStamp() {
  return nowHHMM();
}
