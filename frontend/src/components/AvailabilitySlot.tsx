import { Clock, User } from "lucide-react";

interface AvailabilitySlotProps {
  time: string;
  staff: string;
  type: "open" | "booked";
  darkMode: boolean;
  onEdit?: () => void;
}

export default function AvailabilitySlot({
  time,
  staff,
  type,
  darkMode,
  onEdit,
}: AvailabilitySlotProps) {
  return (
    <div
      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 group ${
        type === "open"
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
          : "bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
      }`}
      onClick={onEdit}
      data-oid="3:kq_m0"
    >
      <div
        className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1"
        data-oid="c14.f38"
      >
        <Clock
          className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${
            type === "open"
              ? "text-green-600 dark:text-green-400"
              : "text-gray-400"
          }`}
          data-oid="8lgv2bp"
        />

        <span
          className={`font-medium text-sm sm:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}
          data-oid="i39lwj3"
        >
          {time}
        </span>
      </div>

      <div
        className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
        data-oid="rz82zp1"
      >
        {type === "booked" && (
          <User
            className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400"
            data-oid="s4w2m17"
          />
        )}
        <span
          className={`text-xs sm:text-sm truncate max-w-20 sm:max-w-none ${
            type === "open"
              ? "text-green-600 dark:text-green-400 font-medium"
              : darkMode
                ? "text-gray-400"
                : "text-gray-600"
          }`}
          data-oid="k7q4k1i"
        >
          {staff}
        </span>
      </div>
    </div>
  );
}
