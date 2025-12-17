
export interface Barber {
  address: string;
  affiliatedBarbershop: string;
  affiliatedBarbershopId: string;
  barberId: string;
  contactNumber: string;
  email: string;
  fullName: string;
  isAvailable: boolean;
  image?: string | null;
  affiliationStatus?: 'pending' | 'confirmed' | 'declined';
  createdAt?: string;
  isProfileCompleted?: boolean;
}
