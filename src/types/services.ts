
export interface Service {
  id: string;
  title: string;
  description?: string;
  price?: number;
  duration?: number;
  featuredImage: string | null;
  serviceCategoryId: string;
  status?: string;
  barbershopId?: string;
  createdAt?: number;
  updatedAt?: number;
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
  duration: number; 
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

export interface CreateBarbershopServiceInput {
  barbershopId: string;
  serviceCategoryId: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  featuredImage?: string;
}

export interface UpdateBarbershopServiceInput {
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  featuredImage?: string;
}

export interface CreateGlobalServiceInput {
  title: string;
  featuredImage?: string;
}

export interface UpdateGlobalServiceInput {
  title?: string;
  featuredImage?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  featuredImage?: string;
  createdAt: number;
  updatedAt: number;
}

