export type Package = {
  id: string;
  name: string;
  price_pln: number;
  description?: string;
};

export type DayAvailability = {
  date: string;
  slots: string[];
};

export type Photographer = {
  id: string;
  full_name: string;
  city: string;
  rating_avg: number;
  rating_count: number;
  primary_photo_url: string;
  price_from_pln: number;
  verified?: boolean;
  short_bio?: string;
  bio?: string;
  languages?: string[];
  travel_km?: number;
  packages?: Package[];
  availability?: DayAvailability[];
};
