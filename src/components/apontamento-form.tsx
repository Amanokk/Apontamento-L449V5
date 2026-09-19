import { Check, ChevronDown, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { KIND_LABEL, NOTE_CHIPS, PV_PREFIXES, QUANTITY_LABEL } from "@/lib/catalog";
import { buildDescription } from "@/lib/description";
import type { Activity, Draft, Equipment, GpsState, Street, Work } from "@/lib/types";
import { cn, nowHHMM } from "@/lib/utils";
import { ChoiceList, ChipRow } from "./choice";
import { Button } from "./ui/button";
import { Input, Label, Textarea } from "./ui/input";

export function ApontamentoForm({
  draft,
  onChange,
  onSubmit,
  submitLabel = "Salvar",
  works,
  streets,
  equipment,
  activities,
  gps,
  locationLabel,
  saveState,
  onAddActivity,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSubmit: () => void;
  submitLabel?: string;
  works: Work[];
  streets: Street[];
  equipment: Equipment[];
  activities: Activity[];
  gps: GpsState;
  locationLabel: string;
  saveState: "idle" | "saving" | "saved" | "error";
  onAddActivity: (name: string, equipmentId: string) => Promise<string>;
}) {
  const [qEq, setQEq] = useState("");
  const [qSt, setQSt] = useState("");
  const [qAct, setQAct] = useState("");
  const [customAct, setCustomAct] = useState("");
  const [open, setOpen] = useState<"obra" | "rua" | "eq" | "act" | "detalhe">("eq");

  const eq = equipment.find((e) => e.id === draft.equipmentId);
  const act = activities.find((a) => a.id === draft.activityId);
  const street = streets.find((s) => s.id === draft.streetId);
  const work = works.find((w) => w.id === draft.workId);

  useEffect(() => {
    if (!draft.equipmentId) setOpen("eq");
    else if (!draft.activityId) setOpen("act");
    else if (!draft.streetId) setOpen("rua");
  }, [draft.equipmentId, draft.activityId, draft.streetId]);

  const streetOpts = useMemo(() => {
    const list = streets.filter((s) => s.active && (!draft.workId || s.workId === draft.workId));
    const q = qSt.trim().toLowerCase();
    return (q ? list.filter((s) => s.name.toLowerCase().includes(q)) : list).map((s) => ({
      id: s.id,
      label: s.name,
    }));
  }, [streets, draft.workId, qSt]);

  const eqOpts = useMemo(() => {
    const list = equipment.filter((e) => e.active);
    const q = qEq.trim().toLowerCase();
    return (q ? list.filter((e) => `${e.name} ${e.code}`.toLowerCase().includes(q)) : list).map((e) => ({
      id: e.id,
      label: e.name,
      hint: KIND_LABEL[e.kind],
    }));
  }, [equipment, qEq]);

  const actOpts = useMemo(() => {
    const ids = new Set(eq?.activityIds ?? []);
    const list = activities.filter((a) => ids.has(a.id));
    const servico = list.filter((a) => a.kind === "servico");
    const other = list.filter((a) => a.kind !== "servico");
    const ordered = [...servico, ...other];
    const q = qAct.trim().toLowerCase();
    const filtered = q ? ordered.filter((a) => a.name.toLowerCase().includes(q)) : ordered;
    return filtered.map((a) => ({
      id: a.id,
      label: a.name,
      hint: a.kind === "status" ? "Status" : undefined,
    }));
  }, [activities, eq, qAct]);

  const preview = buildDescription({
    equipmentName: eq?.name ?? "",
    activityName: act?.name ?? "",
    streetName: street?.name ?? "",
    estaca: draft.estaca,
    pv: draft.pv,
  });

  const qtyLabel = eq ? QUANTITY_LABEL[eq.kind] : undefined;
  const canSave = Boolean(draft.equipmentId && draft.activityId && draft.streetId && draft.start);

  function set(patch: Partial<Draft>) {
    onChange({ ...draft, ...patch });
  }

  return (
    <div className="flex flex-col gap-3 pb-28">
      {preview ? (
        <blockquote className="rounded-xl border border-border bg-surface p-4 text-[15px] leading-snug text-fg shadow-card">
          {preview}
        </blockquote>
      ) : null}

      <Step
        n={1}
        title="Obra"
        summary={work ? `${work.code} · ${work.name}` : undefined}
        open={open === "obra"}
        onToggle={() => setOpen(open === "obra" ? "eq" : "obra")}
      >
        <ChoiceList
          options={works.filter((w) => w.active).map((w) => ({ id: w.id, label: `${w.code} · ${w.name}` }))}
          value={draft.workId}
          onChange={(id) => {
            const first = streets.find((s) => s.active && s.workId === id);
            set({ workId: id, streetId: first?.id ?? draft.streetId });
            setOpen("eq");
          }}
        />
      </Step>

      <Step
        n={2}
        title="Máquina"
        summary={eq?.name}
        open={open === "eq"}
        onToggle={() => setOpen(open === "eq" ? "act" : "eq")}
      >
        <Input
          value={qEq}
          onChange={(e) => setQEq(e.target.value)}
          placeholder="Filtrar equipamento…"
          className="mb-2"
        />
        <ChoiceList
          options={eqOpts}
          value={draft.equipmentId}
          onChange={(id) => {
            const next = equipment.find((e) => e.id === id);
            const keep = next?.activityIds.includes(draft.activityId);
            set({ equipmentId: id, activityId: keep ? draft.activityId : (next?.activityIds[0] ?? "") });
            setOpen("act");
          }}
        />
      </Step>

      <Step
        n={3}
        title="O que está fazendo"
        summary={act?.name}
        open={open === "act"}
        onToggle={() => setOpen(open === "act" ? "rua" : "act")}
      >
        <Input
          value={qAct}
          onChange={(e) => setQAct(e.target.value)}
          placeholder="Filtrar atividade…"
          className="mb-2"
        />
        <ChoiceList
          options={actOpts}
          value={draft.activityId}
          onChange={(id) => {
            set({ activityId: id });
            setOpen("rua");
          }}
        />
        <div className="mt-3 flex gap-2">
          <Input
            value={customAct}
            onChange={(e) => setCustomAct(e.target.value)}
            placeholder="Outra atividade"
          />
          <Button
            type="button"
            variant="outline"
            disabled={!customAct.trim() || !eq}
            onClick={() => {
              if (!eq) return;
              void onAddActivity(customAct.trim(), eq.id).then((id) => {
                set({ activityId: id });
                setCustomAct("");
                setOpen("rua");
              });
            }}
          >
            Incluir
          </Button>
        </div>
      </Step>

      <Step
        n={4}
        title="Onde"
        summary={street?.name ?? (locationLabel || undefined)}
        open={open === "rua"}
        onToggle={() => setOpen(open === "rua" ? "detalhe" : "rua")}
      >
        {gps.status === "ready" ? (
          <p className="mb-2 text-xs text-ok">
            GPS ligado{locationLabel ? ` · ${locationLabel}` : ""}. Confira a rua ou troque abaixo.
          </p>
        ) : (
          <p className="mb-2 text-xs text-muted">Escolha a rua da frente. O GPS grava o ponto ao salvar.</p>
        )}
        <Input
          value={qSt}
          onChange={(e) => setQSt(e.target.value)}
          placeholder="Filtrar rua…"
          className="mb-2"
        />
        <ChoiceList
          options={streetOpts}
          value={draft.streetId}
          onChange={(id) => {
            set({ streetId: id });
            setOpen("detalhe");
          }}
        />
      </Step>

      <Step
        n={5}
        title="Detalhes"
        summary={[draft.estaca && `E ${draft.estaca}`, draft.pv, draft.start].filter(Boolean).join(" · ") || "Opcional"}
        open={open === "detalhe"}
        onToggle={() => setOpen(open === "detalhe" ? "eq" : "detalhe")}
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Estaca</Label>
            <Input
              value={draft.estaca}
              onChange={(e) => set({ estaca: e.target.value })}
              placeholder="15+20"
            />
            <div className="mt-2 flex gap-2">
              {["+20", "+50"].map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => bumpEstaca(draft.estaca, Number(s), set)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label>PV</Label>
            <Input
              value={draft.pv}
              onChange={(e) => set({ pv: e.target.value.toUpperCase() })}
              placeholder="PVD-08"
            />
            <div className="mt-2">
              <ChipRow
                options={[...PV_PREFIXES]}
                onChange={(p) => {
                  const num = draft.pv.replace(/^[A-Z]+-?/, "");
                  set({ pv: num ? `${p}-${num}` : `${p}-` });
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label>Horário</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1 text-xs text-muted">Início</p>
              <Input type="time" value={draft.start} onChange={(e) => set({ start: e.target.value })} />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-1 px-0"
                onClick={() => set({ start: nowHHMM() })}
              >
                Agora
              </Button>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted">Término</p>
              <Input
                type="time"
                value={draft.end}
                disabled={!draft.ended}
                onChange={(e) => set({ end: e.target.value })}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-1 px-0"
                onClick={() => set({ ended: !draft.ended, end: nowHHMM() })}
              >
                {draft.ended ? "Deixar em andamento" : "Já encerrou"}
              </Button>
            </div>
          </div>
          <Input type="date" className="mt-2" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
        </div>

        {qtyLabel ? (
          <div className="mt-4">
            <Label>{qtyLabel}</Label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => stepQty(draft.quantity, -1, set)}>
                −
              </Button>
              <Input
                inputMode="numeric"
                value={draft.quantity}
                onChange={(e) => set({ quantity: e.target.value.replace(/[^\d]/g, "") })}
                className="text-center tabular-nums"
              />
              <Button type="button" variant="secondary" onClick={() => stepQty(draft.quantity, 1, set)}>
                +
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <Label>Observação</Label>
          <ChipRow
            options={NOTE_CHIPS}
            onChange={(n) => set({ notes: draft.notes ? `${draft.notes} / ${n}` : n })}
          />
          <Textarea
            className="mt-2"
            value={draft.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Opcional"
          />
        </div>
      </Step>

      <p className="text-xs text-muted">
        {work ? `${work.code} ${work.name}` : "Sem obra"} · ao concluir, toda a equipe vê na hora
      </p>

      <div className="no-print fixed inset-x-0 bottom-0 z-20 mx-auto max-w-lg border-t border-border bg-surface/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mb-2 flex h-4 items-center justify-center text-[11px] text-muted">
          {saveState === "saving" ? (
            <span className="inline-flex items-center gap-1">
              <LoaderCircle className="size-3 animate-spin" /> Salvando para a equipe…
            </span>
          ) : saveState === "saved" ? (
            <span className="inline-flex items-center gap-1 text-ok">
              <Check className="size-3" /> Salvo · todos veem
            </span>
          ) : saveState === "error" ? (
            <span className="text-danger">Não salvou. Toque de novo.</span>
          ) : (
            <span>Preencha máquina, atividade e rua</span>
          )}
        </div>
        <Button className="w-full" size="lg" disabled={!canSave} onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  n: number;
  title: string;
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const done = Boolean(summary);
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-3 py-3 text-left"
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
            done ? "bg-ok text-ok-fg" : "bg-surface-2 text-muted",
          )}
        >
          {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{title}</span>
          {summary ? <span className="block truncate text-xs text-muted">{summary}</span> : null}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-subtle transition-transform duration-200 ease-out",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3">{children}</div>
        </div>
      </div>
    </section>
  );
}

function bumpEstaca(current: string, delta: number, set: (p: Partial<Draft>) => void) {
  const plus = current.match(/^(\d+)\+(\d+)$/);
  if (plus) {
    let km = Number(plus[1]);
    let m = Number(plus[2]) + delta;
    while (m >= 100) {
      km += 1;
      m -= 100;
    }
    while (m < 0) {
      km -= 1;
      m += 100;
    }
    if (km < 0) return;
    set({ estaca: `${km}+${String(m).padStart(2, "0")}` });
    return;
  }
  const n = current.replace(/\D/g, "");
  if (!n) {
    set({ estaca: String(Math.max(0, delta)) });
    return;
  }
  set({ estaca: String(Math.max(0, Number(n) + delta)) });
}

function stepQty(current: string, d: number, set: (p: Partial<Draft>) => void) {
  const n = Math.max(0, (Number(current) || 0) + d);
  set({ quantity: n ? String(n) : "" });
}
