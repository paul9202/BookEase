import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, DollarSign, AlertCircle } from 'lucide-react';
import { fetchServices } from '../services/api';
import { Service } from '../types';
import { Button, Card, Spinner } from '../components/ui';

export const Home: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices()
      .then((data) => {
        setServices(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load services", err);
        setError("Unable to load services. Please check your connection.");
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Unable to load content</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Book Your Next Experience
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          From pampering your pets to smashing aces on the court, we have you covered.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <Card key={service.id} className="flex flex-col hover:shadow-md transition-shadow duration-200">
            <div className="h-48 w-full overflow-hidden relative">
              <img 
                src={service.imageUrl} 
                alt={service.name} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-indigo-600 shadow-sm">
                {service.type}
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4 flex-grow text-sm leading-relaxed">{service.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {service.durationMinutes} mins
                </div>
                <div className="flex items-center font-medium text-gray-900">
                  <DollarSign className="w-4 h-4 mr-0.5" />
                  {service.price}
                </div>
              </div>

              <Button 
                onClick={() => navigate(`/book/${service.id}`)}
                className="w-full justify-between group"
              >
                Book Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};