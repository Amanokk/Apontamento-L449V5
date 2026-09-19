import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import {
  closeApontamento,
  deleteApontamento,
  getPresence,
  getSnapshot,
  pingPresence,
  upsertApontamento,
  type SavePayload,
} from "./api";
import { getCrewLabel, getDeviceId, haversineMeters } from "./geo";
import type { GpsState, LastUsed, Presence, Snapshot } from "./types";

export const SNAPSHOT_KEY = ["snapshot"] as const;
export const PRESENCE_KEY = ["presence"] as const;

export function useSnapshot(initial?: Snapshot) {
  return useQuery({
    queryKey: SNAPSHOT_KEY,
    queryFn: () => getSnapshot(),
    initialData: initial,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    placeholderData: (prev) => prev ?? initial,
  });
}

export function useLivePresence(enabled: boolean, initial?: Presence[]) {
  return useQuery({
    queryKey: PRESENCE_KEY,
    queryFn: () => getPresence(),
    enabled,
    initialData: initial,
    staleTime: 10_000,
    refetchInterval: enabled ? 15_000 : false,
    refetchOnWindowFocus: false,
  });
}

export function useSnapshotData(): Snapshot | undefined {
  return useSnapshot().data;
}

export function useInvalidateSnapshot() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: SNAPSHOT_KEY });
}

export function useUpsertApontamento() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (data: SavePayload) => upsertApontamento({ data }),
    onSuccess: () => void invalidate(),
  });
}

export function useCloseApontamento() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (data: { id: string; end: string }) => closeApontamento({ data }),
    onSuccess: () => void invalidate(),
  });
}

export function useDeleteApontamento() {
  const invalidate = useInvalidateSnapshot();
  return useMutation({
    mutationFn: (id: string) => deleteApontamento({ data: { id } }),
    onSuccess: () => void invalidate(),
  });
}

export function usePresencePing(gps: GpsState, last: LastUsed) {
  const lat = gps.status === "ready" ? gps.lat : null;
  const lng = gps.status === "ready" ? gps.lng : null;
  const acc = gps.status === "ready" ? gps.accuracy : null;
  const lastSent = useRef({ lat: 0, lng: 0, t: 0 });

  useEffect(() => {
    if (lat == null || lng == null) return;

    const send = (force: boolean) => {
      const moved = haversineMeters({ lat, lng }, lastSent.current);
      const age = Date.now() - lastSent.current.t;
      if (!force && moved < 12 && age < 20_000) return;
      lastSent.current = { lat, lng, t: Date.now() };
      void pingPresence({
        data: {
          deviceId: getDeviceId(),
          label: getCrewLabel() || "No campo",
          lat,
          lng,
          accuracy: acc,
          workId: last.workId || null,
          equipmentId: last.equipmentId || null,
          streetId: last.streetId || null,
        },
      });
    };

    send(false);
    const id = window.setInterval(() => send(true), 20_000);
    return () => window.clearInterval(id);
  }, [lat, lng, acc, last.workId, last.equipmentId, last.streetId]);
}
