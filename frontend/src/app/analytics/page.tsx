"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Star,
  Target,
  Activity,
  Zap,
  RefreshCw,
  X,
} from "lucide-react";

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  appointments: {
    total: number;
    thisMonth: number;
    completed: number;
    cancelled: number;
    scheduled: number;
  };
  clients: {
    total: number;
    newThisMonth: number;
    returning: number;
    retention: number;
  };
  services: {
    name: string;
    bookings: number;
    revenue: number;
    growth: number;
  }[];
  employees: {
    name: string;
    appointments: number;
    revenue: number;
    utilization: number;
  }[];
  trends: {
    date: string;
    revenue: number;
    appointments: number;
  }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar darkMode={false} />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar darkMode={false} />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50/50">
        <Sidebar darkMode={false} />
        <div className="ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
            <p className="text-gray-600">No data available for the selected time range.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar darkMode={false} />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Track your business performance and insights</p>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-2">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'quarter')}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 3 Months</option>
                </select>
                <button
                  onClick={fetchAnalytics}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Revenue Time Period Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Daily Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Daily Revenue</p>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(analytics.revenue.daily.today)}</p>
              <div className="flex items-center mt-1">
                {analytics.revenue.daily.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${analytics.revenue.daily.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.daily.growth)}
                </span>
              </div>
            </div>

            {/* Weekly Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Weekly Revenue</p>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(analytics.revenue.weekly.this_week)}</p>
              <div className="flex items-center mt-1">
                {analytics.revenue.weekly.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${analytics.revenue.weekly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.weekly.growth)}
                </span>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Monthly Revenue</p>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(analytics.revenue.monthly.this_month)}</p>
              <div className="flex items-center mt-1">
                {analytics.revenue.monthly.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${analytics.revenue.monthly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.monthly.growth)}
                </span>
              </div>
            </div>

            {/* Quarterly Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Quarterly Revenue</p>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(analytics.revenue.quarterly.this_quarter)}</p>
              <div className="flex items-center mt-1">
                {analytics.revenue.quarterly.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${analytics.revenue.quarterly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.quarterly.growth)}
                </span>
              </div>
            </div>

            {/* Yearly Revenue */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600">Yearly Revenue</p>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(analytics.revenue.yearly.this_year)}</p>
              <div className="flex items-center mt-1">
                {analytics.revenue.yearly.growth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={`text-xs font-medium ${analytics.revenue.yearly.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.revenue.yearly.growth)}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Revenue Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue.total)}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-gray-600">
                      Avg: {formatCurrency(analytics.revenue.avg_appointment_value)}/appointment
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Appointments Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.appointments.total}</p>
                  <div className="flex items-center mt-2">
                    <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {analytics.appointments.completion_rate.toFixed(1)}% completion rate
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Clients Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Clients</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.clients.total}</p>
                  <div className="flex items-center mt-2">
                    <Users className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {analytics.clients.new_this_month} new this month
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Retention Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Client Retention</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.clients.retention_rate.toFixed(1)}%</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-orange-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {analytics.clients.returning} returning clients
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Services */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Services</h2>
              <div className="space-y-4">
                {analytics.services.slice(0, 5).map((service, index) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{service.name}</p>
                        <p className="text-sm text-gray-600">{service.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(service.revenue)}</p>
                      <div className="flex items-center">
                        {service.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                        )}
                        <span className={`text-xs ${service.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(service.growth)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Employees */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performers</h2>
              <div className="space-y-4">
                {analytics.employees.slice(0, 5).map((employee, index) => (
                  <div key={employee.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.appointments} appointments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(employee.revenue)}</p>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1" />
                        <span className="text-xs text-gray-600">{employee.utilization.toFixed(1)}% utilization</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appointment Status Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Appointment Status Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.appointments.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-xs text-green-600 mt-1">
                  {((analytics.appointments.completed / analytics.appointments.total) * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.appointments.scheduled}</p>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((analytics.appointments.scheduled / analytics.appointments.total) * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.appointments.cancelled}</p>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-xs text-red-600 mt-1">
                  {((analytics.appointments.cancelled / analytics.appointments.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}