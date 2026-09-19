import { LocateFixed, LocateOff, LoaderCircle } from "lucide-react";
import { gpsQualityLabel } from "@/lib/geo";
import { usePlaceLabel } from "@/lib/place";
import { formatAccuracy } from "@/lib/utils";
import type { GpsState } from "@/lib/types";
import { Button } from "./ui/button";

export function GpsBanner({
  gps,
  onRetry,
}: {
  gps: GpsState & { retry: () => void };
  onRetry?: () => void;
}) {
  const lat = gps.status === "ready" ? gps.lat : null;
  const lng = gps.status === "ready" ? gps.lng : null;
  const place = usePlaceLabel(lat, lng);

  if (gps.status === "ready") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-ok-fg px-3 py-2 text-ok">
        <LocateFixed className="size-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{place.label || "Localização ativa"}</p>
          <p className="text-[11px] tabular-nums opacity-80">
            {gpsQualityLabel(gps.quality)} · ±{formatAccuracy(gps.accuracy)}
          </p>
        </div>
      </div>
    );
  }

  if (gps.status === "requesting" || gps.status === "idle") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-muted">
        <LoaderCircle className="size-4 shrink-0 animate-spin" />
        <p className="text-sm">Ativando GPS… fique ao ar livre para melhor precisão.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <LocateOff className="size-4 shrink-0 text-danger" />
      <p className="min-w-0 flex-1 text-sm text-muted">{gps.message ?? "GPS desligado. Toque para ativar."}</p>
      <Button size="sm" variant="outline" onClick={onRetry ?? gps.retry}>
        Ativar
      </Button>
    </div>
  );
}
