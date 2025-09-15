type Props = {
  value?: string;
  onChange: (v: string) => void;
  slots: string[]; // ["10:00","12:00","17:30"]
};

export default function AvailabilityCalendar({ value, onChange, slots }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {slots.map((s) => {
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={`px-3 py-2 rounded-lg border text-sm ${active ? "bg-blue-600 text-white border-blue-600" : "hover:bg-zinc-50"}`}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
