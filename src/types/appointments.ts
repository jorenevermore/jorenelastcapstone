
export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  serviceOrdered: string;
  serviceOrderedId: string;
  barberName: string;
  barberId?: string;
  barbershopId: string;
  barbershopName?: string;
  styleOrdered: string;
  styleOrderedId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'completedAndReviewed' | 'cancelled' | 'declined' | 'no-show';
  notificationStatus?: 'next-in-queue' | 'called-to-service';
  paymentStatus?: 'paid';
  reason?: string;
  barberReason?: string;
  totalPrice: number;
  discountAmount?: number;
  finalPrice?: number;
  paymentMethod?: string;
  isHomeService?: boolean;
  isEmergency?: boolean;
  isServiceOrderedPackage?: boolean;
  createdAt?: string;
  confirmedAt?: string;
  queuePosition?: number;
  location?: {
    lat: number;
    lng: number;
    streetName: string;
    distance: number;
  };
  feedback?: {
    rating: number;
    comment?: string;
    createdAt: string;
  };
  statusHistory?: {
    ongoingStatus: string;
    timestamp: string;
    reason?: string;
    updatedBy: 'client' | 'barber';
  }[];
  clientNotes?: {
    text: string;
    timestamp: string;
    from: 'client';
    clientId: string;
    clientName?: string;
  }[];
}

export interface Notification {
  id?: string;
  userId: string;
  bookingId: string;
  fromId: string;
  type: 'next in queue' | 'called to service';
  title: string;
  message: string;
  reason: string;
  isRead: boolean;
  createdAt: string;
}

