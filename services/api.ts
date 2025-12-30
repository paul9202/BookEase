import { Booking, Resource, Service, ServiceType, TimeSlot } from '../types';

// --- MOCK DATA ---

const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Luxury Pet Grooming',
    description: 'Full bath, brush, and trim for your furry friend. Includes nail clipping.',
    durationMinutes: 60,
    price: 85,
    type: ServiceType.GROOMING,
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 's2',
    name: 'Rejuvenating Facial',
    description: '60-minute deep tissue facial massage and skin treatment.',
    durationMinutes: 60,
    price: 120,
    type: ServiceType.WELLNESS,
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 's3',
    name: 'Tennis Court Rental',
    description: 'Reserve a professional-grade hard court for 1 hour.',
    durationMinutes: 60,
    price: 40,
    type: ServiceType.SPORTS,
    imageUrl: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 's4',
    name: 'Express Paws',
    description: 'Quick wash and dry for small dogs.',
    durationMinutes: 30,
    price: 45,
    type: ServiceType.GROOMING,
    imageUrl: 'https://picsum.photos/400/300?random=4'
  }
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Sarah Jenkins', role: 'Senior Stylist', serviceTypes: [ServiceType.GROOMING], imageUrl: 'https://picsum.photos/100/100?random=10' },
  { id: 'r2', name: 'Mike Ross', role: 'Groomer', serviceTypes: [ServiceType.GROOMING], imageUrl: 'https://picsum.photos/100/100?random=11' },
  { id: 'r3', name: 'Elena Fisher', role: 'Esthetician', serviceTypes: [ServiceType.WELLNESS], imageUrl: 'https://picsum.photos/100/100?random=12' },
  { id: 'r4', name: 'Court A', role: 'Hard Court', serviceTypes: [ServiceType.SPORTS], imageUrl: 'https://picsum.photos/100/100?random=13' },
  { id: 'r5', name: 'Court B', role: 'Clay Court', serviceTypes: [ServiceType.SPORTS], imageUrl: 'https://picsum.photos/100/100?random=14' },
];

let bookingsStore: Booking[] = [
  {
    id: 'b_init_1',
    serviceId: 's1',
    resourceId: 'r1',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00',
    status: 'confirmed',
    customerName: 'Demo User',
    createdAt: Date.now()
  }
];

// --- API HELPERS ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXPORTED SERVICE FUNCTIONS ---

export const fetchServices = async (): Promise<Service[]> => {
  await delay(600);
  return [...MOCK_SERVICES];
};

export const fetchServiceById = async (id: string): Promise<Service | undefined> => {
  await delay(300);
  return MOCK_SERVICES.find(s => s.id === id);
};

export const fetchResourcesForService = async (serviceType: ServiceType): Promise<Resource[]> => {
  await delay(500);
  return MOCK_RESOURCES.filter(r => r.serviceTypes.includes(serviceType));
};

export const fetchAvailableSlots = async (date: string, resourceId: string): Promise<TimeSlot[]> => {
  await delay(700);
  // Simple mock logic: Generate slots from 9am to 5pm
  // Randomly mark some as unavailable to simulate real world
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;

  // Check existing bookings to block real conflicts in our mock store
  const existingBookings = bookingsStore.filter(b => 
    b.date === date && 
    b.resourceId === resourceId && 
    b.status === 'confirmed'
  );
  const bookedTimes = new Set(existingBookings.map(b => b.timeSlot));

  for (let i = startHour; i < endHour; i++) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    
    // Random unavailability for variety (deterministic based on date/resource char codes)
    const randomSeed = date.charCodeAt(date.length - 1) + resourceId.charCodeAt(resourceId.length - 1) + i;
    const isRandomlyBooked = randomSeed % 5 === 0;

    slots.push({
      time,
      available: !bookedTimes.has(time) && !isRandomlyBooked
    });
  }
  return slots;
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
  await delay(1000);
  const newBooking: Booking = {
    ...booking,
    id: `b_${Date.now()}`,
    status: 'confirmed',
    createdAt: Date.now()
  };
  bookingsStore.push(newBooking);
  return newBooking;
};

export const fetchMyBookings = async (): Promise<(Booking & { service?: Service, resource?: Resource })[]> => {
  await delay(600);
  // Join data for display
  return bookingsStore
    .map(b => ({
      ...b,
      service: MOCK_SERVICES.find(s => s.id === b.serviceId),
      resource: MOCK_RESOURCES.find(r => r.id === b.resourceId)
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  await delay(500);
  const index = bookingsStore.findIndex(b => b.id === bookingId);
  if (index !== -1) {
    bookingsStore[index] = { ...bookingsStore[index], status: 'cancelled' };
  }
};