import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  darkMode: boolean;
  onClick?: () => void;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  iconColor,
  darkMode,
  onClick,
}: KPICardProps) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md card-hover cursor-pointer group ${
        darkMode
          ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
          : "bg-white border-purple-100 hover:bg-gray-50"
      }`}
      onClick={onClick}
      data-oid="-sy0axd"
    >
      <div className="flex items-center justify-between" data-oid="zgb3sm.">
        <div className="min-w-0 flex-1" data-oid=":s18fl5">
          <p
            className={`text-xs sm:text-sm font-medium truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            data-oid="irkwldh"
          >
            {title}
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}
            data-oid="fgb:jv9"
          >
            {value}
          </p>
        </div>
        <Icon
          className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColor} transition-transform group-hover:scale-110`}
          data-oid=":6k3uws"
        />
      </div>
    </div>
  );
}
