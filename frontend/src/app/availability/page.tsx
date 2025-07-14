"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AvailabilityPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({
    time: "",
    staff: "",
    duration: "60",
  });

  const [slots, setSlots] = useState([
    {
      id: 1,
      time: "9:00 AM",
      staff: "Available",
      type: "open",
      duration: 60,
      service: "Any",
    },
    {
      id: 2,
      time: "10:30 AM",
      staff: "Jessica",
      type: "booked",
      duration: 90,
      service: "Hair Cut & Color",
    },
    {
      id: 3,
      time: "12:00 PM",
      staff: "Available",
      type: "open",
      duration: 60,
      service: "Any",
    },
    {
      id: 4,
      time: "2:30 PM",
      staff: "Maria",
      type: "booked",
      duration: 120,
      service: "Facial Treatment",
    },
    {
      id: 5,
      time: "4:00 PM",
      staff: "Available",
      type: "open",
      duration: 60,
      service: "Any",
    },
    {
      id: 6,
      time: "5:30 PM",
      staff: "Available",
      type: "open",
      duration: 60,
      service: "Any",
    },
  ]);

  const staffMembers = ["Jessica", "Maria", "David", "Sarah"];
  const services = [
    "Hair Cut",
    "Hair Color",
    "Facial Treatment",
    "Massage",
    "Manicure",
    "Pedicure",
  ];

  const handleAddSlot = () => {
    if (newSlot.time && newSlot.staff) {
      const newId = Math.max(...slots.map((s) => s.id)) + 1;
      setSlots([
        ...slots,
        {
          id: newId,
          time: newSlot.time,
          staff: newSlot.staff,
          type: newSlot.staff === "Available" ? "open" : "booked",
          duration: parseInt(newSlot.duration),
          service: "Any",
        },
      ]);
      setNewSlot({ time: "", staff: "", duration: "60" });
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = (id: number) => {
    setSlots(slots.filter((slot) => slot.id !== id));
  };

  const handleEditSlot = (id: number, updates: any) => {
    setSlots(
      slots.map((slot) => (slot.id === id ? { ...slot, ...updates } : slot)),
    );
    setEditingSlot(null);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      data-oid="y2fsrx1"
    >
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100"
        data-oid="e4fz6qk"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="e::vsro"
        >
          <div
            className="flex items-center justify-between h-16"
            data-oid="gebpt9k"
          >
            <div className="flex items-center space-x-4" data-oid="o7a31m_">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                data-oid="8ftdzrl"
              >
                <ArrowLeft
                  className="w-5 h-5 text-gray-600"
                  data-oid="sn1dz4q"
                />
              </button>
              <h1
                className="text-xl font-semibold text-gray-900"
                data-oid="ka1ku7:"
              >
                Availability Management
              </h1>
            </div>
            <button
              onClick={() => setIsAddingSlot(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              data-oid="3j1v_tg"
            >
              <Plus className="w-4 h-4" data-oid="n.4p3kx" />
              <span data-oid="q3qs4ft">Add Slot</span>
            </button>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        data-oid="3fb0-f8"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          data-oid="5kzx80:"
        >
          {/* Calendar Sidebar */}
          <div
            className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
            data-oid="-mdl44f"
          >
            <h2
              className="text-lg font-semibold text-gray-900 mb-4"
              data-oid="7t-dbq_"
            >
              Select Date
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              data-oid="s.tlja4"
            />

            <div className="mt-6" data-oid="2pvxejz">
              <h3
                className="text-sm font-medium text-gray-700 mb-3"
                data-oid="387yt07"
              >
                Quick Stats
              </h3>
              <div className="space-y-2" data-oid="vg7138y">
                <div
                  className="flex justify-between text-sm"
                  data-oid="uvqc34w"
                >
                  <span className="text-gray-600" data-oid=".ob:k:9">
                    Total Slots:
                  </span>
                  <span className="font-medium" data-oid="lsgfugt">
                    {slots.length}
                  </span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  data-oid="yt42pkb"
                >
                  <span className="text-gray-600" data-oid="8hlpuq4">
                    Available:
                  </span>
                  <span
                    className="font-medium text-green-600"
                    data-oid="a.cu3-l"
                  >
                    {slots.filter((s) => s.type === "open").length}
                  </span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  data-oid="899cj-x"
                >
                  <span className="text-gray-600" data-oid="y_pdeco">
                    Booked:
                  </span>
                  <span
                    className="font-medium text-blue-600"
                    data-oid="52ds:yv"
                  >
                    {slots.filter((s) => s.type === "booked").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6" data-oid="-o4lkri">
              <h3
                className="text-sm font-medium text-gray-700 mb-3"
                data-oid="j21s--f"
              >
                Staff Schedule
              </h3>
              <div className="space-y-2" data-oid="lvzwwlr">
                {staffMembers.map((staff) => (
                  <div
                    key={staff}
                    className="flex items-center justify-between text-sm"
                    data-oid="bm4tqgt"
                  >
                    <span className="text-gray-600" data-oid="u2h:.6k">
                      {staff}:
                    </span>
                    <span className="font-medium" data-oid=":cc3d7p">
                      {slots.filter((s) => s.staff === staff).length} slots
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Schedule */}
          <div className="lg:col-span-3" data-oid="bt7lrtb">
            <div
              className="bg-white rounded-xl shadow-sm border border-purple-100"
              data-oid="u.:7cye"
            >
              <div className="p-6 border-b border-gray-200" data-oid="2bjq:4j">
                <div
                  className="flex items-center justify-between"
                  data-oid="o3-uhd3"
                >
                  <h2
                    className="text-lg font-semibold text-gray-900"
                    data-oid="sipz-n6"
                  >
                    Schedule for {new Date(selectedDate).toLocaleDateString()}
                  </h2>
                  <div
                    className="flex items-center space-x-2"
                    data-oid="f1pc6y9"
                  >
                    <div
                      className="flex items-center space-x-1"
                      data-oid="q4qjlyy"
                    >
                      <div
                        className="w-3 h-3 bg-green-400 rounded-full"
                        data-oid="sk5m20z"
                      ></div>
                      <span
                        className="text-sm text-gray-600"
                        data-oid="jcv2hbx"
                      >
                        Available
                      </span>
                    </div>
                    <div
                      className="flex items-center space-x-1"
                      data-oid="v-2n_jo"
                    >
                      <div
                        className="w-3 h-3 bg-blue-400 rounded-full"
                        data-oid="s7wjxag"
                      ></div>
                      <span
                        className="text-sm text-gray-600"
                        data-oid="icw0f8w"
                      >
                        Booked
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6" data-oid="7hocf.j">
                {/* Add New Slot Form */}
                {isAddingSlot && (
                  <div
                    className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
                    data-oid="3sloowd"
                  >
                    <h3
                      className="text-sm font-medium text-gray-900 mb-3"
                      data-oid="7f:my6v"
                    >
                      Add New Time Slot
                    </h3>
                    <div
                      className="grid grid-cols-1 md:grid-cols-4 gap-4"
                      data-oid="d:bc810"
                    >
                      <div data-oid="q1gn7qs">
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          data-oid="qexsopj"
                        >
                          Time
                        </label>
                        <input
                          type="time"
                          value={newSlot.time}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, time: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          data-oid="1ay3jqn"
                        />
                      </div>
                      <div data-oid="qkblmbu">
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          data-oid="e5i0i4i"
                        >
                          Staff
                        </label>
                        <select
                          value={newSlot.staff}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, staff: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          data-oid="8j0_69s"
                        >
                          <option value="" data-oid="udua8ua">
                            Select Staff
                          </option>
                          <option value="Available" data-oid="16d3ou4">
                            Available
                          </option>
                          {staffMembers.map((staff) => (
                            <option
                              key={staff}
                              value={staff}
                              data-oid="oxr4040"
                            >
                              {staff}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div data-oid=".jf_52v">
                        <label
                          className="block text-xs font-medium text-gray-700 mb-1"
                          data-oid="f49nztj"
                        >
                          Duration (min)
                        </label>
                        <select
                          value={newSlot.duration}
                          onChange={(e) =>
                            setNewSlot({ ...newSlot, duration: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          data-oid="vh52-s:"
                        >
                          <option value="30" data-oid="159r1._">
                            30 min
                          </option>
                          <option value="60" data-oid="i7rctwc">
                            60 min
                          </option>
                          <option value="90" data-oid="8b.r5ku">
                            90 min
                          </option>
                          <option value="120" data-oid="pfu_dg:">
                            120 min
                          </option>
                        </select>
                      </div>
                      <div
                        className="flex items-end space-x-2"
                        data-oid="6tdxwu8"
                      >
                        <button
                          onClick={handleAddSlot}
                          className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                          data-oid="k46w8fm"
                        >
                          <Save className="w-4 h-4" data-oid="l6uc737" />
                          <span data-oid="c-4mvjo">Save</span>
                        </button>
                        <button
                          onClick={() => setIsAddingSlot(false)}
                          className="flex items-center space-x-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          data-oid="q_9gusz"
                        >
                          <X className="w-4 h-4" data-oid="ef.2:hh" />
                          <span data-oid="yt4x.4w">Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Time Slots Grid */}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  data-oid="xth5gpv"
                >
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        slot.type === "open"
                          ? "bg-green-50 border-green-200 hover:border-green-300"
                          : "bg-blue-50 border-blue-200 hover:border-blue-300"
                      }`}
                      data-oid="nzm6zij"
                    >
                      {editingSlot === slot.id ? (
                        <div className="space-y-3" data-oid="myo6mm:">
                          <input
                            type="time"
                            defaultValue={slot.time}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                            data-oid="hpf040c"
                          />

                          <select
                            defaultValue={slot.staff}
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                            data-oid="xhbveif"
                          >
                            <option value="Available" data-oid="_xmnyb_">
                              Available
                            </option>
                            {staffMembers.map((staff) => (
                              <option
                                key={staff}
                                value={staff}
                                data-oid="684uscn"
                              >
                                {staff}
                              </option>
                            ))}
                          </select>
                          <div className="flex space-x-2" data-oid="7f09a1b">
                            <button
                              onClick={() => handleEditSlot(slot.id, {})}
                              className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              data-oid="h7xgixn"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSlot(null)}
                              className="flex-1 px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                              data-oid="pucub9p"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="flex items-center justify-between mb-2"
                            data-oid="o-58az:"
                          >
                            <div
                              className="flex items-center space-x-2"
                              data-oid="nswmihd"
                            >
                              <Clock
                                className={`w-4 h-4 ${
                                  slot.type === "open"
                                    ? "text-green-600"
                                    : "text-blue-600"
                                }`}
                                data-oid="-a:ijld"
                              />

                              <span
                                className="font-medium text-gray-900"
                                data-oid="03mcb35"
                              >
                                {slot.time}
                              </span>
                            </div>
                            <div className="flex space-x-1" data-oid="9l2o3_z">
                              <button
                                onClick={() => setEditingSlot(slot.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                data-oid="g1v5-4j"
                              >
                                <Edit className="w-3 h-3" data-oid="4m-f1pp" />
                              </button>
                              <button
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                data-oid="b.0uji5"
                              >
                                <Trash2
                                  className="w-3 h-3"
                                  data-oid="0b3zkei"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1" data-oid=":it7x:6">
                            <div
                              className="flex items-center space-x-2"
                              data-oid="b7s7dl3"
                            >
                              <User
                                className="w-3 h-3 text-gray-400"
                                data-oid="dsly395"
                              />
                              <span
                                className="text-sm text-gray-600"
                                data-oid="srd2zxw"
                              >
                                {slot.staff}
                              </span>
                            </div>
                            <div
                              className="flex items-center space-x-2"
                              data-oid="9arjtk3"
                            >
                              <Calendar
                                className="w-3 h-3 text-gray-400"
                                data-oid=".pwzhzu"
                              />
                              <span
                                className="text-sm text-gray-600"
                                data-oid="q19.xa3"
                              >
                                {slot.duration} min
                              </span>
                            </div>
                            <div
                              className="text-xs text-gray-500 mt-2"
                              data-oid="lzf2vki"
                            >
                              Service: {slot.service}
                            </div>
                          </div>

                          {slot.type === "open" && (
                            <button
                              className="w-full mt-3 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                              data-oid="3cgiqos"
                            >
                              Book Slot
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {slots.length === 0 && (
                  <div className="text-center py-12" data-oid="cxg_d1d">
                    <Calendar
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      data-oid="oq3_zcz"
                    />
                    <h3
                      className="text-lg font-medium text-gray-900 mb-2"
                      data-oid="397.zqg"
                    >
                      No slots scheduled
                    </h3>
                    <p className="text-gray-600 mb-4" data-oid="ppi73-a">
                      Add your first time slot to get started.
                    </p>
                    <button
                      onClick={() => setIsAddingSlot(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      data-oid="4dsm.d5"
                    >
                      Add Time Slot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
