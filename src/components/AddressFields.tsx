type Props = {
  street: string;
  postal: string;
  city: string;
  onChange: (patch: Partial<{street:string;postal:string;city:string}>) => void;
};

export default function AddressFields({ street, postal, city, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <input
        className="px-3 py-2 rounded-lg border"
        placeholder="Ulica"
        value={street}
        onChange={(e) => onChange({ street: e.target.value })}
      />
      <input
        className="px-3 py-2 rounded-lg border"
        placeholder="Kod"
        value={postal}
        onChange={(e) => onChange({ postal: e.target.value })}
      />
      <input
        className="px-3 py-2 rounded-lg border"
        placeholder="Miasto"
        value={city}
        onChange={(e) => onChange({ city: e.target.value })}
      />
    </div>
  );
}
