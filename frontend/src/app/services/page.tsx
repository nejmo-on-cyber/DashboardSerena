"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Tag,
  Search,
  Filter,
  Sun,
  Moon,
  Star,
  Users,
  TrendingUp,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  popularity: number;
  staff: string[];
  isActive: boolean;
}

export default function ServicesPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [newService, setNewService] = useState({
    name: "",
    category: "",
    duration: 60,
    price: 0,
    description: "",
    staff: [] as string[],
  });

  // Mock services data
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Hair Cut & Styling",
      category: "Hair",
      duration: 60,
      price: 65,
      description: "Professional haircut with styling and blow-dry",
      popularity: 95,
      staff: ["Jessica", "Maria"],
      isActive: true,
    },
    {
      id: "2",
      name: "Hair Color & Highlights",
      category: "Hair",
      duration: 120,
      price: 150,
      description: "Full color service with highlights and toning",
      popularity: 88,
      staff: ["Jessica", "Sarah"],
      isActive: true,
    },
    {
      id: "3",
      name: "Deep Cleansing Facial",
      category: "Facial",
      duration: 90,
      price: 85,
      description: "Deep pore cleansing with extraction and moisturizing",
      popularity: 82,
      staff: ["Maria", "David"],
      isActive: true,
    },
    {
      id: "4",
      name: "Swedish Massage",
      category: "Massage",
      duration: 60,
      price: 90,
      description: "Relaxing full-body massage with essential oils",
      popularity: 76,
      staff: ["David"],
      isActive: true,
    },
    {
      id: "5",
      name: "Gel Manicure",
      category: "Nails",
      duration: 45,
      price: 35,
      description: "Long-lasting gel manicure with nail art options",
      popularity: 91,
      staff: ["Jessica", "Maria"],
      isActive: true,
    },
    {
      id: "6",
      name: "Spa Pedicure",
      category: "Nails",
      duration: 60,
      price: 45,
      description: "Luxurious pedicure with foot massage and polish",
      popularity: 79,
      staff: ["Maria", "Sarah"],
      isActive: true,
    },
    {
      id: "7",
      name: "Eyebrow Threading",
      category: "Beauty",
      duration: 20,
      price: 25,
      description: "Precise eyebrow shaping using threading technique",
      popularity: 85,
      staff: ["Jessica", "Sarah"],
      isActive: true,
    },
    {
      id: "8",
      name: "Bridal Package",
      category: "Special",
      duration: 240,
      price: 350,
      description: "Complete bridal makeover including hair, makeup, and nails",
      popularity: 70,
      staff: ["Jessica", "Maria", "Sarah"],
      isActive: true,
    },
  ]);

  const categories = [
    "all",
    "Hair",
    "Facial",
    "Massage",
    "Nails",
    "Beauty",
    "Special",
  ];

  const staffMembers = ["Jessica", "Maria", "David", "Sarah"];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || service.category === filterCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Hair":
        return darkMode
          ? "bg-purple-900 text-purple-300"
          : "bg-purple-100 text-purple-800";
      case "Facial":
        return darkMode
          ? "bg-green-900 text-green-300"
          : "bg-green-100 text-green-800";
      case "Massage":
        return darkMode
          ? "bg-blue-900 text-blue-300"
          : "bg-blue-100 text-blue-800";
      case "Nails":
        return darkMode
          ? "bg-pink-900 text-pink-300"
          : "bg-pink-100 text-pink-800";
      case "Beauty":
        return darkMode
          ? "bg-yellow-900 text-yellow-300"
          : "bg-yellow-100 text-yellow-800";
      case "Special":
        return darkMode ? "bg-red-900 text-red-300" : "bg-red-100 text-red-800";
      default:
        return darkMode
          ? "bg-gray-700 text-gray-300"
          : "bg-gray-100 text-gray-800";
    }
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 90) return "text-green-600";
    if (popularity >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = (
      Math.max(...services.map((s) => parseInt(s.id))) + 1
    ).toString();
    const service: Service = {
      id: newId,
      ...newService,
      popularity: 50, // Default popularity
      isActive: true,
    };
    setServices([...services, service]);
    setNewService({
      name: "",
      category: "",
      duration: 60,
      price: 0,
      description: "",
      staff: [],
    });
    setShowAddForm(false);
  };

  const handleDeleteService = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setServices(
        services.map((s) => (s.id === id ? { ...s, isActive: false } : s)),
      );
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service.id);
    setNewService({
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
      description: service.description,
      staff: service.staff,
    });
  };

  const handleUpdateService = () => {
    if (editingService) {
      setServices(
        services.map((s) =>
          s.id === editingService ? { ...s, ...newService } : s,
        ),
      );
      setEditingService(null);
      setNewService({
        name: "",
        category: "",
        duration: 60,
        price: 0,
        description: "",
        staff: [],
      });
    }
  };

  const totalRevenue = services.reduce(
    (sum, service) => sum + (service.price * service.popularity) / 10,
    0,
  );
  const averagePrice =
    services.reduce((sum, service) => sum + service.price, 0) / services.length;
  const mostPopular = services.reduce((prev, current) =>
    prev.popularity > current.popularity ? prev : current,
  );

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-serena-dark"
          : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
      }`}
      data-oid="f1c68v5"
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} data-oid="4yp:cwe" />

      {/* Main Content */}
      <div className="lg:ml-64" data-oid="hk0v8ih">
        {/* Header */}
        <header
          className={`border-b transition-all duration-300 backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-purple-100"
          }`}
          data-oid="p8ytuln"
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-oid="a_onx-s"
          >
            <div
              className="flex items-center justify-between h-16"
              data-oid="uvd70so"
            >
              <div
                className="flex items-center space-x-4 lg:ml-0 ml-12"
                data-oid="ldx9oyz"
              >
                <div data-oid="tnm_uq.">
                  <h1
                    className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="efn55i2"
                  >
                    Services Management
                  </h1>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="xcfsauc"
                  >
                    Manage your salon services and pricing
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4" data-oid="t:f_52a">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                    darkMode
                      ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                  }`}
                  data-oid="s-u2ci."
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" data-oid="824skxu" />
                  ) : (
                    <Moon className="w-5 h-5" data-oid="bkq9hm9" />
                  )}
                </button>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  data-oid="5n0n4q6"
                >
                  <Plus className="w-4 h-4" data-oid="iq_93gt" />
                  <span data-oid="k:oslxk">Add Service</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          data-oid="mv:gdpq"
        >
          {/* Stats Cards */}
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            data-oid="1ep8zni"
          >
            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="rzi2-s:"
            >
              <div
                className="flex items-center justify-between"
                data-oid="28-fn0o"
              >
                <div data-oid="1ebkpxn">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="fg4bw51"
                  >
                    Total Services
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="x-y.u6b"
                  >
                    {services.filter((s) => s.isActive).length}
                  </p>
                </div>
                <Tag
                  className={`w-8 h-8 ${darkMode ? "text-purple-400" : "text-purple-600"}`}
                  data-oid="9hg50:z"
                />
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="wxrd0mh"
            >
              <div
                className="flex items-center justify-between"
                data-oid="o7069ic"
              >
                <div data-oid="l:vvgmi">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="zpostyl"
                  >
                    Average Price
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="yr8e92h"
                  >
                    ${Math.round(averagePrice)}
                  </p>
                </div>
                <DollarSign
                  className={`w-8 h-8 ${darkMode ? "text-green-400" : "text-green-600"}`}
                  data-oid="k1tcn8g"
                />
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="g4uco8b"
            >
              <div
                className="flex items-center justify-between"
                data-oid="1o.7p0x"
              >
                <div data-oid="i23wi.z">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="g_xrfwe"
                  >
                    Most Popular
                  </p>
                  <p
                    className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="v_ob_eu"
                  >
                    {mostPopular.name.split(" ")[0]}
                  </p>
                </div>
                <Star
                  className={`w-8 h-8 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`}
                  data-oid=":hr3:oy"
                />
              </div>
            </div>

            <div
              className={`rounded-xl shadow-sm border p-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="pxuo:mv"
            >
              <div
                className="flex items-center justify-between"
                data-oid="e1hu-ea"
              >
                <div data-oid="fg0-mqm">
                  <p
                    className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                    data-oid="51jc7_a"
                  >
                    Est. Revenue
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                    data-oid="h1mcwgi"
                  >
                    ${Math.round(totalRevenue)}
                  </p>
                </div>
                <TrendingUp
                  className={`w-8 h-8 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                  data-oid="n6t379a"
                />
              </div>
            </div>
          </div>

          {/* Add/Edit Service Form */}
          {(showAddForm || editingService) && (
            <div
              className={`rounded-xl shadow-sm border p-6 mb-6 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="wp15u._"
            >
              <h3
                className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="k2dk_xq"
              >
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <form
                onSubmit={
                  editingService
                    ? (e) => {
                        e.preventDefault();
                        handleUpdateService();
                      }
                    : handleAddService
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="no8-621"
              >
                <div data-oid="m6imxa9">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="dpx:57k"
                  >
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.name}
                    onChange={(e) =>
                      setNewService({ ...newService, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="e.g., Hair Cut & Styling"
                    data-oid="e5th0ii"
                  />
                </div>

                <div data-oid="_j81fok">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="ks:yxuu"
                  >
                    Category *
                  </label>
                  <select
                    required
                    value={newService.category}
                    onChange={(e) =>
                      setNewService({ ...newService, category: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="16x4h4m"
                  >
                    <option value="" data-oid="xw:.vr-">
                      Select Category
                    </option>
                    {categories
                      .filter((c) => c !== "all")
                      .map((category) => (
                        <option
                          key={category}
                          value={category}
                          data-oid="or4s_d6"
                        >
                          {category}
                        </option>
                      ))}
                  </select>
                </div>

                <div data-oid="ujjz:fb">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="txj5owi"
                  >
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    step="15"
                    value={newService.duration}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        duration: parseInt(e.target.value),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="7k__fkz"
                  />
                </div>

                <div data-oid="h3aljqs">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="vhv.yqh"
                  >
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        price: parseFloat(e.target.value),
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="xqdro9f"
                  />
                </div>

                <div className="md:col-span-2" data-oid="idp8ahu">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="tkud.29"
                  >
                    Description
                  </label>
                  <textarea
                    value={newService.description}
                    onChange={(e) =>
                      setNewService({
                        ...newService,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    placeholder="Describe the service..."
                    data-oid="17.nf3g"
                  />
                </div>

                <div className="md:col-span-2" data-oid="1z_0m5o">
                  <label
                    className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    data-oid="m8vczsb"
                  >
                    Available Staff
                  </label>
                  <div className="flex flex-wrap gap-2" data-oid="y6emtm0">
                    {staffMembers.map((staff) => (
                      <button
                        key={staff}
                        type="button"
                        onClick={() => {
                          const newStaff = newService.staff.includes(staff)
                            ? newService.staff.filter((s) => s !== staff)
                            : [...newService.staff, staff];
                          setNewService({ ...newService, staff: newStaff });
                        }}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          newService.staff.includes(staff)
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                            : darkMode
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        data-oid="1bul93q"
                      >
                        {staff}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  className="md:col-span-2 flex space-x-3"
                  data-oid="m:p4pbw"
                >
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    data-oid="hxsm5sj"
                  >
                    <Save className="w-4 h-4" data-oid="osp0djg" />
                    <span data-oid="3zky3xq">
                      {editingService ? "Update Service" : "Add Service"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingService(null);
                      setNewService({
                        name: "",
                        category: "",
                        duration: 60,
                        price: 0,
                        description: "",
                        staff: [],
                      });
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                      darkMode
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    data-oid="4sy7vxc"
                  >
                    <X className="w-4 h-4" data-oid="qlhhjoi" />
                    <span data-oid="9q7pqtw">Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div
            className={`rounded-xl shadow-sm border p-6 mb-6 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-purple-100"
            }`}
            data-oid="8t2x-o1"
          >
            <div
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
              data-oid="egao0s."
            >
              <div
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1"
                data-oid="nzhxr9q"
              >
                <div className="relative flex-1 max-w-md" data-oid="9ki1dhs">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    data-oid="y7wmnyk"
                  />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-200 text-gray-900"
                    }`}
                    data-oid="8g022x_"
                  />
                </div>

                <div className="flex space-x-2" data-oid=":-ec6y:">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setFilterCategory(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filterCategory === category
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : darkMode
                            ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      data-oid="r-xbm_y"
                    >
                      {category === "all" ? "All" : category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-oid="tw9ur-w"
          >
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-purple-100"
                }`}
                data-oid="ekunbx3"
              >
                {/* Service Header */}
                <div
                  className="p-6 border-b border-gray-200 dark:border-gray-700"
                  data-oid="ji-jn77"
                >
                  <div
                    className="flex items-start justify-between"
                    data-oid="2_t-n84"
                  >
                    <div className="flex-1" data-oid="b:a1jy5">
                      <div
                        className="flex items-center space-x-2 mb-2"
                        data-oid="mp3x28_"
                      >
                        <h3
                          className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                          data-oid="wgo20--"
                        >
                          {service.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(service.category)}`}
                          data-oid="vx5e16y"
                        >
                          {service.category}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                        data-oid="a.6ooof"
                      >
                        {service.description}
                      </p>
                    </div>
                    <div
                      className="flex items-center space-x-1 ml-4"
                      data-oid="vqnacx5"
                    >
                      <button
                        onClick={() => handleEditService(service)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        title="Edit Service"
                        data-oid="q:ngnbc"
                      >
                        <Edit
                          className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="lp5lq:e"
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        title="Delete Service"
                        data-oid="89kfz0l"
                      >
                        <Trash2
                          className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="9ssf4bo"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-6 space-y-4" data-oid="on8wpmb">
                  <div className="grid grid-cols-2 gap-4" data-oid="_zqsxkx">
                    <div
                      className="flex items-center space-x-2"
                      data-oid="f44h_up"
                    >
                      <Clock
                        className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="ioxxh2u"
                      />

                      <span
                        className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        data-oid="6_:9ay4"
                      >
                        {service.duration} min
                      </span>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-oid="wu01fxr"
                    >
                      <DollarSign
                        className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid="dhrqeml"
                      />

                      <span
                        className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        data-oid="ay4uzwx"
                      >
                        ${service.price}
                      </span>
                    </div>
                  </div>

                  <div data-oid="e-jcnjm">
                    <div
                      className="flex items-center justify-between mb-2"
                      data-oid="jdjkof3"
                    >
                      <span
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        data-oid=".kcyw-x"
                      >
                        Popularity
                      </span>
                      <span
                        className={`text-sm font-medium ${getPopularityColor(service.popularity)}`}
                        data-oid="unfn-rm"
                      >
                        {service.popularity}%
                      </span>
                    </div>
                    <div
                      className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2`}
                      data-oid="x5695nx"
                    >
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${service.popularity}%` }}
                        data-oid="z8lgxef"
                      ></div>
                    </div>
                  </div>

                  <div data-oid=":-ct4-_">
                    <span
                      className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      data-oid="snr_q1f"
                    >
                      Available Staff:
                    </span>
                    <div
                      className="flex flex-wrap gap-1 mt-1"
                      data-oid="1ikb45n"
                    >
                      {service.staff.map((staff) => (
                        <span
                          key={staff}
                          className={`px-2 py-1 text-xs rounded-full ${
                            darkMode
                              ? "bg-gray-700 text-gray-300"
                              : "bg-gray-100 text-gray-600"
                          }`}
                          data-oid="6to8ba5"
                        >
                          {staff}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Service Actions */}
                <div
                  className={`px-6 py-4 border-t rounded-b-xl ${
                    darkMode
                      ? "border-gray-700 bg-gray-750"
                      : "border-gray-100 bg-gray-50"
                  }`}
                  data-oid="d3jp9gd"
                >
                  <button
                    onClick={() =>
                      router.push(`/calendar?service=${service.id}`)
                    }
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    data-oid="nmkutwi"
                  >
                    Book This Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12" data-oid="4-2llfa">
              <Tag
                className={`w-16 h-16 mx-auto mb-4 ${darkMode ? "text-gray-600" : "text-gray-400"}`}
                data-oid="dnuky-s"
              />

              <h3
                className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                data-oid="kgh9eo_"
              >
                No services found
              </h3>
              <p
                className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                data-oid="7a1uvvl"
              >
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterCategory("all");
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                data-oid="f1d9kxb"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
