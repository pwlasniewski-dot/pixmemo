import type { DayAvailability, Package } from "@/types";

const API = import.meta.env.VITE_API_URL || "http://localhost:5174";

export type PhotographerDashboardProfile = {
  id: string;
  full_name: string;
  city: string;
  bio?: string;
  primary_photo_url: string;
  verified?: boolean;
  packages: Package[];
  availability: DayAvailability[];
};

type RequestOptions = RequestInit & { token: string; timeoutMs?: number };

async function request<T>(path: string, { token, timeoutMs = 8000, ...init }: RequestOptions) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    });
    if (!res.ok) {
      let message = `Błąd (${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {}
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Przekroczono limit czasu połączenia");
    }
    throw err as Error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function fetchPhotographerProfile(token: string) {
  return request<PhotographerDashboardProfile>("/dashboard/photographer/me", { token });
}

export function updatePhotographerProfile(
  token: string,
  payload: Partial<Pick<PhotographerDashboardProfile, "full_name" | "city" | "bio" | "primary_photo_url">>
) {
  return request<PhotographerDashboardProfile>("/dashboard/photographer/me", {
    token,
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function savePhotographerPackage(
  token: string,
  pkg: { id?: string; name: string; price_pln: number; description?: string }
) {
  return request<Package[]>("/dashboard/photographer/packages", {
    token,
    method: "POST",
    body: JSON.stringify(pkg),
  });
}

export function deletePhotographerPackage(token: string, id: string) {
  return request<Package[]>(`/dashboard/photographer/packages/${encodeURIComponent(id)}`, {
    token,
    method: "DELETE",
  });
}

export function setPhotographerDaySlots(token: string, date: string, slots: string[]) {
  return request<DayAvailability[]>(`/dashboard/photographer/availability/${encodeURIComponent(date)}`, {
    token,
    method: "PUT",
    body: JSON.stringify({ slots }),
  });
}

export function deletePhotographerDay(token: string, date: string) {
  return request<DayAvailability[]>(`/dashboard/photographer/availability/${encodeURIComponent(date)}`, {
    token,
    method: "DELETE",
  });
}
