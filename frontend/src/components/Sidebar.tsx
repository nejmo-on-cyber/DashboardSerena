"use client";

import { useState } from "react";
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

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors ${
          darkMode
            ? "bg-gray-800 text-white hover:bg-gray-700"
            : "bg-white text-gray-900 hover:bg-gray-100"
        } shadow-lg`}
        data-oid="-uamcso"
      >
        <Menu className="w-5 h-5" data-oid="6w25tjq" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
          data-oid="qi7hvmz"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}
        border-r shadow-lg
      `}
        data-oid="-zqyh01"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          data-oid="p1tq99."
        >
          {!isCollapsed && (
            <div className="flex items-center space-x-3" data-oid="7-vmv.l">
              <div
                className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center"
                data-oid=":gne6vx"
              >
                <MessageCircle
                  className="w-5 h-5 text-white"
                  data-oid="2btzbn4"
                />
              </div>
              <div data-oid="w:66ow5">
                <h1
                  className={`font-bold text-lg gradient-text`}
                  data-oid="0k6q-y:"
                >
                  Serena
                </h1>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                  data-oid="8em25ms"
                >
                  AI Assistant
                </p>
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            data-oid="q1lc4uz"
          >
            <X className="w-5 h-5" data-oid="qts8iex" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:block p-1 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
            data-oid="xd9bjev"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" data-oid="so8070r" />
            ) : (
              <ChevronLeft className="w-4 h-4" data-oid="_8so6mo" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2" data-oid="75tm_.g">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                  ${
                    active
                      ? darkMode
                        ? "bg-purple-900 text-purple-300 border border-purple-800"
                        : "bg-purple-100 text-purple-700 border border-purple-200"
                      : darkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }
                  ${isCollapsed ? "justify-center" : ""}
                `}
                title={isCollapsed ? item.name : undefined}
                data-oid="kjhloha"
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${active ? "animate-pulse" : ""}`}
                  data-oid="_o8xykw"
                />

                {!isCollapsed && (
                  <span className="font-medium truncate" data-oid="kdb7d.l">
                    {item.name}
                  </span>
                )}
                {!isCollapsed && active && (
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full ml-auto animate-pulse"
                    data-oid="tfvskn7"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="p-4 border-t border-gray-200 dark:border-gray-700"
          data-oid="xtf_c3k"
        >
          {!isCollapsed && (
            <div
              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"} space-y-1`}
              data-oid="f0di64d"
            >
              <div className="flex items-center space-x-2" data-oid="aawla94">
                <div
                  className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                  data-oid="l.csb94"
                />
                <span data-oid="pmaqbdf">Online</span>
              </div>
              <div data-oid="_txdoie">Version 1.0.0</div>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center" data-oid="b5b2e49">
              <div
                className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
                data-oid="ei.x34o"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main content spacer */}
      <div
        className={`hidden lg:block transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
        data-oid="7uwmzj2"
      />
    </>
  );
}
