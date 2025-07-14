import { Phone, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface VoiceCall {
  id: number;
  client: string;
  duration: string;
  time: string;
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  highlights: string[];
}

interface VoiceCallCardProps {
  call: VoiceCall;
  darkMode: boolean;
  onClick?: () => void;
}

export default function VoiceCallCard({
  call,
  darkMode,
  onClick,
}: VoiceCallCardProps) {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <TrendingUp
            className="w-3 h-3 sm:w-4 sm:h-4 text-green-500"
            data-oid="u1t8f2h"
          />
        );
      case "negative":
        return (
          <TrendingDown
            className="w-3 h-3 sm:w-4 sm:h-4 text-red-500"
            data-oid="_3c0qbq"
          />
        );
      default:
        return (
          <Minus
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500"
            data-oid="bh3q89j"
          />
        );
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "negative":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <div
      className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer rounded-lg group"
      onClick={onClick}
      data-oid="w3te9ts"
    >
      <div className="flex items-start justify-between mb-2" data-oid="dh2uxm2">
        <div
          className="flex items-center space-x-1 sm:space-x-2 min-w-0 flex-1"
          data-oid="vnz62-1"
        >
          <Phone
            className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0"
            data-oid="vdw2yjk"
          />
          <span
            className={`font-medium text-sm sm:text-base truncate ${darkMode ? "text-white" : "text-gray-900"}`}
            data-oid="w6ys__:"
          >
            {call.client}
          </span>
          <div
            className={`flex items-center space-x-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs ${getSentimentColor(call.sentiment)}`}
            data-oid="2wu.oa_"
          >
            {getSentimentIcon(call.sentiment)}
            <span className="hidden sm:inline font-medium" data-oid="ma8zkx4">
              {call.sentiment}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-2" data-oid="ritavur">
          <span
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            data-oid="-t4wjsy"
          >
            {call.duration}
          </span>
          <div
            className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            data-oid="8oz9q1i"
          >
            {call.time}
          </div>
        </div>
      </div>

      <p
        className={`text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        data-oid="n53y31z"
      >
        {call.summary}
      </p>

      <div className="flex flex-wrap gap-1" data-oid="2rar.wi">
        {call.highlights.slice(0, 3).map((highlight, index) => (
          <span
            key={index}
            className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full transition-colors hover:scale-105 ${
              darkMode
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            data-oid="bhpjkd6"
          >
            {highlight}
          </span>
        ))}
        {call.highlights.length > 3 && (
          <span
            className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${
              darkMode
                ? "bg-purple-900 text-purple-300"
                : "bg-purple-100 text-purple-700"
            }`}
            data-oid="d-7txno"
          >
            +{call.highlights.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}
