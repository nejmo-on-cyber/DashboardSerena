"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface Therapist {
  id: string;
  full_name: string;
  employee_number: string;
  availability_days: string[];
  expertise: string[];
  contact_number: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
  endTime: string;
}

export default function BookingAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [qualifiedTherapists, setQualifiedTherapists] = useState<Therapist[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Generate time slots for the day
  const generateTimeSlots = (duration: number): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = calculateEndTime(time, duration);
        
        // Check if the slot fits within business hours
        if (timeToMinutes(endTime) <= timeToMinutes('17:00')) {
          slots.push({
            time,
            available: true, // This would be checked against actual bookings
            duration,
            endTime
          });
        }
      }
    }
    return slots;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateEndTime = (startTime: string, duration: number): string => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + duration;
    const hours = Math.floor(endMinutes / 60);
    const minutes = endMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getDayName = (date: string): string => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return dayNames[new Date(date).getDay()];
  };

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Fetch qualified therapists when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchQualifiedTherapists(selectedService.name);
    }
  }, [selectedService]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services-with-duration');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifiedTherapists = async (serviceName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/therapists-by-service/${encodeURIComponent(serviceName)}`);
      if (!response.ok) throw new Error('Failed to fetch therapists');
      const data = await response.json();
      setQualifiedTherapists(data);
    } catch (err) {
      setError('Failed to load therapists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (therapistId: string, timeSlot: TimeSlot) => {
    if (!selectedService) return;
    
    try {
      const bookingData = {
        client_id: 'admin-booking', // This would be replaced with actual client selection
        service_id: selectedService.id,
        employee_id: therapistId,
        date: selectedDate,
        time: timeSlot.time,
        notes: `Duration: ${selectedService.duration} minutes (${timeSlot.time} - ${timeSlot.endTime})`
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Failed to create booking');
      
      alert('Booking created successfully!');
      // Refresh the view or update the time slot status
    } catch (err) {
      alert('Failed to create booking');
      console.error(err);
    }
  };

  const isTherapistAvailable = (therapist: Therapist, selectedDate: string): boolean => {
    const dayName = getDayName(selectedDate);
    return therapist.availability_days.includes(dayName);
  };

  const getAlternativeAvailability = (selectedDate: string) => {
    const currentDate = new Date(selectedDate);
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const previousDateStr = formatDate(previousDate);
    const nextDateStr = formatDate(nextDate);

    const previousDayAvailable = qualifiedTherapists.filter(therapist => 
      isTherapistAvailable(therapist, previousDateStr)
    );
    
    const nextDayAvailable = qualifiedTherapists.filter(therapist => 
      isTherapistAvailable(therapist, nextDateStr)
    );

    return {
      previous: {
        date: previousDateStr,
        dayName: getDayName(previousDateStr),
        therapists: previousDayAvailable
      },
      next: {
        date: nextDateStr,
        dayName: getDayName(nextDateStr),
        therapists: nextDayAvailable
      }
    };
  };

  const hasAvailabilityForSelectedDay = () => {
    return qualifiedTherapists.some(therapist => 
      isTherapistAvailable(therapist, selectedDate)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar darkMode={darkMode} />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Booking Administration
            </h1>
            <p className="text-gray-600">
              Manage appointments by service, therapist availability, and time slots
            </p>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Select Service
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedService?.id === service.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="text-purple-600 font-medium">
                      ${service.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          {selectedService && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Select Date
              </h2>
              <div className="flex items-center space-x-4">
                <CalendarIcon className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-gray-600">
                  {getDayName(selectedDate)}
                </span>
              </div>
            </div>
          )}

          {/* Therapist Availability Grid */}
          {selectedService && qualifiedTherapists.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. Available Therapists & Time Slots
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                Service: <span className="font-medium">{selectedService.name}</span> 
                ({selectedService.duration} minutes) - {getDayName(selectedDate)}
              </div>
              
              {hasAvailabilityForSelectedDay() ? (
                <div className="space-y-6">
                  {qualifiedTherapists.map((therapist) => {
                    const isAvailable = isTherapistAvailable(therapist, selectedDate);
                    
                    if (!isAvailable) return null;
                    
                    const timeSlots = generateTimeSlots(selectedService.duration);
                    
                    return (
                      <div key={therapist.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-gray-500" />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {therapist.full_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Employee #{therapist.employee_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                Specialties: {therapist.expertise.join(', ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              Available
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {timeSlots.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => handleBooking(therapist.id, slot)}
                              disabled={!slot.available}
                              className={`p-2 text-sm border rounded transition-colors ${
                                slot.available
                                  ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
                                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              }`}
                            >
                              <div className="font-medium">{slot.time}</div>
                              <div className="text-xs">-{slot.endTime}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* No availability message */}
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Available Bookings Today
                    </h3>
                    <p className="text-gray-600 mb-4">
                      There are no therapists available for "{selectedService.name}" on {getDayName(selectedDate)}, {new Date(selectedDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Alternative Availability Section */}
                  {(() => {
                    const alternatives = getAlternativeAvailability(selectedDate);
                    const hasAlternatives = alternatives.previous.therapists.length > 0 || alternatives.next.therapists.length > 0;
                    
                    return hasAlternatives ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          Alternative Availability (24 Hours Before & After)
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Previous Day */}
                          {alternatives.previous.therapists.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
                                Yesterday ({alternatives.previous.dayName})
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                {new Date(alternatives.previous.date).toLocaleDateString()}
                              </p>
                              
                              <div className="space-y-3">
                                {alternatives.previous.therapists.map((therapist) => (
                                  <div key={therapist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium text-sm">{therapist.full_name}</p>
                                      <p className="text-xs text-gray-500">#{therapist.employee_number}</p>
                                    </div>
                                    <button
                                      onClick={() => setSelectedDate(alternatives.previous.date)}
                                      className="px-3 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                                    >
                                      Select
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Next Day */}
                          {alternatives.next.therapists.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                                Tomorrow ({alternatives.next.dayName})
                              </h5>
                              <p className="text-sm text-gray-600 mb-3">
                                {new Date(alternatives.next.date).toLocaleDateString()}
                              </p>
                              
                              <div className="space-y-3">
                                {alternatives.next.therapists.map((therapist) => (
                                  <div key={therapist.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                      <p className="font-medium text-sm">{therapist.full_name}</p>
                                      <p className="text-xs text-gray-500">#{therapist.employee_number}</p>
                                    </div>
                                    <button
                                      onClick={() => setSelectedDate(alternatives.next.date)}
                                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                      Select
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {alternatives.previous.therapists.length === 0 && alternatives.next.therapists.length === 0 && (
                          <div className="text-center py-4">
                            <p className="text-gray-600">
                              No availability found for 24 hours before or after the selected date.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700">
                          No availability found for 24 hours before or after the selected date.
                        </p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* No qualified therapists message */}
          {selectedService && qualifiedTherapists.length === 0 && !loading && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Qualified Therapists
                </h3>
                <p className="text-gray-600">
                  No therapists are qualified to perform "{selectedService.name}" service.
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}