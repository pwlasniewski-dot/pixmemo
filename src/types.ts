export type Package = {
  id: string;
  name: string;
  price_pln: number;
  description?: string;
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
  packages?: Package[];
};
