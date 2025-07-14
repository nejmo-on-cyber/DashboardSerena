"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface AirtableRecord {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  lastVisit?: string;
  nextAppointment?: string;
  preferredService?: string;
  totalVisits?: number;
  totalSpent?: number;
  tags?: string[];
  notes?: string;
  createdAt?: string;
}

interface Appointment {
  id: string;
  title: string;
  client: string;
  service: string;
  date: string;
  status: string;
  color: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching appointments from:', `${API_BASE_URL}/api/records`);
      
      const response = await fetch(`${API_BASE_URL}/api/records`);
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      }
      
      const records: AirtableRecord[] = await response.json();
      console.log('🔍 Total records:', records.length);
      
      const recordsWithDates = records.filter(record => record.lastVisit);
      console.log('🔍 Records with dates:', recordsWithDates.length);
      
      const julyRecords = recordsWithDates.filter(record => record.lastVisit?.includes('2025-07'));
      console.log('🔍 July 2025 records:', julyRecords.length);
      
      const transformedAppointments: Appointment[] = recordsWithDates.map(record => ({
        id: record.id,
        title: record.preferredService || record.name || `Appointment ${record.id.slice(-4)}`,
        client: record.name || `Client ${record.id.slice(-4)}`,
        service: record.preferredService || 'Service',
        date: record.lastVisit || '',
        status: record.tags?.[0] || 'scheduled',
        color: getColorForStatus(record.tags?.[0] || 'scheduled')
      }));
      
      console.log('🔍 Transformed appointments:', transformedAppointments.length);
      console.log('🔍 July appointments:', transformedAppointments.filter(apt => apt.date.includes('2025-07')));
      
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getColorForStatus = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-purple-500';
    }
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const dayAppointments = appointments.filter(apt => apt.date === dateString);
    
    if (dateString.includes("2025-07")) {
      console.log(`📅 ${dateString}: ${dayAppointments.length} appointments`);
    }
    
    return dayAppointments;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex">
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">Manage your appointments from Airtable</p>
            </div>
            <button className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              <Plus className="w-5 h-5" />
              <span>Add Appointment</span>
            </button>
          </div>

          {/* Calendar Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading appointments from Airtable...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">Error: {error}</p>
                <button
                  onClick={fetchAppointments}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div>
                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                  {getDaysInMonth(currentDate).map((day, index) => {
                    const dayAppointments = day ? getAppointmentsForDate(day) : [];
                    const isToday = day && day.toDateString() === new Date().toDateString();

                    return (
                      <div
                        key={index}
                        className={`min-h-32 p-2 border-r border-b border-gray-200 ${
                          day ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-50"
                        } ${isToday ? "bg-purple-50" : ""}`}
                      >
                        {day && (
                          <>
                            <div className={`text-sm font-medium mb-1 ${
                              isToday ? "text-purple-600 font-bold" : "text-gray-900"
                            }`}>
                              {day.getDate()}
                            </div>
                            
                            {/* Appointments */}
                            <div className="space-y-1">
                              {dayAppointments.slice(0, 3).map((apt) => (
                                <div
                                  key={apt.id}
                                  className={`text-white text-xs p-1 rounded font-bold ${apt.color}`}
                                  title={`${apt.client} - ${apt.service}`}
                                >
                                  {apt.client}
                                </div>
                              ))}
                              {dayAppointments.length > 3 && (
                                <div className="text-xs text-purple-600 font-bold">
                                  +{dayAppointments.length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
                <div className="text-sm text-gray-600">Total Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.filter(apt => apt.date.includes('2025-07')).length}
                </div>
                <div className="text-sm text-gray-600">July Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status.toLowerCase() === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}