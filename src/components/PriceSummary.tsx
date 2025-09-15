type Props = {
  base: number;          // PLN
  travel: number;        // PLN
  discountPct: number;   // 0/5/10/15
};

export default function PriceSummary({ base, travel, discountPct }: Props) {
  const subtotal = base + travel;
  const discount = Math.round((subtotal * discountPct) / 100);
  const total = subtotal - discount;

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Cena pakietu</span><span>{base} PLN</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Dojazd</span><span>{travel} PLN</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Rabat</span><span>-{discount} PLN ({discountPct}%)</span>
      </div>
      <hr />
      <div className="flex justify-between font-semibold text-lg">
        <span>Suma</span><span>{total} PLN</span>
      </div>
    </div>
  );
}
