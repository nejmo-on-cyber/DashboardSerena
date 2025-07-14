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
  therapist?: string;
  time?: string;
  price?: number;
  notes?: string;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    client_id: '',
    service_id: '',
    employee_id: '',
    date: '',
    time: '10:00 AM',
    status: 'Scheduled',
    notes: ''
  });
  
  // Form data and options
  const [clients, setClients] = useState<{id: string, name: string}[]>([]);
  const [services, setServices] = useState<{id: string, name: string}[]>([]);
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    service_id: '',
    employee_id: '',
    date: '',
    time: '10:00 AM',
    notes: ''
  });

  const API_BASE_URL = ""; // Use Next.js proxy

  useEffect(() => {
    console.log('🔍 Component mounted, using Next.js proxy for API calls');
    fetchAppointments();
    fetchFormOptions();
  }, []);

  const fetchFormOptions = async () => {
    try {
      // Fetch clients, services, and employees for dropdowns
      const [clientsRes, servicesRes, employeesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/services'),
        fetch('/api/employees')
      ]);

      if (clientsRes.ok) setClients(await clientsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (employeesRes.ok) setEmployees(await employeesRes.json());
    } catch (err) {
      console.error('Error fetching form options:', err);
    }
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create appointment');
      }

      const result = await response.json();
      console.log('✅ Appointment created:', result);
      
      // Reset form and close modal
      setFormData({
        client_id: '',
        service_id: '',
        employee_id: '',
        date: '',
        time: '10:00 AM',
        notes: ''
      });
      setShowAddForm(false);
      
      // Refresh appointments to show new one
      await fetchAppointments();
      
    } catch (err) {
      console.error('❌ Error creating appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    }
  };

  const handleEditAppointment = async (action: 'update' | 'cancel') => {
    if (!selectedAppointment) return;
    
    // Show confirmation for cancellation since it will delete the appointment
    if (action === 'cancel') {
      const confirmed = window.confirm(
        `Are you sure you want to cancel this appointment?\n\n` +
        `Client: ${selectedAppointment.client}\n` +
        `Service: ${selectedAppointment.service}\n` +
        `Date: ${new Date(selectedAppointment.date).toLocaleDateString()}\n\n` +
        `This will permanently remove the appointment from your calendar and Airtable.`
      );
      
      if (!confirmed) {
        return; // User cancelled the cancellation
      }
    }
    
    try {
      const updateData = {
        ...editFormData,
        appointment_id: selectedAppointment.id,
        action: action
      };
      
      const response = await fetch(`/api/appointments/${selectedAppointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} appointment`);
      }

      const result = await response.json();
      console.log(`✅ Appointment ${action}ed:`, result);
      
      if (action === 'cancel') {
        // Show success message for cancellation
        alert(`Appointment cancelled successfully!\n\nThe appointment for ${selectedAppointment.client} has been removed from your calendar and Airtable.`);
      }
      
      // Close modals and refresh
      setShowEditModal(false);
      setShowDetailModal(false);
      setSelectedAppointment(null);
      
      // Refresh appointments to show changes (removed appointment will disappear)
      await fetchAppointments();
      
    } catch (err) {
      console.error(`❌ Error ${action}ing appointment:`, err);
      setError(err instanceof Error ? err.message : `Failed to ${action} appointment`);
    }
  };

  const openEditModal = () => {
    if (selectedAppointment) {
      // Pre-fill form with current appointment data
      setEditFormData({
        client_id: '', // We'll need to map this from the name
        service_id: '',
        employee_id: '',
        date: selectedAppointment.date,
        time: selectedAppointment.time || '10:00 AM',
        status: selectedAppointment.status,
        notes: selectedAppointment.notes || ''
      });
      setShowDetailModal(false);
      setShowEditModal(true);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Use Next.js proxy - requests to /api/* will be forwarded to backend
      const apiUrl = "/api/records";
      
      console.log('🔍 Fetching via Next.js proxy:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const records: AirtableRecord[] = await response.json();
      console.log('🔍 Total records via proxy:', records.length);
      
      const recordsWithDates = records.filter(record => record.lastVisit);
      console.log('🔍 Records with dates:', recordsWithDates.length);
      
      const julyRecords = recordsWithDates.filter(record => record.lastVisit?.includes('2025-07'));
      console.log('🔍 July appointments detail:');
      julyRecords.forEach(record => {
        console.log(`  - ${record.name || record.id.slice(-4)}: ${record.lastVisit}`);
      });
      
      const transformedAppointments: Appointment[] = recordsWithDates.map(record => {
        return {
          id: record.id,
          title: record.preferredService || record.name || `Appointment ${record.id.slice(-4)}`,
          client: record.name || `Client ${record.id.slice(-4)}`,
          service: record.preferredService || 'Service',
          date: record.lastVisit || '', // Use original date without adjustment
          status: record.tags?.[0] || 'scheduled',
          color: getColorForStatus(record.tags?.[0] || 'scheduled'),
          therapist: record.email || 'Therapist', // Therapist name is stored in email field
          time: record.phone || '10:00 AM', // Time is stored in phone field
          price: record.totalSpent || 0,
          notes: record.notes || ''
        };
      });
      
      console.log('🔍 Transformed appointments:', transformedAppointments.length);
      console.log('🔍 July transformed appointments:');
      transformedAppointments.filter(apt => apt.date.includes('2025-07')).forEach(apt => {
        console.log(`  - ${apt.client}: ${apt.date}`);
      });
      
      setAppointments(transformedAppointments);
      setError(null);
      console.log('✅ Successfully loaded appointments via proxy!');
      
    } catch (err) {
      console.error('❌ Proxy connection failed:', err);
      setError(`Connection failed via proxy: ${err instanceof Error ? err.message : "Unknown error"}`);
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
    // Use local date string to avoid timezone conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    const dayAppointments = appointments.filter(apt => {
      // Ensure we're comparing just the date part, not time/timezone
      const aptDateOnly = apt.date.split('T')[0]; // Remove time if present
      return aptDateOnly === dateString;
    });
    
    if (dateString.includes("2025-07")) {
      console.log(`📅 ${dateString}: ${dayAppointments.length} appointments`);
      if (dayAppointments.length > 0) {
        console.log(`   - Appointments: ${dayAppointments.map(apt => apt.client).join(', ')}`);
      }
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
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
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
                                  className={`text-white text-xs p-1 rounded font-bold cursor-pointer hover:opacity-80 transition-opacity ${apt.color}`}
                                  title={`${apt.client} - ${apt.service}`}
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setShowDetailModal(true);
                                  }}
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

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Add New Appointment
              </h3>
              
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData(prev => ({...prev, client_id: e.target.value}))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service *
                  </label>
                  <select
                    value={formData.service_id}
                    onChange={(e) => setFormData(prev => ({...prev, service_id: e.target.value}))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Therapist *
                  </label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData(prev => ({...prev, employee_id: e.target.value}))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Therapist</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="9:30 AM">9:30 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="12:30 PM">12:30 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="1:30 PM">1:30 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="2:30 PM">2:30 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="3:30 PM">3:30 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="4:30 PM">4:30 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Additional notes for the appointment..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        client_id: '',
                        service_id: '',
                        employee_id: '',
                        date: '',
                        time: '10:00 AM',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700"
                  >
                    Create Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Client Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Client Name</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.client}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        selectedAppointment.status.toLowerCase() === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : selectedAppointment.status.toLowerCase() === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedAppointment.status.toLowerCase() === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Appointment Information</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-sm text-gray-600">Service</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.service}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-medium text-gray-900">{selectedAppointment.time}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Therapist</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.therapist}</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Pricing</h4>
                  <div>
                    <p className="text-sm text-gray-600">Total Price</p>
                    <p className="text-2xl font-bold text-green-600">${selectedAppointment.price}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                    <p className="text-gray-700">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={openEditModal}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700"
                  >
                    Edit Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Appointment
              </h3>
              
              {/* Current Appointment Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-blue-800">Current Appointment:</p>
                <p className="text-sm text-blue-700">{selectedAppointment.client} - {selectedAppointment.service}</p>
                <p className="text-sm text-blue-600">{new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}</p>
              </div>
              
              <form className="space-y-4">
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleEditAppointment('cancel')}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700"
                  >
                    Cancel Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Keep current data but allow editing
                      console.log('Reschedule mode activated');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700"
                  >
                    Reschedule
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Update Appointment Details</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.date}
                      onChange={(e) => setEditFormData(prev => ({...prev, date: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Time
                    </label>
                    <select
                      value={editFormData.time}
                      onChange={(e) => setEditFormData(prev => ({...prev, time: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="9:30 AM">9:30 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="12:30 PM">12:30 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="1:30 PM">1:30 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="2:30 PM">2:30 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="3:30 PM">3:30 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="4:30 PM">4:30 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData(prev => ({...prev, status: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="No Show">No Show</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData(prev => ({...prev, notes: e.target.value}))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add or update notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setShowDetailModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditAppointment('update')}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700"
                  >
                    Update Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}