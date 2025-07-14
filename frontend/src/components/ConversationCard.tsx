interface Conversation {
  id: number;
  client: string;
  lastMessage: string;
  time: string;
  status: "new" | "pending" | "replied";
  unread: number;
  tag: string;
}

interface ConversationCardProps {
  conversation: Conversation;
  darkMode: boolean;
  onClick?: () => void;
}

export default function ConversationCard({
  conversation,
  darkMode,
  onClick,
}: ConversationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-400";
      case "pending":
        return "bg-yellow-400";
      case "replied":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "VIP":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "New Client":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div
      className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer border-l-4 border-transparent hover:border-purple-400 group"
      onClick={onClick}
      data-oid="0.t0f6n"
    >
      <div className="flex items-start justify-between" data-oid="kl12cql">
        <div
          className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1"
          data-oid="qrpk-1e"
        >
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 transition-transform group-hover:scale-105"
            data-oid="boh8n.m"
          >
            {conversation.client.charAt(0)}
          </div>
          <div className="flex-1 min-w-0" data-oid=".lhr1ic">
            <div
              className="flex items-center space-x-2 mb-1"
              data-oid="hbgc8j8"
            >
              <h3
                className={`font-medium truncate text-sm sm:text-base ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="blw8v.8"
              >
                {conversation.client}
              </h3>
              <span
                className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full flex-shrink-0 ${getTagColor(conversation.tag)}`}
                data-oid=":dion3l"
              >
                {conversation.tag}
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-1 line-clamp-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
              data-oid="1ew4gjz"
            >
              {conversation.lastMessage}
            </p>
            <p
              className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-500"}`}
              data-oid="1y2fwul"
            >
              {conversation.time}
            </p>
          </div>
        </div>

        <div
          className="flex items-center space-x-2 flex-shrink-0 ml-2"
          data-oid="xcryl0j"
        >
          {conversation.unread > 0 && (
            <span
              className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse"
              data-oid="ddy:ge."
            >
              {conversation.unread}
            </span>
          )}
          <div
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getStatusColor(conversation.status)}`}
            data-oid="p8cdd8_"
          ></div>
        </div>
      </div>
    </div>
  );
}
