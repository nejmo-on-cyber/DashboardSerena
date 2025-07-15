"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageCircle,
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
  UserPlus,
} from "lucide-react";

interface SidebarProps {
  darkMode: boolean;
}

export default function Sidebar({ darkMode }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Conversations", href: "/conversations", icon: MessageCircle },
    { name: "Clients", href: "/clients", icon: Users },
    { name: "Calendar", href: "/calendar", icon: CalendarDays },
    { name: "Booking Admin", href: "/booking-admin", icon: Clock },
    { name: "Employees", href: "/employees", icon: UserPlus },
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
    </>
  );
}
