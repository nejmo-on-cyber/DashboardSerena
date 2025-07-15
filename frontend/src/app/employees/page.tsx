"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Camera,
  X,
  Check,
  MapPin,
  UserPlus,
  Search,
  Filter
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

interface Employee {
  id: string;
  full_name: string;
  employee_number: string;
  email: string;
  contact_number: string;
  availability_days: string[];
  expertise: string[];
  profile_picture: string;
  start_date: string;
  status: string;
}

interface Service {
  id: string;
  name: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const placeholderImages = [
  "https://images.unsplash.com/photo-1494790108755-2616b5e7c8b0?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face"
];

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [darkMode, setDarkMode] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: "",
    employee_number: "",
    email: "",
    contact_number: "",
    availability_days: [] as string[],
    expertise: [] as string[],
    profile_picture: "",
    start_date: "",
    status: "Active"
  });

  useEffect(() => {
    fetchEmployees();
    fetchServices();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee-availability');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      console.error('Failed to load services:', err);
    }
  };

  const handleCreateEmployee = async () => {
    if (!formData.full_name || !formData.employee_number) {
      setError('Name and Employee Number are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create employee');
      
      await fetchEmployees();
      setShowAddForm(false);
      resetForm();
      setError(null);
    } catch (err) {
      setError('Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update employee');
      
      await fetchEmployees();
      setShowEditForm(false);
      setEditingEmployee(null);
      resetForm();
      setError(null);
    } catch (err) {
      setError('Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete employee');
      
      await fetchEmployees();
    } catch (err) {
      setError('Failed to delete employee');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      employee_number: "",
      email: "",
      contact_number: "",
      availability_days: [],
      expertise: [],
      profile_picture: "",
      start_date: "",
      status: "Active"
    });
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availability_days: prev.availability_days.includes(day)
        ? prev.availability_days.filter(d => d !== day)
        : [...prev.availability_days, day]
    }));
  };

  const toggleService = (serviceName: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(serviceName)
        ? prev.expertise.filter(s => s !== serviceName)
        : [...prev.expertise, serviceName]
    }));
  };

  const getRandomPlaceholder = () => {
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Inactive':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'On Leave':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "All" || employee.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar darkMode={darkMode} />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Team Management
            </h1>
            <p className="text-lg text-gray-600 font-medium">
              Manage your team members, schedules, and service assignments
            </p>
          </div>

          {/* Actions and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-80 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none bg-white/50 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 focus:outline-none bg-white/50 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Add Employee Button */}
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <Plus className="w-5 h-5" />
                <span>Add Team Member</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm text-gray-600 font-medium">Total Team</p>
                  <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm text-gray-600 font-medium">Active</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {employees.filter(e => e.status === 'Active').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm text-gray-600 font-medium">On Leave</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {employees.filter(e => e.status === 'On Leave').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-all duration-200">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                  <X className="w-7 h-7 text-red-600" />
                </div>
                <div className="ml-6">
                  <p className="text-sm text-gray-600 font-medium">Inactive</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {employees.filter(e => e.status === 'Inactive').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Cards */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Team Members</h2>
            
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-4 font-medium">Loading team members...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center space-x-5 mb-6">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                        {employee.profile_picture ? (
                          <img 
                            src={employee.profile_picture} 
                            alt={employee.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={getRandomPlaceholder()} 
                            alt={employee.full_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">{employee.full_name}</h3>
                        <p className="text-sm text-gray-600 font-medium mb-2">#{employee.employee_number}</p>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(employee.status)}`}>
                          {employee.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{employee.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{employee.contact_number || 'No phone'}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{employee.availability_days.join(', ') || 'No availability set'}</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Expertise</p>
                      <div className="flex flex-wrap gap-2">
                        {employee.expertise.slice(0, 3).map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                            {skill}
                          </span>
                        ))}
                        {employee.expertise.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                            +{employee.expertise.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setFormData({
                            full_name: employee.full_name || "",
                            employee_number: employee.employee_number || "",
                            email: employee.email || "",
                            contact_number: employee.contact_number || "",
                            availability_days: employee.availability_days || [],
                            expertise: employee.expertise || [],
                            profile_picture: employee.profile_picture || "",
                            start_date: employee.start_date || "",
                            status: employee.status || "Active"
                          });
                          setShowEditForm(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredEmployees.length === 0 && !loading && (
              <div className="text-center py-16">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No team members found
                </h3>
                <p className="text-gray-600 font-medium">
                  {searchTerm || filterStatus !== "All" 
                    ? "Try adjusting your search or filters"
                    : "Add your first team member to get started"
                  }
                </p>
              </div>
            )}
          </div>

          {/* Add Employee Form */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Number *
                      </label>
                      <input
                        type="text"
                        value={formData.employee_number}
                        onChange={(e) => setFormData(prev => ({...prev, employee_number: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., EMP001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="employee@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData(prev => ({...prev, contact_number: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability Days
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            formData.availability_days.includes(day)
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services & Expertise
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.name)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                            formData.expertise.includes(service.name)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Picture URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.profile_picture}
                      onChange={(e) => setFormData(prev => ({...prev, profile_picture: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEmployee}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Employee Form */}
          {showEditForm && editingEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Employee</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Number *
                      </label>
                      <input
                        type="text"
                        value={formData.employee_number}
                        onChange={(e) => setFormData(prev => ({...prev, employee_number: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., EMP001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="employee@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData(prev => ({...prev, contact_number: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability Days
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                            formData.availability_days.includes(day)
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Services & Expertise
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.name)}
                          className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                            formData.expertise.includes(service.name)
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Picture URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.profile_picture}
                      onChange={(e) => setFormData(prev => ({...prev, profile_picture: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingEmployee(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateEmployee}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Employee'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm z-50">
              <div className="flex items-center">
                <X className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}