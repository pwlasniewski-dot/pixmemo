type Props = {
  name: string;
  price: number;
  description?: string;
  onSelect?: () => void;
  selected?: boolean;
};

export default function PackageCard({ name, price, description, onSelect, selected }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-xl border p-4 hover:bg-zinc-50 transition ${
        selected ? "ring-2 ring-blue-600 border-blue-600" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="font-semibold">{name}</div>
        <div className="text-sm font-semibold">{price} PLN</div>
      </div>
      {description && <p className="text-sm text-zinc-600 mt-1">{description}</p>}
    </button>
  );
}
