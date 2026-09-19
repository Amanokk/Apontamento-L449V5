import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ToggleList } from "@/components/choice";
import { ScreenLoader } from "@/components/screen-loader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  addActivity,
  addEquipment,
  addStreet,
  addWork,
  getSnapshot,
  toggleStreet,
  updateEquipment,
} from "@/lib/api";
import { KIND_LABEL } from "@/lib/catalog";
import { useInvalidateSnapshot, useSnapshot } from "@/lib/use-snapshot";
import type { EquipmentKind } from "@/lib/types";

const TABS = ["Máquinas", "Ruas", "Atividades"] as const;

export const Route = createFileRoute("/cadastros")({
  loader: () => getSnapshot(),
  staleTime: 60_000,
  component: Cadastros,
});

function Cadastros() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Máquinas");
  const initial = Route.useLoaderData();
  const { data, isLoading } = useSnapshot(initial);

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
        <h1 className="font-display text-2xl font-semibold">Cadastros</h1>
        <p className="text-sm text-muted">O que você cadastrar aparece para todo mundo.</p>
      </header>
      <div className="mx-4 mb-4 grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "h-10 rounded-md bg-surface text-sm font-semibold text-fg"
                : "h-10 rounded-md text-sm font-medium text-muted"
            }
          >
            {t}
          </button>
        ))}
      </div>
      <main className="px-4 pb-6">
        {tab === "Máquinas" ? <MaquinasTab /> : null}
        {tab === "Ruas" ? <RuasTab /> : null}
        {tab === "Atividades" ? <AtividadesTab /> : null}
      </main>
    </AppShell>
  );
}

function MaquinasTab() {
  const { data } = useSnapshot();
  const invalidate = useInvalidateSnapshot();
  const equipment = data?.equipment ?? [];
  const activities = data?.activities ?? [];
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<EquipmentKind>("retro");
  const [editId, setEditId] = useState<string | null>(null);
  const editing = equipment.find((e) => e.id === editId);

  const actOpts = useMemo(() => activities.map((a) => ({ id: a.id, label: a.name })), [activities]);

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">
          {editing ? "Editar equipamento" : "Novo equipamento"}
        </h2>
        <Label>Nome</Label>
        <Input className="mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Retroescavadeira 02" />
        <Label>Código</Label>
        <Input className="mb-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder="LOK 453" />
        <Label>Tipo</Label>
        <select
          className="mb-3 h-12 w-full rounded-md border border-border bg-surface px-3"
          value={kind}
          onChange={(e) => setKind(e.target.value as EquipmentKind)}
        >
          {(Object.keys(KIND_LABEL) as EquipmentKind[]).map((k) => (
            <option key={k} value={k}>
              {KIND_LABEL[k]}
            </option>
          ))}
        </select>
        <Button
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            void (async () => {
              if (editing) {
                await updateEquipment({
                  data: { id: editing.id, name: name.trim(), code: code.trim() || name.trim(), kind },
                });
                toast.success("Equipamento atualizado");
                setEditId(null);
              } else {
                const template = equipment.find((e) => e.kind === kind);
                await addEquipment({
                  data: {
                    name: name.trim(),
                    code: code.trim() || name.trim(),
                    kind,
                    activityIds: template?.activityIds ?? [],
                  },
                });
                toast.success("Equipamento cadastrado");
              }
              setName("");
              setCode("");
              await invalidate();
            })();
          }}
        >
          {editing ? "Salvar" : "Cadastrar"}
        </Button>
      </section>
      <ul className="flex flex-col gap-2">
        {equipment.map((e) => (
          <li key={e.id} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-sm font-semibold">{e.name}</p>
            <p className="text-xs text-muted">
              {e.code} · {KIND_LABEL[e.kind]} · {e.activityIds.length} atividades
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(e.id);
                  setName(e.name);
                  setCode(e.code);
                  setKind(e.kind);
                }}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  void updateEquipment({ data: { id: e.id, active: !e.active } }).then(() => invalidate());
                }}
              >
                {e.active ? "Ocultar" : "Ativar"}
              </Button>
            </div>
            {editId === e.id ? (
              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg bg-surface-2 p-2">
                <p className="mb-2 text-xs text-muted">Atividades desta máquina</p>
                <ToggleList
                  options={actOpts}
                  selected={e.activityIds}
                  onToggle={(id) => {
                    const has = e.activityIds.includes(id);
                    const activityIds = has ? e.activityIds.filter((x) => x !== id) : [...e.activityIds, id];
                    void updateEquipment({ data: { id: e.id, activityIds } }).then(() => invalidate());
                  }}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RuasTab() {
  const { data } = useSnapshot();
  const invalidate = useInvalidateSnapshot();
  const streets = data?.streets ?? [];
  const works = data?.works ?? [];
  const [name, setName] = useState("");
  const [workId, setWorkId] = useState(works[0]?.id ?? "");
  const [obraCode, setObraCode] = useState("");
  const [obraName, setObraName] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Nova rua</h2>
        <Label>Nome da rua</Label>
        <Input className="mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rua das Flores" />
        <Label>Obra</Label>
        <select
          className="mb-3 h-12 w-full rounded-md border border-border bg-surface px-3"
          value={workId}
          onChange={(e) => setWorkId(e.target.value)}
        >
          {works.map((w) => (
            <option key={w.id} value={w.id}>
              {w.code} {w.name}
            </option>
          ))}
        </select>
        <Button
          className="w-full"
          disabled={!name.trim() || !workId}
          onClick={() => {
            void addStreet({ data: { name: name.trim(), workId } }).then(() => {
              setName("");
              toast.success("Rua cadastrada");
              void invalidate();
            });
          }}
        >
          Cadastrar rua
        </Button>
      </section>
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Nova obra</h2>
        <div className="grid grid-cols-2 gap-2">
          <Input value={obraCode} onChange={(e) => setObraCode(e.target.value)} placeholder="L449" />
          <Input value={obraName} onChange={(e) => setObraName(e.target.value)} placeholder="São Joaquim" />
        </div>
        <Button
          className="mt-3 w-full"
          variant="outline"
          disabled={!obraCode.trim() || !obraName.trim()}
          onClick={() => {
            void addWork({ data: { code: obraCode.trim().toUpperCase(), name: obraName.trim() } }).then((r) => {
              setWorkId(r.id);
              setObraCode("");
              setObraName("");
              toast.success("Obra cadastrada");
              void invalidate();
            });
          }}
        >
          Cadastrar obra
        </Button>
      </section>
      <ul className="flex flex-col gap-2">
        {streets.map((s) => {
          const w = works.find((x) => x.id === s.workId);
          return (
            <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
              <div>
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted">
                  {w ? `${w.code} ${w.name}` : ""} {s.active ? "" : "· oculta"}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void toggleStreet({ data: { id: s.id } }).then(() => invalidate())}
              >
                {s.active ? "Ocultar" : "Ativar"}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AtividadesTab() {
  const { data } = useSnapshot();
  const invalidate = useInvalidateSnapshot();
  const activities = data?.activities ?? [];
  const equipment = data?.equipment ?? [];
  const [name, setName] = useState("");
  const [eqId, setEqId] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Nova atividade</h2>
        <Input className="mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Abertura de vala" />
        <select
          className="mb-3 h-12 w-full rounded-md border border-border bg-surface px-3"
          value={eqId}
          onChange={(e) => setEqId(e.target.value)}
        >
          <option value="">Vincular a uma máquina (opcional)</option>
          {equipment
            .filter((e) => e.active)
            .map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
        </select>
        <Button
          className="w-full"
          disabled={!name.trim()}
          onClick={() => {
            void addActivity({ data: { name: name.trim(), equipmentId: eqId || undefined } }).then(() => {
              setName("");
              toast.success("Atividade incluída");
              void invalidate();
            });
          }}
        >
          Cadastrar
        </Button>
      </section>
      <p className="text-xs text-muted">
        As opções de cada máquina vêm dos diários reais (LOK 453, LYC 154, pipa LYC 025, van LYC 303, rolo LOC 073…).
      </p>
      <ul className="flex flex-col gap-1.5">
        {activities.map((a) => (
          <li key={a.id} className="rounded-lg border border-border bg-surface px-3 py-2 text-sm">
            {a.name}
            {a.code ? <span className="ml-2 text-xs text-muted">{a.code}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
