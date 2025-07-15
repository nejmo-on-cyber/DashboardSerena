"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Calendar,
  Users,
  TrendingUp,
  Search,
  Filter,
  Phone,
  Star,
  Clock,
  DollarSign,
  UserCheck,
  AlertTriangle,
  Plus,
  Settings,
  Moon,
  Sun,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import ConversationCard from "@/components/ConversationCard";
import AvailabilitySlot from "@/components/AvailabilitySlot";
import VoiceCallCard from "@/components/VoiceCallCard";

export default function Dashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in real app this would come from APIs
  const conversations = [
    {
      id: 1,
      client: "Sarah Johnson",
      lastMessage:
        "Hi, I need to reschedule my appointment for tomorrow. Can we move it to Friday afternoon?",
      time: "2 min ago",
      status: "pending" as const,
      unread: 2,
      tag: "VIP",
    },
    {
      id: 2,
      client: "Mike Chen",
      lastMessage:
        "Thank you for the reminder! See you at 3pm. Should I bring anything specific?",
      time: "15 min ago",
      status: "replied" as const,
      unread: 0,
      tag: "Regular",
    },
    {
      id: 3,
      client: "Emma Davis",
      lastMessage:
        "What services do you offer for hair coloring? I'm looking for highlights.",
      time: "1 hour ago",
      status: "new" as const,
      unread: 1,
      tag: "New Client",
    },
    {
      id: 4,
      client: "James Wilson",
      lastMessage:
        "Can I get a quote for a full spa package for my wedding party?",
      time: "2 hours ago",
      status: "new" as const,
      unread: 1,
      tag: "VIP",
    },
  ];

  const kpis = [
    {
      title: "This Week",
      value: 47,
      icon: Calendar,
      color: "text-purple-400",
      onClick: () => router.push("/booking-admin"),
    },
    {
      title: "This Month",
      value: 189,
      icon: TrendingUp,
      color: "text-green-400",
      onClick: () => router.push("/analytics"),
    },
    {
      title: "Revenue",
      value: "$12,450",
      icon: DollarSign,
      color: "text-green-400",
      onClick: () => router.push("/revenue"),
    },
    {
      title: "No-show Rate",
      value: "8.5%",
      icon: AlertTriangle,
      color: "text-orange-400",
      onClick: () => router.push("/analytics"),
    },
    {
      title: "Rebooking %",
      value: "73%",
      icon: UserCheck,
      color: "text-blue-400",
      onClick: () => router.push("/clients"),
    },
    {
      title: "Top Promo",
      value: "SPRING20",
      icon: Star,
      color: "text-yellow-400",
      onClick: () => router.push("/promotions"),
    },
  ];

  const availableSlots = [
    { time: "9:00 AM", staff: "Available", type: "open" as const },
    { time: "10:30 AM", staff: "Jessica", type: "booked" as const },
    { time: "12:00 PM", staff: "Available", type: "open" as const },
    { time: "2:30 PM", staff: "Maria", type: "booked" as const },
    { time: "4:00 PM", staff: "Available", type: "open" as const },
    { time: "5:30 PM", staff: "Available", type: "open" as const },
  ];

  const clients = [
    {
      name: "Sarah Johnson",
      lastVisit: "2024-01-15",
      preferredService: "Hair Cut & Color",
      phone: "+1 (555) 123-4567",
      tags: ["VIP", "Regular"],
      rebookingSuggestion: "Due for color touch-up",
    },
    {
      name: "Mike Chen",
      lastVisit: "2024-01-10",
      preferredService: "Beard Trim",
      phone: "+1 (555) 987-6543",
      tags: ["Regular"],
      rebookingSuggestion: "Monthly trim due",
    },
    {
      name: "Emma Davis",
      lastVisit: "2024-01-08",
      preferredService: "Facial Treatment",
      phone: "+1 (555) 456-7890",
      tags: ["New Client"],
      rebookingSuggestion: "Follow-up treatment recommended",
    },
  ];

  const voiceCalls = [
    {
      id: 1,
      client: "Anna Wilson",
      duration: "3:45",
      time: "1 hour ago",
      summary:
        "Booking inquiry for wedding package. Interested in full bridal party services.",
      sentiment: "positive" as const,
      highlights: [
        "Wedding package interest",
        "Booking made for March 15",
        "Bridal party of 6",
      ],
    },
    {
      id: 2,
      client: "Robert Kim",
      duration: "2:12",
      time: "3 hours ago",
      summary:
        "Complaint about service quality during last visit. Requesting refund.",
      sentiment: "negative" as const,
      highlights: [
        "Service complaint",
        "Refund requested",
        "Follow-up scheduled",
      ],
    },
    {
      id: 3,
      client: "Lisa Martinez",
      duration: "1:30",
      time: "5 hours ago",
      summary: "General inquiry about available services and pricing.",
      sentiment: "neutral" as const,
      highlights: [
        "Service inquiry",
        "Pricing questions",
        "Callback requested",
      ],
    },
  ];

  const filteredConversations = conversations.filter((conv) => {
    const matchesFilter =
      activeFilter === "all" || conv.status === activeFilter;
    const matchesSearch =
      conv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConversationClick = (conversationId: number) => {
    router.push(`/conversations?id=${conversationId}`);
  };

  const handleVoiceCallClick = (callId: number) => {
    router.push(`/voice-calls?id=${callId}`);
  };

  const handleAvailabilitySlotClick = (time: string) => {
    router.push(`/availability?time=${encodeURIComponent(time)}`);
  };

  const handleClientRebookingClick = (clientName: string) => {
    router.push(`/clients?client=${encodeURIComponent(clientName)}`);
  };

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-serena-dark"
          : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
      }`}
      data-oid="ib0unw7"
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} data-oid="zs9u3uk" />

      {/* Main Content */}
      <div className="lg:ml-64" data-oid="v.qdjgn">
        {/* Header */}
        <header
          className={`border-b transition-all duration-300 backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-purple-100"
          }`}
          data-oid="sem2d03"
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-oid="as4jxwu"
          >
            <div
              className="flex justify-between items-center h-16"
              data-oid="fkfyxaz"
            >
              <div
                className="flex items-center space-x-4 lg:ml-0 ml-12"
                data-oid="3u2zb0w"
              >
                <div className="flex items-center space-x-3" data-oid="5k8e3h5">
                  <div data-oid="petsixp">
                    <h1
                      className={`text-xl font-bold gradient-text`}
                      data-oid="9lhbbg."
                    >
                      Dashboard Overview
                    </h1>
                    <p
                      className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                      data-oid="jfw9awy"
                    >
                      Welcome back! Here's what's happening today.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4" data-oid="-swg_u9">
                <div className="flex items-center space-x-2" data-oid="44vxe-_">
                  <div
                    className="w-2 h-2 bg-green-400 rounded-full animate-pulse status-online"
                    data-oid="qelw1so"
                  ></div>
                  <span
                    className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="h6u.v_i"
                  >
                    Online
                  </span>
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 focus-ring ${
                    darkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                  data-oid="s641g.0"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" data-oid="nmwzy4t" />
                  ) : (
                    <Moon className="w-5 h-5" data-oid="80j8bu4" />
                  )}
                </button>

                <div
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 shadow-lg cursor-pointer hover:scale-105 transition-transform"
                  data-oid="1slila0"
                ></div>
              </div>
            </div>
          </div>
        </header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          data-oid="fx8a.l-"
        >
          {/* KPI Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
            data-oid="0qwv1v1"
          >
            {kpis.map((kpi, index) => (
              <div
                key={index}
                onClick={kpi.onClick}
                className="cursor-pointer"
                data-oid="qa46.g6"
              >
                <KPICard
                  title={kpi.title}
                  value={kpi.value}
                  icon={kpi.icon}
                  iconColor={kpi.color}
                  darkMode={darkMode}
                  data-oid="gt8e6ug"
                />
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            data-oid="565c_:9"
          >
            {/* Live WhatsApp Conversations */}
            <div className="lg:col-span-2" data-oid="w5juq:o">
              <div
                className={`rounded-xl shadow-sm border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-purple-100"
                }`}
                data-oid="z08oxq1"
              >
                <div
                  className="p-6 border-b border-gray-200 dark:border-gray-700"
                  data-oid="qml:axp"
                >
                  <div
                    className="flex items-center justify-between mb-4"
                    data-oid="5jqqiks"
                  >
                    <div
                      className="flex items-center space-x-3"
                      data-oid="mw67c6."
                    >
                      <h2
                        className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="8_squsd"
                      >
                        Live WhatsApp Conversations
                      </h2>
                      <button
                        onClick={() => router.push("/conversations")}
                        className={`p-1 rounded-lg transition-colors hover:scale-105 ${
                          darkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        data-oid="-p3h9_1"
                      >
                        <ExternalLink className="w-4 h-4" data-oid="chy.aww" />
                      </button>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-oid="ksxxh2p"
                    >
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-pulse status-online"
                        data-oid="-tz_xyc"
                      ></div>
                      <span
                        className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        data-oid="kasji8h"
                      >
                        {filteredConversations.length} active
                      </span>
                    </div>
                  </div>

                  {/* Search and Filter */}
                  <div
                    className="flex flex-col sm:flex-row gap-4"
                    data-oid=":mtywad"
                  >
                    <div className="relative flex-1" data-oid="519htd7">
                      <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                        data-oid=":h8vof_"
                      />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-all duration-200 focus-ring ${
                          darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                        }`}
                        data-oid="gxak6um"
                      />
                    </div>

                    <div className="flex space-x-2" data-oid="wog:a5c">
                      {["all", "new", "pending", "replied"].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                            activeFilter === filter
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 shadow-sm"
                              : darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          data-oid="_u.lcy6"
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto"
                  data-oid="v6wdh8c"
                >
                  {filteredConversations.slice(0, 4).map((conversation) => (
                    <ConversationCard
                      key={conversation.id}
                      conversation={conversation}
                      darkMode={darkMode}
                      onClick={() => handleConversationClick(conversation.id)}
                      data-oid=":j.m8my"
                    />
                  ))}
                </div>

                {filteredConversations.length > 4 && (
                  <div
                    className="p-4 border-t border-gray-200 dark:border-gray-700"
                    data-oid="4gp3ost"
                  >
                    <button
                      onClick={() => router.push("/conversations")}
                      className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                        darkMode
                          ? "text-purple-400 hover:bg-gray-700"
                          : "text-purple-600 hover:bg-purple-50"
                      }`}
                      data-oid="7pfnn8r"
                    >
                      <span data-oid="392ig:z">View All Conversations</span>
                      <ArrowRight className="w-4 h-4" data-oid="8ngqd1g" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6" data-oid="z.ol9v7">
              {/* Availability Management */}
              <div
                className={`rounded-xl shadow-sm border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-purple-100"
                }`}
                data-oid="qeownkq"
              >
                <div
                  className="p-6 border-b border-gray-200 dark:border-gray-700"
                  data-oid="xhtnvub"
                >
                  <div
                    className="flex items-center justify-between"
                    data-oid="pjoh8cx"
                  >
                    <div
                      className="flex items-center space-x-3"
                      data-oid="u-gn7h_"
                    >
                      <h2
                        className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="-jilfpk"
                      >
                        Today's Availability
                      </h2>
                      <button
                        onClick={() => router.push("/availability")}
                        className={`p-1 rounded-lg transition-colors hover:scale-105 ${
                          darkMode
                            ? "text-gray-400 hover:text-gray-300"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                        data-oid="6:rl1ma"
                      >
                        <ExternalLink className="w-4 h-4" data-oid="k_d71wt" />
                      </button>
                    </div>
                    <button
                      onClick={() => router.push("/availability")}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition-all duration-200 hover:scale-105 focus-ring"
                      data-oid="nzxd9l4"
                    >
                      <Plus className="w-4 h-4" data-oid="cf82j8g" />
                    </button>
                  </div>
                </div>

                <div
                  className="p-4 space-y-3 max-h-64 overflow-y-auto"
                  data-oid="5cy4nty"
                >
                  {availableSlots.slice(0, 5).map((slot, index) => (
                    <AvailabilitySlot
                      key={index}
                      time={slot.time}
                      staff={slot.staff}
                      type={slot.type}
                      darkMode={darkMode}
                      onEdit={() => handleAvailabilitySlotClick(slot.time)}
                      data-oid="fnxugz:"
                    />
                  ))}
                </div>

                <div
                  className="p-4 border-t border-gray-200 dark:border-gray-700"
                  data-oid="ukazzyy"
                >
                  <button
                    onClick={() => router.push("/availability")}
                    className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "text-purple-400 hover:bg-gray-700"
                        : "text-purple-600 hover:bg-purple-50"
                    }`}
                    data-oid="kd9v569"
                  >
                    <span data-oid="iwfb-9-">Manage All Slots</span>
                    <ArrowRight className="w-4 h-4" data-oid="vm9i4js" />
                  </button>
                </div>
              </div>

              {/* Voice Call Summaries */}
              <div
                className={`rounded-xl shadow-sm border transition-all duration-300 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-purple-100"
                }`}
                data-oid="gxl.z_3"
              >
                <div
                  className="p-6 border-b border-gray-200 dark:border-gray-700"
                  data-oid="hpq5jql"
                >
                  <div
                    className="flex items-center space-x-3"
                    data-oid="r4nqiqn"
                  >
                    <h2
                      className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                      data-oid="-t4wge0"
                    >
                      Recent Voice Calls
                    </h2>
                    <button
                      onClick={() => router.push("/voice-calls")}
                      className={`p-1 rounded-lg transition-colors hover:scale-105 ${
                        darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      data-oid=".c-zrbf"
                    >
                      <ExternalLink className="w-4 h-4" data-oid="u3r-che" />
                    </button>
                  </div>
                </div>

                <div
                  className="divide-y divide-gray-200 dark:divide-gray-700 max-h-80 overflow-y-auto"
                  data-oid="9n-28l-"
                >
                  {voiceCalls.slice(0, 3).map((call) => (
                    <VoiceCallCard
                      key={call.id}
                      call={call}
                      darkMode={darkMode}
                      onClick={() => handleVoiceCallClick(call.id)}
                      data-oid="-g6irw9"
                    />
                  ))}
                </div>

                <div
                  className="p-4 border-t border-gray-200 dark:border-gray-700"
                  data-oid="pac_gv9"
                >
                  <button
                    onClick={() => router.push("/voice-calls")}
                    className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "text-purple-400 hover:bg-gray-700"
                        : "text-purple-600 hover:bg-purple-50"
                    }`}
                    data-oid="fqe52tx"
                  >
                    <span data-oid="j326dbi">View All Calls</span>
                    <ArrowRight className="w-4 h-4" data-oid="96tavm8" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Client Insights Table */}
          <div
            className={`mt-8 rounded-xl shadow-sm border transition-all duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid="yl.tz87"
          >
            <div
              className="p-6 border-b border-gray-200 dark:border-gray-700"
              data-oid="upbzj1s"
            >
              <div
                className="flex items-center justify-between"
                data-oid="tckzehd"
              >
                <div className="flex items-center space-x-3" data-oid="7w4t0i2">
                  <h2
                    className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="dj2p5qx"
                  >
                    Client Insights
                  </h2>
                  <button
                    onClick={() => router.push("/clients")}
                    className={`p-1 rounded-lg transition-colors hover:scale-105 ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    data-oid="259-f62"
                  >
                    <ExternalLink className="w-4 h-4" data-oid="16zngs-" />
                  </button>
                </div>
                <button
                  onClick={() => router.push("/clients")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 focus-ring ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  data-oid="ahtfug1"
                >
                  View All Clients
                </button>
              </div>
            </div>

            <div className="overflow-x-auto" data-oid="qrn1bxt">
              <table className="w-full" data-oid="on.nxf1">
                <thead
                  className={`${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  data-oid="evaanln"
                >
                  <tr data-oid="gnxxl4f">
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                      data-oid="kckfwsw"
                    >
                      Client
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                      data-oid=":3f8v-e"
                    >
                      Last Visit
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                      data-oid="szv1b3h"
                    >
                      Preferred Service
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                      data-oid="e71cge7"
                    >
                      Tags
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                      data-oid="q5hly3x"
                    >
                      Rebooking Suggestion
                    </th>
                  </tr>
                </thead>
                <tbody
                  className="divide-y divide-gray-200 dark:divide-gray-700"
                  data-oid=":p2q6.o"
                >
                  {clients.map((client, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/clients?client=${encodeURIComponent(client.name)}`,
                        )
                      }
                      data-oid="n2mhdus"
                    >
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="flxi8bo"
                      >
                        <div className="flex items-center" data-oid="t8mr9_y">
                          <div
                            className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
                            data-oid="viken00"
                          >
                            {client.name.charAt(0)}
                          </div>
                          <div className="ml-3" data-oid="50ql6ju">
                            <div
                              className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                              data-oid="3t9z_x."
                            >
                              {client.name}
                            </div>
                            <div
                              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              data-oid="i6kjcf:"
                            >
                              {client.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                        data-oid="1-le8q6"
                      >
                        {client.lastVisit}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                        data-oid="o_k-w-0"
                      >
                        {client.preferredService}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap"
                        data-oid="f1t6j1b"
                      >
                        <div className="flex space-x-1" data-oid="0-sdpyi">
                          {client.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className={`px-2 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 ${
                                tag === "VIP"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                              data-oid="d24hqnt"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}
                        data-oid=":jun4n6"
                      >
                        <div
                          className="flex items-center justify-between"
                          data-oid="cpao29f"
                        >
                          <span data-oid="hwzng5p">
                            {client.rebookingSuggestion}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClientRebookingClick(client.name);
                            }}
                            className="text-purple-600 hover:text-purple-800 transition-colors hover:scale-110"
                            data-oid="38-x_zf"
                          >
                            <MessageCircle
                              className="w-4 h-4"
                              data-oid="tjnh7.:"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
