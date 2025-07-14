"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      }`}
      data-oid="zmfe0pr"
    >
      <Sidebar darkMode={darkMode} data-oid="8yh-p5b" />
      <main className="lg:ml-0" data-oid="73:wh6a">
        {children}
      </main>
    </div>
  );
}
