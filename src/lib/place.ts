import { useEffect, useState } from "react";
import { reverseGeocode } from "./api";

type Place = { label: string; road: string; city: string };

const cache = new Map<string, Place>();
const inflight = new Map<string, Promise<Place>>();

export function placeKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

export function lookupPlace(lat: number, lng: number): Promise<Place> {
  const key = placeKey(lat, lng);
  const hit = cache.get(key);
  if (hit) return Promise.resolve(hit);
  let pending = inflight.get(key);
  if (!pending) {
    pending = reverseGeocode({ data: { lat, lng } })
      .then((r) => {
        cache.set(key, r);
        inflight.delete(key);
        return r;
      })
      .catch(() => {
        inflight.delete(key);
        return { label: "", road: "", city: "" };
      });
    inflight.set(key, pending);
  }
  return pending;
}

export function usePlaceLabel(lat: number | null, lng: number | null): Place {
  const [place, setPlace] = useState<Place>({ label: "", road: "", city: "" });

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;
    void lookupPlace(lat, lng).then((r) => {
      if (!cancelled) setPlace(r);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return place;
}
