"use client";

import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RevenuePage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      data-oid="29b4lw6"
    >
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100"
        data-oid="0dosoia"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid=":mjbnbx"
        >
          <div
            className="flex items-center justify-between h-16"
            data-oid="a:ee2b_"
          >
            <div className="flex items-center space-x-4" data-oid="_303ha:">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                data-oid="2ftypvk"
              >
                <ArrowLeft
                  className="w-5 h-5 text-gray-600"
                  data-oid="px4o9w1"
                />
              </button>
              <h1
                className="text-xl font-semibold text-gray-900"
                data-oid="oyjgll:"
              >
                Revenue Management
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        data-oid=":rhyti-"
      >
        <div className="text-center py-12" data-oid="nj4zgd8">
          <DollarSign
            className="w-16 h-16 text-green-400 mx-auto mb-4"
            data-oid="9e9jq_a"
          />
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            data-oid="3fc1.:c"
          >
            Revenue Dashboard
          </h2>
          <p className="text-gray-600 mb-6" data-oid="-m.lt08">
            Financial tracking and revenue analytics.
          </p>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
            data-oid="t5cf81v"
          >
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid="pe37x03"
            >
              <TrendingUp
                className="w-8 h-8 text-green-500 mx-auto mb-2"
                data-oid="0tn6_9:"
              />
              <h3 className="font-semibold text-gray-900" data-oid="zu7l9ah">
                Monthly Revenue
              </h3>
              <p className="text-sm text-gray-600" data-oid="flvfoo7">
                $12,450
              </p>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid="221a4xv"
            >
              <Calendar
                className="w-8 h-8 text-blue-500 mx-auto mb-2"
                data-oid="a30p6ko"
              />
              <h3 className="font-semibold text-gray-900" data-oid="5s1li3g">
                Daily Average
              </h3>
              <p className="text-sm text-gray-600" data-oid="ejso6dw">
                $415
              </p>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid="_55x7mi"
            >
              <CreditCard
                className="w-8 h-8 text-purple-500 mx-auto mb-2"
                data-oid=":1nznih"
              />
              <h3 className="font-semibold text-gray-900" data-oid="1kkpmi8">
                Payment Methods
              </h3>
              <p className="text-sm text-gray-600" data-oid="afijtf5">
                Card, Cash, Digital
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
