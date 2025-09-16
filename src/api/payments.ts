const API = import.meta.env.VITE_API_URL || "http://localhost:5174";

type HttpOptions = RequestInit & { timeoutMs?: number };

async function request<T>(path: string, { timeoutMs = 8000, ...init }: HttpOptions = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
    if (!res.ok) {
      let message = `Błąd płatności (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {}
      throw new Error(message);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Przekroczono limit czasu połączenia z bramką płatniczą");
    }
    throw err as Error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createStripeSession(params: {
  bookingId: string;
  amountPln: number;
  successUrl: string;
  cancelUrl?: string;
}) {
  return request<{ session_id: string; redirect_url: string; amount_pln: number; cancel_url?: string | null }>(
    "/payments/stripe/session",
    {
      method: "POST",
      body: JSON.stringify({
        booking_id: params.bookingId,
        amount_pln: params.amountPln,
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
      }),
    }
  );
}

export function createP24Session(params: { bookingId: string; amountPln: number; successUrl: string }) {
  return request<{ redirect_url: string; token: string; amount_pln: number }>("/payments/p24/session", {
    method: "POST",
    body: JSON.stringify({
      booking_id: params.bookingId,
      amount_pln: params.amountPln,
      success_url: params.successUrl,
    }),
  });
}
