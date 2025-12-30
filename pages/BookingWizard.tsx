import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, Clock, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { fetchServiceById, fetchResourcesForService, fetchAvailableSlots, createBooking } from '../services/api';
import { Service, Resource, TimeSlot } from '../types';
import { Button, Card, Spinner } from '../components/ui';

type Step = 'DATE' | 'RESOURCE' | 'SLOT' | 'CONFIRM' | 'SUCCESS';

export const BookingWizard: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  // Data State
  const [service, setService] = useState<Service | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  
  // Selection State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  // UI State
  const [step, setStep] = useState<Step>('DATE');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    if (!serviceId) return;
    
    setLoading(true);
    fetchServiceById(serviceId)
      .then(s => {
        if (!s) {
          setError('Service not found');
          return;
        }
        setService(s);
        return fetchResourcesForService(s.type);
      })
      .then(r => {
        if (r) setResources(r);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load booking details');
        setLoading(false);
      });
  }, [serviceId]);

  // Handlers
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleNextFromDate = () => {
    if (selectedDate) setStep('RESOURCE');
  };

  const handleResourceSelect = (resource: Resource) => {
    setSelectedResource(resource);
    setLoading(true);
    fetchAvailableSlots(selectedDate, resource.id)
      .then(fetchedSlots => {
        setSlots(fetchedSlots);
        setStep('SLOT');
      })
      .finally(() => setLoading(false));
  };

  const handleSlotSelect = (time: string) => {
    setSelectedSlot(time);
    setStep('CONFIRM');
  };

  const handleConfirm = async () => {
    if (!service || !selectedResource || !selectedDate || !selectedSlot) return;

    setSubmitting(true);
    try {
      await createBooking({
        serviceId: service.id,
        resourceId: selectedResource.id,
        date: selectedDate,
        timeSlot: selectedSlot,
        customerName: 'Demo User' // Mock user
      });
      setStep('SUCCESS');
    } catch (e) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !service) return <Spinner />;
  if (error || !service) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Oops!</h2>
      <p className="text-gray-600 mt-2">{error || 'Something went wrong.'}</p>
      <Button variant="outline" className="mt-6" onClick={() => navigate('/')}>Back to Home</Button>
    </div>
  );

  // Helper to generate next 7 days for date picker restriction
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Book {service.name}</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
           <span>Step {step === 'DATE' ? 1 : step === 'RESOURCE' ? 2 : step === 'SLOT' ? 3 : 4} of 4</span>
           <div className="flex-1 h-2 bg-gray-200 rounded-full">
             <div 
                className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: step === 'DATE' ? '25%' : step === 'RESOURCE' ? '50%' : step === 'SLOT' ? '75%' : '100%' }}
             />
           </div>
        </div>
      </div>

      {/* SUCCESS STATE */}
      {step === 'SUCCESS' && (
        <Card className="p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-8">
            You are all set for <span className="font-semibold">{service.name}</span> on <span className="font-semibold">{selectedDate}</span> at <span className="font-semibold">{selectedSlot}</span>.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" onClick={() => navigate('/')}>Book Another</Button>
            <Button onClick={() => navigate('/my-bookings')}>View My Bookings</Button>
          </div>
        </Card>
      )}

      {/* WIZARD STEPS */}
      {step !== 'SUCCESS' && (
        <Card className="p-6 md:p-8">
          
          {/* STEP 1: DATE */}
          {step === 'DATE' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                  Select a Date
                </h3>
                <input
                  type="date"
                  min={today}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  value={selectedDate}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button disabled={!selectedDate} onClick={handleNextFromDate}>
                  Next: Select Resource
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: RESOURCE */}
          {step === 'RESOURCE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-indigo-500" />
                  Select Resource
                </h3>
                <button onClick={() => setStep('DATE')} className="text-sm text-gray-500 hover:text-gray-900">Change Date</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map(res => (
                  <button
                    key={res.id}
                    onClick={() => handleResourceSelect(res)}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                  >
                    <img src={res.imageUrl} alt={res.name} className="w-12 h-12 rounded-full object-cover mr-4 group-hover:ring-2 ring-indigo-300" />
                    <div>
                      <p className="font-semibold text-gray-900">{res.name}</p>
                      <p className="text-sm text-gray-500">{res.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: SLOT */}
          {step === 'SLOT' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                  Select Time
                </h3>
                <button onClick={() => setStep('RESOURCE')} className="text-sm text-gray-500 hover:text-gray-900">Back</button>
              </div>

              {loading ? <Spinner /> : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot.time)}
                      className={`
                        py-2 px-3 rounded text-sm font-medium transition-colors
                        ${!slot.available 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed decoration-slice' 
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-sm'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                  {slots.length === 0 && <p className="col-span-full text-center text-gray-500 py-4">No slots available for this date.</p>}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 'CONFIRM' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6 border-b pb-2">Confirm Booking</h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Service</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-semibold">{service.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Price</dt>
                    <dd className="mt-1 text-sm text-gray-900">${service.price}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedDate}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedSlot}</dd>
                  </div>
                   <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Resource</dt>
                    <dd className="mt-1 text-sm text-gray-900 flex items-center">
                       {selectedResource?.name} <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{selectedResource?.role}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-4 border-t border-gray-100">
                <Button variant="outline" onClick={() => setStep('SLOT')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleConfirm} isLoading={submitting} className="w-full sm:w-auto">
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};