"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Edit,
  Trash2,
  Sun,
  Moon,
  Filter,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  staff: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
  color: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterStaff, setFilterStaff] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8001";

  // Fetch appointments from Airtable
  useEffect(() => {
    console.log('Calendar component mounted, fetching appointments...');
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      console.log('Fetching from:', `${API_BASE_URL}/api/records`);
      const response = await fetch(`${API_BASE_URL}/api/records`);
      console.log('Response status:', response.status);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      const records: AirtableRecord[] = await response.json();
      console.log('Fetched records:', records.length);
      console.log('Sample record:', records[0]);
      
      // Transform Airtable records to calendar appointments
      const transformedAppointments: Appointment[] = records
        .filter(record => record.lastVisit) // Only include records with dates
        .map(record => {
          const status = record.tags?.[0]?.toLowerCase() || 'scheduled';
          return {
            id: record.id,
            title: record.preferredService || record.name || `Appointment ${record.id.slice(-4)}`,
            client: record.name || `Client ${record.id.slice(-4)}`,
            service: record.preferredService || 'Service',
            staff: 'Staff', // Could be mapped from another field
            date: record.lastVisit || '',
            startTime: '10:00', // Default time, could be extracted from notes or another field
            endTime: '11:00',   // Default duration
            status: ['completed', 'scheduled', 'cancelled', 'pending'].includes(status) 
              ? status as "confirmed" | "pending" | "cancelled" | "completed"
              : 'confirmed',
            notes: record.notes || '',
            color: getColorForStatus(record.tags?.[0] || 'scheduled')
          };
        });
      
      console.log('Transformed appointments:', transformedAppointments.length);
      console.log('July appointments:', transformedAppointments.filter(apt => apt.date.includes('2025-07')));
      setAppointments(transformedAppointments);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
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

  const staff = ["all", "Jessica", "Maria", "David", "Sarah"];
  const statuses = ["all", "confirmed", "pending", "cancelled", "completed"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const dayAppointments = appointments.filter((apt) => {
      const matchesDate = apt.date === dateString;
      const matchesStaff = filterStaff === "all" || apt.staff === filterStaff;
      const matchesStatus =
        filterStatus === "all" || apt.status === filterStatus;
      return matchesDate && matchesStaff && matchesStatus;
    });
    
    // Debug logging for specific dates
    if (dateString === "2025-07-15" || dateString === "2025-07-16" || dateString === "2025-07-24") {
      console.log(`Appointments for ${dateString}:`, dayAppointments);
      console.log('All appointments:', appointments.length);
    }
    
    return dayAppointments;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "scheduled":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300";
      case "cancelled":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300";
      case "confirmed":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-serena-dark"
          : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
      }`}
      data-oid="v_u5p_5"
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} data-oid="nybqmme" />

      {/* Main Content */}
      <div className="lg:ml-64" data-oid=":ev5p-d">
        {/* Header */}
        <header
          className={`border-b transition-all duration-300 backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-purple-100"
          }`}
          data-oid="8terfvt"
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-oid="sd.ce6c"
          >
            <div
              className="flex items-center justify-between h-16"
              data-oid="xc8nc-."
            >
              <div
                className="flex items-center space-x-4 lg:ml-0 ml-12"
                data-oid="18vgux3"
              >
                <div data-oid="f6eh8fb">
                  <h1
                    className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="2q8sc.:"
                  >
                    Calendar & Appointments
                  </h1>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="l366of1"
                  >
                    Manage your schedule and appointments
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4" data-oid="-l28m8s">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                  data-oid="ce:o8fw"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" data-oid="tvl6a_a" />
                  ) : (
                    <Moon className="w-5 h-5" data-oid="yl2osv." />
                  )}
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  data-oid="udju33q"
                >
                  <Plus className="w-4 h-4" data-oid="qwzrgrz" />
                  <span data-oid="qv._:ab">New Appointment</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          data-oid="sh-th0a"
        >
          {/* Calendar Controls */}
          <div
            className={`rounded-xl shadow-sm border p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid="m5.od.2"
          >
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
              data-oid="ub8vqpw"
            >
              {/* Date Navigation */}
              <div className="flex items-center space-x-4" data-oid="yw_kif7">
                <button
                  onClick={() => navigateMonth("prev")}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                  data-oid="biz0dl9"
                >
                  <ChevronLeft
                    className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    data-oid="p_prif9"
                  />
                </button>

                <h2
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  data-oid="ha9wthk"
                >
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h2>

                <button
                  onClick={() => navigateMonth("next")}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                  data-oid="isgcq6g"
                >
                  <ChevronRight
                    className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                    data-oid="2a5_9m:"
                  />
                </button>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-oid="tx1ctsa"
                >
                  Today
                </button>
              </div>

              {/* View Toggle & Filters */}
              <div className="flex items-center space-x-4" data-oid="u:k9xgf">
                {/* Filters */}
                <select
                  value={filterStaff}
                  onChange={(e) => setFilterStaff(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  data-oid="_7kuqax"
                >
                  {staff.map((s) => (
                    <option key={s} value={s} data-oid="_zmodfr">
                      {s === "all" ? "All Staff" : s}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  data-oid="bbq6l.d"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s} data-oid="dbcegm8">
                      {s === "all"
                        ? "All Status"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>

                {/* View Toggle */}
                <div
                  className={`flex rounded-lg border ${
                    darkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                  data-oid="c2q--m."
                >
                  {(["month", "week", "day"] as const).map((viewType) => (
                    <button
                      key={viewType}
                      onClick={() => setView(viewType)}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        view === viewType
                          ? "bg-purple-600 text-white"
                          : darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                      } ${
                        viewType === "month"
                          ? "rounded-l-lg"
                          : viewType === "day"
                            ? "rounded-r-lg"
                            : ""
                      }`}
                      data-oid=".h75ksk"
                    >
                      {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Loading appointments from Airtable...
              </p>
            </div>
          ) : error ? (
            <div className={`rounded-xl shadow-sm border p-8 text-center ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}>
              <p className="text-red-600 mb-2">Error loading appointments:</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                {error}
              </p>
              <button
                onClick={fetchAppointments}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
          <div
            className={`rounded-xl shadow-sm border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid="-4w1xgh"
          >
            {/* Calendar Header */}
            <div
              className={`grid grid-cols-7 border-b ${
                darkMode
                  ? "border-gray-700 bg-gray-750"
                  : "border-gray-200 bg-gray-50"
              }`}
              data-oid="2wihu-p"
            >
              {dayNames.map((day) => (
                <div key={day} className="p-4 text-center" data-oid=":5t3rfk">
                  <span
                    className={`text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                    data-oid="h6pxa1w"
                  >
                    {day}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7" data-oid="vrh3m:8">
              {getDaysInMonth(currentDate).map((day, index) => {
                const isToday =
                  day && day.toDateString() === new Date().toDateString();
                const dayAppointments = day ? getAppointmentsForDate(day) : [];

                return (
                  <div
                    key={index}
                    className={`min-h-32 p-2 border-r border-b transition-colors cursor-pointer ${
                      darkMode
                        ? "border-gray-700 hover:bg-gray-750"
                        : "border-gray-200 hover:bg-gray-50"
                    } ${!day ? "bg-gray-100 dark:bg-gray-900" : ""}`}
                    onClick={() => day && setSelectedDate(day)}
                    data-oid="d7ah036"
                  >
                    {day && (
                      <>
                        <div
                          className="flex items-center justify-between mb-2"
                          data-oid="gt8v3vt"
                        >
                          <span
                            className={`text-sm font-medium ${
                              isToday
                                ? "bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                : darkMode
                                  ? "text-gray-300"
                                  : "text-gray-700"
                            }`}
                            data-oid="kx7cgk0"
                          >
                            {day.getDate()}
                          </span>
                        </div>

                        <div className="space-y-1" data-oid="0t-w_7_">
                          {dayAppointments.slice(0, 3).map((apt) => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded text-white truncate ${apt.color}`}
                              title={`${apt.startTime} - ${apt.client} (${apt.service})`}
                              data-oid="b269r90"
                              style={{fontSize: '10px', lineHeight: '12px'}}
                            >
                              {apt.startTime} {apt.client}
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              data-oid="9y5e-ru"
                            >
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

          {/* Today's Appointments */}
          <div
            className={`mt-6 rounded-xl shadow-sm border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid="pj3hb-i"
          >
            <div
              className="p-6 border-b border-gray-200 dark:border-gray-700"
              data-oid="db-2jpg"
            >
              <h3
                className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="v1j0fxi"
              >
                Today's Appointments
              </h3>
            </div>

            <div className="p-6" data-oid="z7uubgx">
              {getAppointmentsForDate(new Date()).length === 0 ? (
                <div className="text-center py-8" data-oid="rg61m9l">
                  <CalendarIcon
                    className={`w-12 h-12 mx-auto mb-4 ${
                      darkMode ? "text-gray-600" : "text-gray-400"
                    }`}
                    data-oid="eani--y"
                  />

                  <p
                    className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid=".r1i:e4"
                  >
                    No appointments scheduled for today
                  </p>
                </div>
              ) : (
                <div className="space-y-4" data-oid="_1lztqa">
                  {getAppointmentsForDate(new Date()).map((apt) => (
                    <div
                      key={apt.id}
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        darkMode
                          ? "border-gray-700 bg-gray-750"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      data-oid="1_8e7kw"
                    >
                      <div
                        className="flex items-start justify-between"
                        data-oid="o4k3b9g"
                      >
                        <div className="flex-1" data-oid="_j882uw">
                          <div
                            className="flex items-center space-x-3 mb-2"
                            data-oid="j6usew0"
                          >
                            <h4
                              className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                              data-oid=":a55xlv"
                            >
                              {apt.service}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(apt.status)}`}
                              data-oid="lr2v-6v"
                            >
                              {apt.status}
                            </span>
                          </div>

                          <div
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
                            data-oid="ys5hesa"
                          >
                            <div
                              className="flex items-center space-x-2"
                              data-oid="3dp5p-r"
                            >
                              <User
                                className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                data-oid="vy5en0g"
                              />

                              <span
                                className={
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }
                                data-oid="1qz9a-b"
                              >
                                {apt.client}
                              </span>
                            </div>

                            <div
                              className="flex items-center space-x-2"
                              data-oid="cc80l:y"
                            >
                              <Clock
                                className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                data-oid="d2zrx-0"
                              />

                              <span
                                className={
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }
                                data-oid=":ex5ntp"
                              >
                                {apt.startTime} - {apt.endTime}
                              </span>
                            </div>

                            <div
                              className="flex items-center space-x-2"
                              data-oid="w5q51tu"
                            >
                              <MapPin
                                className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                                data-oid=":sutsvm"
                              />

                              <span
                                className={
                                  darkMode ? "text-gray-300" : "text-gray-700"
                                }
                                data-oid="8w:1u8z"
                              >
                                {apt.staff}
                              </span>
                            </div>
                          </div>

                          {apt.notes && (
                            <p
                              className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                              data-oid="v5ihkfo"
                            >
                              {apt.notes}
                            </p>
                          )}
                        </div>

                        <div
                          className="flex items-center space-x-2 ml-4"
                          data-oid="7y9dwp:"
                        >
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-200"
                            }`}
                            title="Edit Appointment"
                            data-oid="-yynuao"
                          >
                            <Edit
                              className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                              data-oid="dtprdyx"
                            />
                          </button>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-200"
                            }`}
                            title="Cancel Appointment"
                            data-oid="k71k41."
                          >
                            <Trash2
                              className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                              data-oid="2nzk_ej"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          data-oid="hi3ni71"
        >
          <div
            className={`rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            data-oid="jow6l6h"
          >
            <div className="p-6" data-oid="o7.n.:l">
              <h3
                className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="030778o"
              >
                New Appointment
              </h3>

              <form className="space-y-4" data-oid="m0agvxd">
                <div data-oid="dg8u_8m">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="h5iqwa8"
                  >
                    Client Name
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="Enter client name"
                    data-oid="5pnw_h0"
                  />
                </div>

                <div data-oid="yeac_85">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="8.ae9bd"
                  >
                    Service
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="j3i3w.y"
                  >
                    <option data-oid="pgniwi0">Hair Cut</option>
                    <option data-oid="vio9d6w">Hair Color</option>
                    <option data-oid="c8xvnfj">Facial Treatment</option>
                    <option data-oid="c14:dwu">Massage</option>
                    <option data-oid="abg8n93">Manicure</option>
                    <option data-oid="10t-i:s">Pedicure</option>
                  </select>
                </div>

                <div data-oid="_fl.tqg">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="nf27fu1"
                  >
                    Staff Member
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="y0fnuqf"
                  >
                    <option data-oid="w.a807h">Jessica</option>
                    <option data-oid="t64lyq5">Maria</option>
                    <option data-oid="oe6_nhs">David</option>
                    <option data-oid="obgjo_a">Sarah</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4" data-oid="l_-71kn">
                  <div data-oid="79qrxku">
                    <label
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      data-oid="kr..ewg"
                    >
                      Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      data-oid="3twy0-:"
                    />
                  </div>

                  <div data-oid="a6cvt:n">
                    <label
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      data-oid="9pdq_7j"
                    >
                      Time
                    </label>
                    <input
                      type="time"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}
                      data-oid="0tb00:k"
                    />
                  </div>
                </div>

                <div data-oid="-6v4z47">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="5_1c5l_"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="Any special notes or requirements"
                    data-oid="qg0elbg"
                  />
                </div>

                <div className="flex space-x-3 pt-4" data-oid="k9mssj0">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    data-oid="ui_kmx6"
                  >
                    Create Appointment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    data-oid="11qopma"
                  >
                    Cancel
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
