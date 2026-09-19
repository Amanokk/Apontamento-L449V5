export type EquipmentKind = "retro" | "rolo" | "basculante" | "pipa" | "van" | "truck";

export type ActivityKind = "servico" | "status" | "deslocamento";

export type Equipment = {
  id: string;
  code: string;
  name: string;
  kind: EquipmentKind;
  plate?: string;
  activityIds: string[];
  active: boolean;
};

export type Activity = {
  id: string;
  name: string;
  kind: ActivityKind;
  code?: string;
};

export type Street = {
  id: string;
  name: string;
  workId: string;
  active: boolean;
};

export type Work = {
  id: string;
  code: string;
  name: string;
  active: boolean;
};

export type GeoPoint = {
  lat: number;
  lng: number;
  accuracy?: number;
  label?: string;
};

export type Apontamento = {
  id: string;
  date: string;
  start: string;
  end: string | null;
  workId: string;
  workName: string;
  streetId: string;
  streetName: string;
  equipmentId: string;
  equipmentName: string;
  equipmentKind: EquipmentKind;
  activityId: string;
  activityName: string;
  estaca: string;
  pv: string;
  quantity: number | null;
  notes: string;
  description: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  locationLabel: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
};

export type Presence = {
  deviceId: string;
  label: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  workId: string | null;
  equipmentId: string | null;
  streetId: string | null;
  updatedAt: string;
};

export type Draft = {
  id?: string;
  date: string;
  start: string;
  end: string;
  ended: boolean;
  workId: string;
  streetId: string;
  equipmentId: string;
  activityId: string;
  estaca: string;
  pv: string;
  quantity: string;
  notes: string;
};

export type Snapshot = {
  works: Work[];
  streets: Street[];
  equipment: Equipment[];
  activities: Activity[];
  apontamentos: Apontamento[];
  presence: Presence[];
};

export type LastUsed = {
  workId: string;
  streetId: string;
  equipmentId: string;
  activityId: string;
};

export type GpsQuality = "excellent" | "good" | "fair" | "poor";

export type GpsReady = {
  status: "ready";
  lat: number;
  lng: number;
  accuracy: number;
  quality: GpsQuality;
  heading: number | null;
  updatedAt: number;
};

export type GpsState =
  | { status: "idle" | "requesting" | "unsupported" | "denied" | "error"; message?: string }
  | GpsReady;
