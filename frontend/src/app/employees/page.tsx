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
  services: string[];  // NEW field
  profile_picture: string;
  start_date: string;
  status: string;
}

interface Service {
  id: string;
  name: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const expertiseCategories = ["Haircut", "Coloring", "Styling", "Massage", "Facials", "Manicure", "Pedicure"];

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
  const [pictureUploadMode, setPictureUploadMode] = useState<'url' | 'upload'>('url');
  const [uploadedPicture, setUploadedPicture] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    employee_number: "",
    email: "",
    contact_number: "",
    availability_days: [] as string[],
    expertise: [] as string[],
    services: [] as string[],  // NEW field
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
      services: [],  // NEW field
      profile_picture: "",
      start_date: "",
      status: "Active"
    });
    setPictureUploadMode('url');
    setUploadedPicture(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setUploadedPicture(base64String);
        setFormData(prev => ({ ...prev, profile_picture: base64String }));
      };
      reader.readAsDataURL(file);
    }
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
      services: prev.services.includes(serviceName)
        ? prev.services.filter(s => s !== serviceName)
        : [...prev.services, serviceName]
    }));
  };

  const toggleExpertise = (expertiseCategory: string) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertiseCategory)
        ? prev.expertise.filter(e => e !== expertiseCategory)
        : [...prev.expertise, expertiseCategory]
    }));
  };

  const getConsistentPlaceholder = (employeeId: string) => {
    // Use employee ID to generate consistent placeholder
    const hash = employeeId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % placeholderImages.length;
    return placeholderImages[index];
  };

  const getStatusGlowEffect = (status: string) => {
    switch (status) {
      case 'Active':
        return 'relative before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-green-400 before:via-green-500 before:to-green-400 before:animate-pulse hover:before:animate-spin';
      case 'Inactive':
        return 'relative before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-red-400 before:via-red-500 before:to-red-400 before:animate-pulse hover:before:animate-spin';
      case 'On Leave':
        return 'relative before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-orange-400 before:via-orange-500 before:to-orange-400 before:animate-pulse hover:before:animate-spin';
      default:
        return 'relative before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-gray-400 before:via-gray-500 before:to-gray-400 before:animate-pulse hover:before:animate-spin';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-300 shadow-sm';
      case 'Inactive':
        return 'bg-red-100 text-red-800 border-red-300 shadow-sm';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 shadow-sm';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 shadow-sm';
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
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/50 p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Team Members</h2>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-6 font-medium">Loading team members...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEmployees.map((employee) => (
                  <div 
                    key={employee.id} 
                    onClick={() => {
                      setEditingEmployee(employee);
                      setFormData({
                        full_name: employee.full_name || "",
                        employee_number: employee.employee_number || "",
                        email: employee.email || "",
                        contact_number: employee.contact_number || "",
                        availability_days: employee.availability_days || [],
                        expertise: employee.expertise || [],
                        services: employee.services || [],  // NEW field
                        profile_picture: employee.profile_picture || "",
                        start_date: employee.start_date || "",
                        status: employee.status || "Active"
                      });
                      setShowEditForm(true);
                    }}
                    className="bg-white rounded-3xl shadow-sm border border-gray-200/50 p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden shadow-inner mb-4 group-hover:shadow-md transition-shadow duration-300">
                        {employee.profile_picture ? (
                          <img 
                            src={employee.profile_picture} 
                            alt={employee.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={getConsistentPlaceholder(employee.id)} 
                            alt={employee.full_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">{employee.full_name}</h3>
                      <p className="text-sm text-gray-600 font-medium mb-3">#{employee.employee_number}</p>
                      <span className={`inline-flex px-4 py-2 text-xs font-semibold rounded-full border ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-center space-x-3 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700 font-medium truncate">{employee.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{employee.contact_number || 'No phone'}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-gray-700 font-medium text-center">
                          {employee.availability_days.length > 0 ? `${employee.availability_days.length} days` : 'No availability'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Services</p>
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {employee.services && employee.services.slice(0, 2).map((service) => (
                          <span key={service} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                            {service}
                          </span>
                        ))}
                        {employee.services && employee.services.length > 2 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full border border-gray-200">
                            +{employee.services.length - 2} more services
                          </span>
                        )}
                      </div>
                      
                      {employee.expertise && employee.expertise.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Expertise</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {employee.expertise.slice(0, 2).map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-200">
                                {skill}
                              </span>
                            ))}
                            {employee.expertise.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                +{employee.expertise.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="text-center text-xs text-gray-500">
                        Click to view details
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredEmployees.length === 0 && !loading && (
              <div className="text-center py-20">
                <User className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No team members found
                </h3>
                <p className="text-gray-600 font-medium text-lg">
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
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowAddForm(false);
                  resetForm();
                }
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Team Member</h3>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Employee Number *
                      </label>
                      <input
                        type="text"
                        value={formData.employee_number}
                        onChange={(e) => setFormData(prev => ({...prev, employee_number: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="e.g., EMP001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="employee@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData(prev => ({...prev, contact_number: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Availability Days
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 text-sm rounded-xl border transition-all duration-200 ${
                            formData.availability_days.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Services
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto mb-6">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.name)}
                          className={`px-4 py-3 text-sm rounded-xl border transition-all duration-200 text-left ${
                            formData.services.includes(service.name)
                              ? 'bg-green-600 text-white border-green-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                    
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Expertise Categories (Optional)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {expertiseCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleExpertise(category)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 text-left ${
                            formData.expertise.includes(category)
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Profile Picture
                    </label>
                    
                    {/* Toggle between URL and Upload */}
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setPictureUploadMode('url')}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                          pictureUploadMode === 'url'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setPictureUploadMode('upload')}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                          pictureUploadMode === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Upload
                      </button>
                    </div>

                    {pictureUploadMode === 'url' ? (
                      <input
                        type="url"
                        value={formData.profile_picture}
                        onChange={(e) => setFormData(prev => ({...prev, profile_picture: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="https://example.com/photo.jpg"
                      />
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        />
                        {uploadedPicture && (
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                              <img
                                src={uploadedPicture}
                                alt="Uploaded preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-600">Image uploaded successfully</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 border-t border-gray-100 flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEmployee}
                    disabled={loading}
                    className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {loading ? 'Creating...' : 'Create Team Member'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Employee Details Modal */}
          {showEditForm && editingEmployee && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setShowEditForm(false);
                  setEditingEmployee(null);
                  resetForm();
                }
              }}
            >
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {editingEmployee.profile_picture ? (
                          <img 
                            src={editingEmployee.profile_picture} 
                            alt={editingEmployee.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={getConsistentPlaceholder(editingEmployee.id)} 
                            alt={editingEmployee.full_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{editingEmployee.full_name}</h3>
                        <p className="text-gray-600 font-medium">#{editingEmployee.employee_number}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingEmployee(null);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Employee Number
                      </label>
                      <input
                        type="text"
                        value={formData.employee_number}
                        onChange={(e) => setFormData(prev => ({...prev, employee_number: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="e.g., EMP001"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="employee@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={formData.contact_number}
                        onChange={(e) => setFormData(prev => ({...prev, contact_number: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Availability Days
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 text-sm rounded-xl border transition-all duration-200 ${
                            formData.availability_days.includes(day)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Services
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-40 overflow-y-auto mb-6">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.name)}
                          className={`px-4 py-3 text-sm rounded-xl border transition-all duration-200 text-left ${
                            formData.services.includes(service.name)
                              ? 'bg-green-600 text-white border-green-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {service.name}
                        </button>
                      ))}
                    </div>
                    
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      Expertise Categories (Optional)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {expertiseCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => toggleExpertise(category)}
                          className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 text-left ${
                            formData.expertise.includes(category)
                              ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Profile Picture
                    </label>
                    
                    {/* Toggle between URL and Upload */}
                    <div className="flex items-center space-x-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setPictureUploadMode('url')}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                          pictureUploadMode === 'url'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setPictureUploadMode('upload')}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                          pictureUploadMode === 'upload'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Upload
                      </button>
                    </div>

                    {pictureUploadMode === 'url' ? (
                      <input
                        type="url"
                        value={formData.profile_picture}
                        onChange={(e) => setFormData(prev => ({...prev, profile_picture: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        placeholder="https://example.com/photo.jpg"
                      />
                    ) : (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all duration-200"
                        />
                        {uploadedPicture && (
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                              <img
                                src={uploadedPicture}
                                alt="Uploaded preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-gray-600">Image uploaded successfully</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowEditForm(false);
                        setEditingEmployee(null);
                        resetForm();
                      }}
                      className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateEmployee}
                      disabled={loading}
                      className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  
                  {/* Hidden Delete Options */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this team member? This action cannot be undone.')) {
                          if (editingEmployee) {
                            handleDeleteEmployee(editingEmployee.id);
                            setShowEditForm(false);
                            setEditingEmployee(null);
                            resetForm();
                          }
                        }
                      }}
                      className="px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200"
                    >
                      Delete Member
                    </button>
                  </div>
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