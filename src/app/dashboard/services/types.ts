export interface Service {
  id: string;
  title: string;
  featuredImage: string | null;
  status: 'Available' | 'Disabled';
  serviceCategoryId: string; // References global service ID
}

export interface GlobalService {
  id: string;
  title: string;
  featuredImage: string;
}

export interface Style {
  styleId: string;
  styleName: string;
  description: string;
  price: number;
  duration: number; // in hours
  featuredImage: string | null;
  serviceId: string;
  serviceCategoryId: string; // Global service ID
  barberOrBarbershop: string; // Barbershop ID
  type: 'barbershop';
  docId?: string;
}

export interface StylesMap {
  [serviceId: string]: Style[];
}
