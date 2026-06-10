"use client";
import { customerService } from "@/api/services/customerService";

export const ALL_VERTICALS_OPTION = { id: "all", label: "All verticals" };

export const normalizeVerticalOption = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "number") {
    const id = String(value);
    return { id, label: id.charAt(0).toUpperCase() + id.slice(1).toLowerCase() };
  }
  if (typeof value === "object") {
    const id = value.id ?? value.value ?? value.code ?? value.name;
    if (id === undefined || id === null) return null;
    const labelSource = value.name ?? value.label ?? id;
    return {
      id: String(id),
      label: typeof labelSource === "string" ? labelSource : String(labelSource),
    };
  }
  return null;
};

export const transformVerticals = (raw = []) => {
  const options = (Array.isArray(raw) ? raw : [])
    .map(normalizeVerticalOption)
    .filter(Boolean);
  const map = {};
  options.forEach((opt) => {
    map[opt.id] = opt.label;
  });
  return { options, map };
};

export const fetchVerticalOptions = async () => {
  try {
    const res = await customerService.getVerticals();
    if (res?.success && res?.code === 200) {
      const src = res.data?.verticals || res.data?.data?.verticals || [];
      return transformVerticals(src);
    }
  } catch (_) {}
  return { options: [], map: {} };
};

export const groupByVertical = (clients) => {
  const grouped = {};
  clients.forEach((client) => {
    const key = client.verticalId ?? client.vertical ?? "unassigned";
    if (!grouped[key]) {
      grouped[key] = {
        verticalId: client.verticalId ?? null,
        verticalName: client.vertical ?? "Unassigned",
        clients: [],
      };
    }
    grouped[key].clients.push(client);
  });
  return Object.values(grouped);
};

