import { formatEstaca } from "./utils";

export function buildDescription(input: {
  equipmentName: string;
  activityName: string;
  streetName: string;
  estaca: string;
  pv: string;
}): string {
  const eq = input.equipmentName.trim();
  const act = input.activityName.trim().toLowerCase();
  const rua = input.streetName.trim();
  const estaca = formatEstaca(input.estaca);
  const pv = input.pv.trim();

  if (!eq || !act) return "";

  const doing = `${eq} realizando ${act}`;
  if (!rua && !estaca && !pv) return `${doing}.`;
  if (!rua) {
    const bits = [estaca && `na Estaca ${estaca.replace(/^E\s*/i, "")}`, pv && `no ${pv}`].filter(Boolean);
    return `${doing}${bits.length ? `, ${bits.join(" e ")}` : ""}.`;
  }
  if (estaca && pv) {
    return `${doing} na ${rua}, entre a Estaca ${estaca.replace(/^E\s*/i, "")} e o ${pv}.`;
  }
  if (estaca) return `${doing} na ${rua}, na Estaca ${estaca.replace(/^E\s*/i, "")}.`;
  if (pv) return `${doing} na ${rua}, no ${pv}.`;
  return `${doing} na ${rua}.`;
}
