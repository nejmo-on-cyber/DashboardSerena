"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Star,
  Tag,
  MoreVertical,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClients } from "@/hooks/useAirtable";
import Sidebar from "@/components/Sidebar";

export default function ClientsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const { clients, loading, error, createClient } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    preferredService: "",
    tags: [] as string[],
    notes: "",
  });

  const tags = ["all", "VIP", "Regular", "New Client", "No-show Risk"];

  // Safe filtering with null checks
  const filteredClients = (clients || []).filter((client) => {
    if (!client) return false;

    const matchesSearch =
      (client.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone || "").includes(searchQuery);

    const matchesTag =
      filterTag === "all" || (client.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "lastVisit":
        return (
          new Date(b.lastVisit || 0).getTime() -
          new Date(a.lastVisit || 0).getTime()
        );

      case "totalSpent":
        return (b.totalSpent || 0) - (a.totalSpent || 0);
      default:
        return 0;
    }
  });

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "VIP":
        return darkMode
          ? "bg-yellow-900 text-yellow-300"
          : "bg-yellow-100 text-yellow-800";
      case "Regular":
        return darkMode
          ? "bg-blue-900 text-blue-300"
          : "bg-blue-100 text-blue-800";
      case "New Client":
        return darkMode
          ? "bg-green-900 text-green-300"
          : "bg-green-100 text-green-800";
      case "No-show Risk":
        return darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800";
      default:
        return darkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    setIsCreating(true);
    try {
      await createClient({
        ...newClient,
        totalVisits: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
      });
      setNewClient({
        name: "",
        email: "",
        phone: "",
        preferredService: "",
        tags: [],
        notes: "",
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create client:", error);
      alert("Failed to create client. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClientAction = (action: string, clientId: string) => {
    switch (action) {
      case "message":
        router.push(`/conversations?client=${clientId}`);
        break;
      case "call":
        window.open(`tel:${clients.find((c) => c.id === clientId)?.phone}`);
        break;
      case "email":
        window.open(`mailto:${clients.find((c) => c.id === clientId)?.email}`);
        break;
      case "book":
        router.push(`/availability?client=${clientId}`);
        break;
      case "edit":
        // TODO: Implement edit functionality
        alert("Edit functionality coming soon!");
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen transition-all duration-300 ${
          darkMode
            ? "bg-gradient-serena-dark"
            : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
        }`}
        data-oid="r1uxzs8"
      >
        <Sidebar darkMode={darkMode} data-oid="iwjv.26" />
        <div
          className="lg:ml-64 flex items-center justify-center min-h-screen"
          data-oid="_16t80q"
        >
          <div className="text-center" data-oid="wt4z8ck">
            <Loader2
              className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4"
              data-oid="6t_.aff"
            />
            <p
              className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              data-oid="kj7ehgn"
            >
              Loading clients from Airtable...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen transition-all duration-300 ${
          darkMode
            ? "bg-gradient-serena-dark"
            : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
        }`}
        data-oid="hgxkro."
      >
        <Sidebar darkMode={darkMode} data-oid="ewvxrwe" />
        <div
          className="lg:ml-64 flex items-center justify-center min-h-screen"
          data-oid="vxi9cib"
        >
          <div className="text-center" data-oid="3tdv7c3">
            <div
              className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4"
              data-oid="2gnvjhd"
            >
              <span
                className="text-red-600 dark:text-red-400 text-2xl"
                data-oid="lqz9hf:"
              >
                ⚠️
              </span>
            </div>
            <h2
              className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              data-oid="vj0yai7"
            >
              Connection Error
            </h2>
            <p
              className={`mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              data-oid="2r::9_s"
            >
              Failed to connect to Airtable: {error}
            </p>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              data-oid="hyoqepu"
            >
              Please check your Airtable configuration in .env.local
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              data-oid="lx_7xq5"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-serena-dark"
          : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
      }`}
      data-oid="rx7g9pm"
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} data-oid="50zp2ie" />

      {/* Main Content */}
      <div className="lg:ml-64" data-oid="i2aeqdf">
        {/* Header */}
        <header
          className={`border-b transition-all duration-300 backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-purple-100"
          }`}
          data-oid="8124rpi"
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-oid="aearzg6"
          >
            <div
              className="flex items-center justify-between h-16"
              data-oid="::udqh8"
            >
              <div
                className="flex items-center space-x-4 lg:ml-0 ml-12"
                data-oid="dpz9q-g"
              >
                <div data-oid="t5vgejj">
                  <h1
                    className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="_1m0rh-"
                  >
                    Client Management
                  </h1>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="yuatfo6"
                  >
                    Connected to Airtable • {clients?.length || 0} clients
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4" data-oid="k4lvbz_">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                  data-oid=".6jqf37"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" data-oid="tzarswg" />
                  ) : (
                    <Moon className="w-5 h-5" data-oid="i9:f5l8" />
                  )}
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  data-oid=":_0q7ch"
                >
                  <Plus className="w-4 h-4" data-oid="vjp5xi_" />
                  <span data-oid="d5ugfra">Add Client</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          data-oid="qk0ywk6"
        >
          {/* Add Client Form */}
          {showAddForm && (
            <div
              className={`rounded-xl shadow-sm border p-6 mb-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="9hju862"
            >
              <h3
                className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="7c-7:0m"
              >
                Add New Client
              </h3>
              <form
                onSubmit={handleCreateClient}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="0pc5xtt"
              >
                <div data-oid="k:c4s57">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="1-nhoma"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="1m1wfp2"
                  />
                </div>

                <div data-oid="w2w3fy:">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="f4_9-36"
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="9y735:z"
                  />
                </div>

                <div data-oid="xao9rtb">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="k1e_:z-"
                  >
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newClient.phone}
                    onChange={(e) =>
                      setNewClient({ ...newClient, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="kp36vr9"
                  />
                </div>

                <div data-oid="emg86or">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="wu1sw_0"
                  >
                    Preferred Service
                  </label>
                  <input
                    type="text"
                    value={newClient.preferredService}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        preferredService: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="q2w1q0n"
                  />
                </div>

                <div className="md:col-span-2" data-oid="rxeh6y8">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="m-1jhv7"
                  >
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2" data-oid="okzint6">
                    {["VIP", "Regular", "New Client", "No-show Risk"].map(
                      (tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const newTags = newClient.tags.includes(tag)
                              ? newClient.tags.filter((t) => t !== tag)
                              : [...newClient.tags, tag];
                            setNewClient({ ...newClient, tags: newTags });
                          }}
                          className={`px-3 py-1 text-sm rounded-full transition-colors ${
                            newClient.tags.includes(tag)
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                              : darkMode
                                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                          data-oid="6m7lg67"
                        >
                          {tag}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="md:col-span-2" data-oid="5i4js-a">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="dqq1elz"
                  >
                    Notes
                  </label>
                  <textarea
                    value={newClient.notes}
                    onChange={(e) =>
                      setNewClient({ ...newClient, notes: e.target.value })
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="greo0ux"
                  />
                </div>

                <div
                  className="md:col-span-2 flex space-x-3"
                  data-oid="3tjezb9"
                >
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    data-oid="4nm04o2"
                  >
                    {isCreating && (
                      <Loader2
                        className="w-4 h-4 animate-spin"
                        data-oid="9:lub7r"
                      />
                    )}
                    <span data-oid="99y9yfw">
                      {isCreating ? "Creating..." : "Create Client"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    data-oid="mpieu96"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters and Search */}
          <div
            className={`rounded-xl shadow-sm border p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid=".1qjs31"
          >
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
              data-oid="kd39eio"
            >
              <div
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1"
                data-oid="q2o.qn_"
              >
                <div className="relative flex-1 max-w-md" data-oid="muld.30">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    data-oid="s8ho1j."
                  />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="2-9d-17"
                  />
                </div>

                <div className="flex space-x-2" data-oid="04_sf-4">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setFilterTag(tag)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterTag === tag
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-oid="8bd:stv"
                    >
                      {tag === "all" ? "All" : tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4" data-oid="7bcfggj">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-200 text-gray-900"
                  }`}
                  data-oid="_920ku."
                >
                  <option value="name" data-oid="qz:d:7t">
                    Sort by Name
                  </option>
                  <option value="lastVisit" data-oid="v7hv_z-">
                    Sort by Last Visit
                  </option>
                  <option value="totalSpent" data-oid="qs69oh7">
                    Sort by Total Spent
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Client Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-oid="iucf3va"
          >
            {sortedClients.map((client) => (
              <div
                key={client.id}
                className={`rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-purple-100"
                }`}
                data-oid="nvy1txa"
              >
                {/* Card Header */}
                <div
                  className={`p-6 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}
                  data-oid="g1vne_5"
                >
                  <div
                    className="flex items-start justify-between"
                    data-oid="z5ysae-"
                  >
                    <div
                      className="flex items-center space-x-3"
                      data-oid="_c2jo3k"
                    >
                      <div
                        className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium"
                        data-oid="tme6l_t"
                      >
                        {(client.name || "U").charAt(0)}
                      </div>
                      <div data-oid="ykidhhd">
                        <h3
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                          data-oid="1x0o8w:"
                        >
                          {client.name || "Unknown"}
                        </h3>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="5o-wh67"
                        >
                          {client.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleClientAction("edit", client.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        darkMode
                          ? "text-gray-400 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                      data-oid="d9sxq4_"
                    >
                      <MoreVertical className="w-4 h-4" data-oid="g2nt7u7" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3" data-oid="1:9bbtu">
                    {(client.tags || []).map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${getTagColor(tag)}`}
                        data-oid="xjeolx."
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4" data-oid="z8phfrr">
                  <div
                    className="grid grid-cols-2 gap-4 text-sm"
                    data-oid="3mgb5ra"
                  >
                    <div data-oid="blsd4_n">
                      <span
                        className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid=".pzho3n"
                      >
                        Last Visit:
                      </span>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="c9:yqw2"
                      >
                        {client.lastVisit
                          ? new Date(client.lastVisit).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <div data-oid="xr7xb7w">
                      <span
                        className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid=":7qn14d"
                      >
                        Total Visits:
                      </span>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="s0kdewv"
                      >
                        {client.totalVisits || 0}
                      </p>
                    </div>
                    <div data-oid="c:szx54">
                      <span
                        className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="l7t_xpv"
                      >
                        Total Spent:
                      </span>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="4vxavjm"
                      >
                        ${client.totalSpent || 0}
                      </p>
                    </div>
                    <div data-oid="fm6.-42">
                      <span
                        className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="s92ynpw"
                      >
                        Next Appointment:
                      </span>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="9zwdl4s"
                      >
                        {client.nextAppointment
                          ? new Date(
                              client.nextAppointment,
                            ).toLocaleDateString()
                          : "None scheduled"}
                      </p>
                    </div>
                  </div>

                  {client.preferredService && (
                    <div data-oid="ewl0p1:">
                      <span
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="cz4p-bb"
                      >
                        Preferred Service:
                      </span>
                      <p
                        className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        data-oid="h4ens4e"
                      >
                        {client.preferredService}
                      </p>
                    </div>
                  )}

                  {client.notes && (
                    <div data-oid="vs3s.nj">
                      <span
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="lh-l96a"
                      >
                        Notes:
                      </span>
                      <p
                        className={`text-sm mt-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        data-oid="0u6v54_"
                      >
                        {client.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div
                  className={`px-6 py-4 border-t rounded-b-xl ${
                    darkMode
                      ? "border-gray-700 bg-gray-750"
                      : "border-gray-100 bg-gray-50"
                  }`}
                  data-oid="luqw5.m"
                >
                  <div
                    className="flex items-center justify-between"
                    data-oid="pvq9mf."
                  >
                    <div className="flex space-x-2" data-oid="nwosjp3">
                      <button
                        onClick={() => handleClientAction("message", client.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Send Message"
                        data-oid="_64niyo"
                      >
                        <MessageCircle className="w-4 h-4" data-oid="h3t23-o" />
                      </button>
                      <button
                        onClick={() => handleClientAction("call", client.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Call Client"
                        data-oid="bej.xg9"
                      >
                        <Phone className="w-4 h-4" data-oid=":ghd12m" />
                      </button>
                      <button
                        onClick={() => handleClientAction("email", client.id)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                        title="Send Email"
                        data-oid="..tbv6o"
                      >
                        <Mail className="w-4 h-4" data-oid="68b4.qz" />
                      </button>
                    </div>

                    <div className="flex space-x-2" data-oid="n1qx_l_">
                      <button
                        onClick={() => handleClientAction("book", client.id)}
                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        data-oid="fm0d06f"
                      >
                        Book Appointment
                      </button>
                      <button
                        onClick={() => handleClientAction("edit", client.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? "text-gray-400 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        title="Edit Client"
                        data-oid="qgmf:mj"
                      >
                        <Edit className="w-4 h-4" data-oid="0nh26e-" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedClients.length === 0 && (
            <div className="text-center py-12" data-oid="vct6fn:">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  darkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
                data-oid="_zb_x.u"
              >
                <Search
                  className={`w-8 h-8 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
                  data-oid="iwn.:th"
                />
              </div>
              <h3
                className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="58gm39h"
              >
                No clients found
              </h3>
              <p
                className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                data-oid="rhnf4q9"
              >
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterTag("all");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                data-oid="ro66t4."
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Summary Stats */}
          <div
            className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
            data-oid="s5piw-u"
          >
            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="w8c105h"
            >
              <div
                className="flex items-center justify-between"
                data-oid="iof64j:"
              >
                <div data-oid="z7rcs8r">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="j0g7.qc"
                  >
                    Total Clients
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid=":us-_2z"
                  >
                    {clients?.length || 0}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-purple-900" : "bg-purple-100"
                  }`}
                  data-oid="3f5g8po"
                >
                  <Tag
                    className={`w-4 h-4 ${darkMode ? "text-purple-400" : "text-purple-600"}`}
                    data-oid="xtkld4k"
                  />
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid=":qqdvm3"
            >
              <div
                className="flex items-center justify-between"
                data-oid="ml.x6zd"
              >
                <div data-oid="us-95:4">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="kl4kg0k"
                  >
                    VIP Clients
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="80reyfj"
                  >
                    {
                      (clients || []).filter((c) =>
                        (c.tags || []).includes("VIP"),
                      ).length
                    }
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-yellow-900" : "bg-yellow-100"
                  }`}
                  data-oid="rrj7v09"
                >
                  <Star
                    className={`w-4 h-4 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                    data-oid="y4:qq6x"
                  />
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid=".7qf842"
            >
              <div
                className="flex items-center justify-between"
                data-oid="r.4xid-"
              >
                <div data-oid="_29lokq">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="bfja34v"
                  >
                    New Clients
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="t8nd06c"
                  >
                    {
                      (clients || []).filter((c) =>
                        (c.tags || []).includes("New Client"),
                      ).length
                    }
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-green-900" : "bg-green-100"
                  }`}
                  data-oid="zqm-mkm"
                >
                  <Plus
                    className={`w-4 h-4 ${darkMode ? "text-green-400" : "text-green-600"}`}
                    data-oid="ty_sp90"
                  />
                </div>
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="09jsnar"
            >
              <div
                className="flex items-center justify-between"
                data-oid="t95tvi."
              >
                <div data-oid="i9nk-wf">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="q34ltv:"
                  >
                    Total Revenue
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="0a6q7m2"
                  >
                    $
                    {(clients || [])
                      .reduce(
                        (sum, client) => sum + (client.totalSpent || 0),
                        0,
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-green-900" : "bg-green-100"
                  }`}
                  data-oid="eo7fne:"
                >
                  <Calendar
                    className={`w-4 h-4 ${darkMode ? "text-green-400" : "text-green-600"}`}
                    data-oid="q0qy6q6"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
