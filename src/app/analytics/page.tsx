"use client";

import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      data-oid="re2mjj:"
    >
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100"
        data-oid="1hw:ydx"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="op4jjrx"
        >
          <div
            className="flex items-center justify-between h-16"
            data-oid="jzcehou"
          >
            <div className="flex items-center space-x-4" data-oid="c6jrzvi">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                data-oid="ecou1og"
              >
                <ArrowLeft
                  className="w-5 h-5 text-gray-600"
                  data-oid="f7z.yjc"
                />
              </button>
              <h1
                className="text-xl font-semibold text-gray-900"
                data-oid="r0c4:9l"
              >
                Analytics Dashboard
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        data-oid="tkgq3q:"
      >
        <div className="text-center py-12" data-oid="oymhe0m">
          <BarChart3
            className="w-16 h-16 text-purple-400 mx-auto mb-4"
            data-oid="zlu9ksk"
          />
          <h2
            className="text-2xl font-bold text-gray-900 mb-2"
            data-oid="73:ud0t"
          >
            Analytics Dashboard
          </h2>
          <p className="text-gray-600 mb-6" data-oid="ks_qsck">
            Detailed analytics and reporting coming soon.
          </p>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
            data-oid="m7.bwta"
          >
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid="1pxudy3"
            >
              <TrendingUp
                className="w-8 h-8 text-green-500 mx-auto mb-2"
                data-oid="1n.wpa9"
              />
              <h3 className="font-semibold text-gray-900" data-oid=".n6crg6">
                Revenue Analytics
              </h3>
              <p className="text-sm text-gray-600" data-oid="kmgnch.">
                Track income trends
              </p>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid="m6s992y"
            >
              <Users
                className="w-8 h-8 text-blue-500 mx-auto mb-2"
                data-oid="3wdk842"
              />
              <h3 className="font-semibold text-gray-900" data-oid="ns3ebw9">
                Client Insights
              </h3>
              <p className="text-sm text-gray-600" data-oid="5mnkx.2">
                Behavior analysis
              </p>
            </div>
            <div
              className="bg-white p-6 rounded-xl shadow-sm border border-purple-100"
              data-oid=".8b7gsr"
            >
              <PieChart
                className="w-8 h-8 text-purple-500 mx-auto mb-2"
                data-oid="m8:7e5t"
              />
              <h3 className="font-semibold text-gray-900" data-oid="mfhjr_1">
                Service Performance
              </h3>
              <p className="text-sm text-gray-600" data-oid="w6s6t9:">
                Popular services
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
