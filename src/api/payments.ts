export async function createStripeIntent(params: {
  booking_id: string;      // docelowo z BE
  amount_pln: number;
}): Promise<{ clientSecret: string }> {
  const base = import.meta.env.VITE_API_URL;
  const url = `${base}/payments/stripe/create-intent`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error("Stripe intent failed");
  return r.json();
}

export async function createP24Session(params: {
  booking_id: string;
  amount_pln: number;
}): Promise<{ redirectUrl: string }> {
  const base = import.meta.env.VITE_API_URL;
  const url = `${base}/payments/p24/create-session`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!r.ok) throw new Error("P24 session failed");
  return r.json();
}
