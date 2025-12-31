import axios from 'axios';
import { Booking, Resource, Service, ServiceType, TimeSlot } from '../types';

// --- CONFIGURATION ---
const API_BASE_URL = 'http://paul-vmware-virtual-platform:8080/api';
const MOCK_USER_ID = 'USER-001';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000, // Quick timeout to fallback to mock data if server is down
});

// --- MOCK DATA FALLBACKS ---
const MOCK_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Luxury Pet Grooming',
    description: 'Full bath, brush, and trim for your furry friend. Includes nail clipping.',
    durationMinutes: 60,
    price: 85,
    type: ServiceType.GROOMING,
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's2',
    name: 'Rejuvenating Facial',
    description: '60-minute deep tissue facial massage and skin treatment.',
    durationMinutes: 60,
    price: 120,
    type: ServiceType.WELLNESS,
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's3',
    name: 'Tennis Court Rental',
    description: 'Reserve a professional-grade hard court for 1 hour.',
    durationMinutes: 60,
    price: 40,
    type: ServiceType.SPORTS,
    imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 's4',
    name: 'Express Paws',
    description: 'Quick wash and dry for small dogs.',
    durationMinutes: 30,
    price: 45,
    type: ServiceType.GROOMING,
    imageUrl: 'https://images.unsplash.com/photo-1596272875729-ed2c21d50c46?auto=format&fit=crop&q=80&w=800'
  }
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Sarah Jenkins', role: 'Senior Stylist', serviceTypes: [ServiceType.GROOMING], imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'r2', name: 'Mike Ross', role: 'Groomer', serviceTypes: [ServiceType.GROOMING], imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 'r3', name: 'Elena Fisher', role: 'Esthetician', serviceTypes: [ServiceType.WELLNESS], imageUrl: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 'r4', name: 'Court A', role: 'Hard Court', serviceTypes: [ServiceType.SPORTS], imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200' },
  { id: 'r5', name: 'Court B', role: 'Clay Court', serviceTypes: [ServiceType.SPORTS], imageUrl: 'https://images.unsplash.com/photo-1588612455963-2d2993d052d3?auto=format&fit=crop&q=80&w=200' },
];

let mockBookingsStore: Booking[] = [
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

// --- EXPORTED SERVICE FUNCTIONS ---

export const fetchServices = async (): Promise<Service[]> => {
  try {
    const response = await client.get<Service[]>('/services');
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock services.');
    return [...MOCK_SERVICES];
  }
};

export const fetchServiceById = async (id: string): Promise<Service | undefined> => {
  const services = await fetchServices();
  return services.find(s => s.id === id);
};

export const fetchResourcesForService = async (serviceType: ServiceType): Promise<Resource[]> => {
  try {
    const response = await client.get<Resource[]>('/resources', {
      params: { serviceTypeId: serviceType }
    });
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, using mock resources.');
    return MOCK_RESOURCES.filter(r => r.serviceTypes.includes(serviceType));
  }
};

export const fetchAvailableSlots = async (date: string, resourceId: string): Promise<TimeSlot[]> => {
  try {
    const response = await client.get<TimeSlot[]>('/timeslots', {
      params: { resourceId, date }
    });
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, generating mock slots.');
    
    // Mock logic for slots
    const slots: TimeSlot[] = [];
    const existingBookings = mockBookingsStore.filter(b => 
      b.date === date && 
      b.resourceId === resourceId && 
      b.status === 'confirmed'
    );
    const bookedTimes = new Set(existingBookings.map(b => b.timeSlot));
    
    // Generate slots from 9:00 to 17:00
    for (let i = 9; i < 17; i++) {
      const time = `${i.toString().padStart(2, '0')}:00`;
      
      // Pseudo-random unavailability based on date chars to make it look realistic but deterministic
      const isRandomlyBooked = (date.charCodeAt(date.length - 1) + i) % 7 === 0;
      
      slots.push({
        time,
        available: !bookedTimes.has(time) && !isRandomlyBooked
      });
    }
    return slots;
  }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> => {
  try {
    const response = await client.post<Booking>('/bookings', {
      ...booking,
      userId: MOCK_USER_ID,
    });
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, creating mock booking.');
    
    const newBooking: Booking = {
      ...booking,
      id: `b_${Date.now()}`,
      status: 'confirmed',
      createdAt: Date.now()
    };
    mockBookingsStore.push(newBooking);
    return newBooking;
  }
};

export const fetchMyBookings = async (): Promise<(Booking & { service?: Service, resource?: Resource })[]> => {
  try {
    const bookingsResponse = await client.get<Booking[]>('/bookings', {
      params: { userId: MOCK_USER_ID }
    });
    const bookings = bookingsResponse.data;
    
    if (bookings.length === 0) return [];
    
    // Populate details from API
    // 1. Fetch Services
    const services = await fetchServices();
    
    // 2. Identify Resource types needed
    const relevantServiceTypes = new Set(
        bookings
          .map(b => services.find(s => s.id === b.serviceId)?.type)
          .filter((t): t is ServiceType => !!t)
      );

    // 3. Fetch Resources
    const resourcesMap = new Map<string, Resource>();
    await Promise.all(
        Array.from(relevantServiceTypes).map(async (type) => {
          try {
            const resources = await fetchResourcesForService(type);
            resources.forEach(r => resourcesMap.set(r.id, r));
          } catch (e) { /* ignore individual resource fetch errors */ }
        })
    );

    // 4. Join
    return bookings
      .map(b => ({
        ...b,
        service: services.find(s => s.id === b.serviceId),
        resource: resourcesMap.get(b.resourceId)
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

  } catch (error) {
    console.warn('Backend unavailable, using mock bookings.');
    
    // Fallback Mock implementation (Join locally)
    return mockBookingsStore
      .map(b => ({
        ...b,
        service: MOCK_SERVICES.find(s => s.id === b.serviceId),
        resource: MOCK_RESOURCES.find(r => r.id === b.resourceId)
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await client.delete(`/bookings/${bookingId}`);
  } catch (error) {
    console.warn('Backend unavailable, cancelling mock booking.');
    const index = mockBookingsStore.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      mockBookingsStore[index] = { ...mockBookingsStore[index], status: 'cancelled' };
    }
  }
};