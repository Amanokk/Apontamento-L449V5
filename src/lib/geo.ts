import { useCallback, useEffect, useState } from "react";
import type { GpsQuality, GpsReady, GpsState, Street } from "./types";

export const DEFAULT_CENTER = { lat: -22.8711, lng: -43.7752 };

export function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function projectMercator(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

export function gpsQuality(accuracy: number): GpsQuality {
  if (accuracy <= 10) return "excellent";
  if (accuracy <= 25) return "good";
  if (accuracy <= 50) return "fair";
  return "poor";
}

export function gpsQualityLabel(quality: GpsQuality): string {
  switch (quality) {
    case "excellent":
      return "Precisão alta";
    case "good":
      return "Precisão boa";
    case "fair":
      return "Precisão razoável";
    case "poor":
      return "Precisão fraca — aguarde o GPS";
  }
}

export function matchStreetByLabel(label: string, streets: Street[], workId: string): Street | undefined {
  const hay = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const list = streets.filter((s) => s.active && (!workId || s.workId === workId));
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^(rua|av\.?|avenida|travessa|tv\.?)\s+/i, "");
  return (
    list.find((s) => hay.includes(norm(s.name))) ??
    list.find((s) => {
      const n = norm(s.name);
      return n.split(/\s+/).some((w) => w.length > 4 && hay.includes(w));
    })
  );
}

type Listener = (s: GpsState) => void;

const listeners = new Set<Listener>();
let watchId: number | null = null;
let stopTimer: number | null = null;
let current: GpsState = { status: "idle" };

const GPS_OPTS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 25000,
};

function emit(next: GpsState) {
  current = next;
  for (const l of listeners) l(next);
}

function normalizeAccuracy(raw: number): number {
  if (!Number.isFinite(raw) || raw <= 0) return 45;
  return raw;
}

function headingOf(coords: GeolocationCoordinates): number | null {
  const h = coords.heading;
  return typeof h === "number" && Number.isFinite(h) ? h : null;
}

function acceptReading(prev: GpsReady | null, lat: number, lng: number, accuracy: number): GpsReady | null {
  const now = Date.now();
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  if (!prev) {
    if (accuracy > 5000) return null;
    return {
      status: "ready",
      lat,
      lng,
      accuracy,
      quality: gpsQuality(accuracy),
      heading: null,
      updatedAt: now,
    };
  }

  const moved = haversineMeters(prev, { lat, lng });
  const age = now - prev.updatedAt;
  const better = accuracy < prev.accuracy * 0.75;
  const similar = accuracy <= prev.accuracy * 1.35;
  const muchWorse = accuracy > prev.accuracy * 1.8 && accuracy > 35;

  if (muchWorse && prev.accuracy <= 40 && age < 20_000) return null;
  if (accuracy > 100 && prev.accuracy <= 35 && age < 25_000) return null;
  if (moved < 3.5 && !better && age < 8_000) return null;
  if (!better && !similar && moved < 25 && age < 12_000) return null;
  if (moved < 3.5 && better) {
    return {
      ...prev,
      accuracy,
      quality: gpsQuality(accuracy),
      updatedAt: now,
    };
  }

  let nextLat = lat;
  let nextLng = lng;
  if (moved < 25 && similar) {
    const alpha = Math.min(0.7, Math.max(0.25, prev.accuracy / (prev.accuracy + accuracy)));
    nextLat = prev.lat * (1 - alpha) + lat * alpha;
    nextLng = prev.lng * (1 - alpha) + lng * alpha;
  }

  return {
    status: "ready",
    lat: nextLat,
    lng: nextLng,
    accuracy: better ? accuracy : Math.min(prev.accuracy * 1.05, accuracy),
    quality: gpsQuality(better ? accuracy : Math.min(prev.accuracy, accuracy)),
    heading: null,
    updatedAt: now,
  };
}

function onPosition(pos: GeolocationPosition) {
  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;
  const accuracy = normalizeAccuracy(pos.coords.accuracy);
  const prev = current.status === "ready" ? current : null;
  const next = acceptReading(prev, lat, lng, accuracy);
  if (!next) return;
  next.heading = headingOf(pos.coords);
  if (
    prev &&
    Math.abs(prev.lat - next.lat) < 1e-7 &&
    Math.abs(prev.lng - next.lng) < 1e-7 &&
    Math.abs(prev.accuracy - next.accuracy) < 1.5
  ) {
    return;
  }
  emit(next);
}

function onError(err: GeolocationPositionError) {
  const denied = err.code === err.PERMISSION_DENIED;
  if (current.status === "ready" && !denied) return;
  emit({
    status: denied ? "denied" : "error",
    message: denied
      ? "Permita o acesso à localização nas configurações do aparelho."
      : err.message || "Não foi possível ler o GPS. Tente de novo ao ar livre.",
  });
}

function startWatch() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    emit({ status: "unsupported", message: "Este aparelho não tem GPS." });
    return;
  }
  if (watchId != null) return;
  if (current.status !== "ready") emit({ status: "requesting" });
  navigator.geolocation.getCurrentPosition(onPosition, onError, GPS_OPTS);
  watchId = navigator.geolocation.watchPosition(onPosition, onError, GPS_OPTS);
}

function stopWatch() {
  if (watchId == null || typeof navigator === "undefined") return;
  navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

export function useGps(): GpsState & { retry: () => void } {
  const [state, setState] = useState<GpsState>(current);

  const retry = useCallback(() => {
    stopWatch();
    emit({ status: "requesting" });
    startWatch();
  }, []);

  useEffect(() => {
    listeners.add(setState);
    if (stopTimer != null) {
      window.clearTimeout(stopTimer);
      stopTimer = null;
    }
    startWatch();
    return () => {
      listeners.delete(setState);
      if (listeners.size === 0) {
        stopTimer = window.setTimeout(() => {
          if (listeners.size === 0) stopWatch();
        }, 30_000);
      }
    };
  }, []);

  return { ...state, retry };
}

const DEVICE_KEY = "apontador-device-id";
const LABEL_KEY = "apontador-crew-label";
const LAST_KEY = "apontador-last";

export function getDeviceId(): string {
  if (typeof localStorage === "undefined") return "preview";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getCrewLabel(): string {
  if (typeof localStorage === "undefined") return "";
  return localStorage.getItem(LABEL_KEY) ?? "";
}

export function setCrewLabel(label: string) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LABEL_KEY, label.trim().slice(0, 24));
}

export function loadLast(): {
  workId: string;
  streetId: string;
  equipmentId: string;
  activityId: string;
} {
  const fallback = {
    workId: "l449",
    streetId: "visconde",
    equipmentId: "lok-453",
    activityId: "exec-caixa-ralo",
  };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (raw) return JSON.parse(raw) as ReturnType<typeof loadLast>;
  } catch {
    /* ignore */
  }
  return fallback;
}

export function saveLast(last: {
  workId: string;
  streetId: string;
  equipmentId: string;
  activityId: string;
}) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LAST_KEY, JSON.stringify(last));
}
