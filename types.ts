export enum ServiceType {
  GROOMING = 'GROOMING',
  WELLNESS = 'WELLNESS',
  SPORTS = 'SPORTS'
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  type: ServiceType;
  imageUrl: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string; // e.g., "Senior Stylist", "Tennis Court 1"
  serviceTypes: ServiceType[];
  imageUrl?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  resourceId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  status: 'confirmed' | 'cancelled';
  customerName: string;
  createdAt: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}