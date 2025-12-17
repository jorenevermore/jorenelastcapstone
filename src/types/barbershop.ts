
export interface Location {
  lat: number;
  lng: number;
}

export interface BarbershopProfile {
  barbershopId: string;
  name: string;
  phone: string;
  email: string;
  location: Location;
  geohash: string;
  isOpen?: boolean;
  barbers?: string[];
  services?: string[];
  createdAt: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface CreateBarbershopInput {
  barbershopId: string;
  name: string;
  phone: string;
  email: string;
  location: Location;
}

export interface UpdateBarbershopInput {
  name?: string;
  phone?: string;
  location?: Location;
  isOpen?: boolean;
  status?: 'active';
}

