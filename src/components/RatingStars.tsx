type Props = { value: number; count?: number };

export default function RatingStars({ value, count }: Props) {
  const rounded = Math.round(value * 2) / 2;
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className="inline-flex items-center gap-1 text-amber-500">
      {stars.map((n) => (
        <span key={n}>
          {rounded >= n ? "★" : rounded + 0.5 === n ? "☆" : "☆"}
        </span>
      ))}
      <span className="text-xs text-zinc-500 ml-1">
        {value.toFixed(1)} {count ? `(${count})` : null}
      </span>
    </div>
  );
}
