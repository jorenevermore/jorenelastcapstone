export interface Message {
  id: string;
  message: string;
  barberId: string;
  clientId: string;
  from: 'barbershop' | 'client';
  timestamp: string;
}

