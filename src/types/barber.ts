export interface Barber {
  address: string;
  affiliatedBarbershop: string;
  affiliatedBarbershopId: string;
  barberId: string;
  contactNumber: string;
  email: string;
  fullName: string;
  isAvailable: boolean;
  affiliationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  isProfileCompleted?: boolean;
}
