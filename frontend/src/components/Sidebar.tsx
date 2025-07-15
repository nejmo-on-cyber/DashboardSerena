"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageCircle,
  Calendar,
  Users,
  Phone,
  BarChart3,
  DollarSign,
  Tag,
  Settings,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Plus,
  Edit,
  UserPlus,
} from "lucide-react";
import EmployeeManagement from "./EmployeeManagement";

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

interface SidebarProps {
  darkMode: boolean;
}

const placeholderImages = [
  "https://images.unsplash.com/photo-1494790108755-2616b5e7c8b0?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face"
];

export default function Sidebar({ darkMode }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showEmployeeManagement, setShowEmployeeManagement] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Conversations", href: "/conversations", icon: MessageCircle },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Booking Admin", href: "/booking-admin", icon: Clock },
    { name: "Availability", href: "/availability", icon: Calendar },
    { name: "Voice Calls", href: "/voice-calls", icon: Phone },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Revenue", href: "/revenue", icon: DollarSign },
    { name: "Promotions", href: "/promotions", icon: Tag },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employee-availability');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getRandomPlaceholder = () => {
    return placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        } ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="font-semibold text-gray-900">Serena</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive(item.href)
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm">{item.name}</span>}
                </button>
              );
            })}
          </nav>

          {/* Employee Section */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              {!isCollapsed && (
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Team Members
                </h3>
              )}
              <button
                onClick={() => setShowEmployeeManagement(true)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                title="Manage Employees"
              >
                {isCollapsed ? <UserPlus className="w-5 h-5" /> : <Settings className="w-4 h-4" />}
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {employees.slice(0, 6).map((employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEmployeeManagement(true);
                    }}
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
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
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.full_name}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(employee.status)}`}>
                            {employee.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            #{employee.employee_number}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {employees.length > 6 && !isCollapsed && (
                  <button
                    onClick={() => setShowEmployeeManagement(true)}
                    className="w-full text-left px-2 py-1 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    +{employees.length - 6} more employees
                  </button>
                )}
              </div>
            )}

            {/* Add Employee Button */}
            {!isCollapsed && (
              <button
                onClick={() => setShowEmployeeManagement(true)}
                className="w-full mt-3 flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {!isCollapsed && <span>Online</span>}
            </div>
            {!isCollapsed && (
              <div className="text-xs text-gray-400 mt-1">Version 1.0.0</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Employee Management Modal */}
      <EmployeeManagement
        isOpen={showEmployeeManagement}
        onClose={() => {
          setShowEmployeeManagement(false);
          setSelectedEmployee(null);
        }}
        selectedEmployee={selectedEmployee}
        onEmployeeUpdate={fetchEmployees}
      />
    </>
  );
}
