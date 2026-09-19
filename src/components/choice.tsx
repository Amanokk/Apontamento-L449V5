import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { id: string; label: string; hint?: string };

export function ChoiceList({
  options,
  value,
  onChange,
  columns = 1,
}: {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "flex min-h-12 items-center gap-2 rounded-md border px-3 py-2.5 text-left transition-[background-color,border-color,color,transform] duration-150 ease-out",
              on
                ? "border-primary bg-primary text-primary-fg"
                : "border-border bg-surface text-fg hover:bg-surface-2",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-snug">{o.label}</span>
              {o.hint ? (
                <span className={cn("block text-xs", on ? "text-primary-fg/80" : "text-muted")}>
                  {o.hint}
                </span>
              ) : null}
            </span>
            {on ? <Check className="size-4 shrink-0" strokeWidth={2.4} /> : null}
          </button>
        );
      })}
    </div>
  );
}

export function ToggleList({
  options,
  selected,
  onToggle,
}: {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const set = new Set(selected);
  return (
    <div className="grid grid-cols-1 gap-1.5">
      {options.map((o) => {
        const on = set.has(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={cn(
              "flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm",
              on ? "border-primary bg-primary/10 text-fg" : "border-transparent bg-surface text-muted",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-sm border",
                on ? "border-primary bg-primary text-primary-fg" : "border-border",
              )}
            >
              {on ? <Check className="size-3" strokeWidth={3} /> : null}
            </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "h-9 rounded-full border px-3 text-sm font-medium transition-colors duration-150",
              on ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg",
            )}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
