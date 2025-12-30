import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, XCircle, AlertCircle } from 'lucide-react';
import { fetchMyBookings, cancelBooking } from '../services/api';
import { Booking, Service, Resource } from '../types';
import { Button, Card, Spinner } from '../components/ui';
import { Link } from 'react-router-dom';

type BookingWithDetails = Booking & { service?: Service; resource?: Resource };

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchMyBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    setCancellingId(id);
    try {
      await cancelBooking(id);
      // Optimistic update or reload
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && bookings.length === 0) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>

      {bookings.length === 0 ? (
        <Card className="p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
          <p className="text-gray-500 mt-2 mb-6">Start your journey by exploring our services.</p>
          <Link to="/">
            <Button>Explore Services</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="p-0 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-48 h-32 md:h-auto relative bg-gray-200">
                  {booking.service?.imageUrl ? (
                    <img 
                      src={booking.service.imageUrl} 
                      alt={booking.service.name} 
                      className={`w-full h-full object-cover ${booking.status === 'cancelled' ? 'grayscale opacity-75' : ''}`}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <CalendarIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className={`
                    absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase rounded text-white
                    ${booking.status === 'confirmed' ? 'bg-green-500' : 'bg-gray-500'}
                  `}>
                    {booking.status}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-bold ${booking.status === 'cancelled' ? 'text-gray-500' : 'text-gray-900'}`}>
                          {booking.service?.name || 'Unknown Service'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{booking.service?.description}</p>
                      </div>
                      <div className="text-right">
                         <span className="text-lg font-semibold text-gray-900">${booking.service?.price}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                        {booking.date}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                        {booking.timeSlot}
                      </div>
                      <div className="flex items-center text-gray-600 col-span-2">
                        <User className="w-4 h-4 mr-2 text-indigo-500" />
                        {booking.resource?.name} <span className="text-gray-400 ml-1">({booking.resource?.role})</span>
                      </div>
                    </div>
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleCancel(booking.id)}
                        isLoading={cancellingId === booking.id}
                        className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};