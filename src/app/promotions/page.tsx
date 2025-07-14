"use client";

import { ArrowLeft, Star, Tag, Percent, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PromotionsPage() {
  const router = useRouter();

  const promotions = [
    {
      code: "SPRING20",
      discount: "20%",
      description: "Spring Special - 20% off all services",
      uses: 45,
      status: "active",
    },
    {
      code: "NEWCLIENT",
      discount: "15%",
      description: "First-time client discount",
      uses: 23,
      status: "active",
    },
    {
      code: "WEDDING50",
      discount: "$50",
      description: "Wedding package discount",
      uses: 8,
      status: "active",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      data-oid="k5uohhf"
    >
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100"
        data-oid="lpgw_:y"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="q361i_n"
        >
          <div
            className="flex items-center justify-between h-16"
            data-oid="g6s:sra"
          >
            <div className="flex items-center space-x-4" data-oid="crfyv-h">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                data-oid="cc36qxo"
              >
                <ArrowLeft
                  className="w-5 h-5 text-gray-600"
                  data-oid="zyvkao2"
                />
              </button>
              <h1
                className="text-xl font-semibold text-gray-900"
                data-oid="u0kqj7y"
              >
                Promotions & Discounts
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        data-oid="_6e3m8b"
      >
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          data-oid="3b-mibl"
        >
          {promotions.map((promo, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
              data-oid="osnfssy"
            >
              <div
                className="flex items-center justify-between mb-4"
                data-oid="lnggm5w"
              >
                <div className="flex items-center space-x-2" data-oid="tk.djru">
                  <Tag className="w-5 h-5 text-purple-600" data-oid=".prwiej" />
                  <span
                    className="font-bold text-lg text-purple-600"
                    data-oid="empds32"
                  >
                    {promo.code}
                  </span>
                </div>
                <span
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                  data-oid="9p-dgwx"
                >
                  {promo.status}
                </span>
              </div>

              <div className="mb-4" data-oid="sha_w-g">
                <div
                  className="text-2xl font-bold text-gray-900 mb-1"
                  data-oid="m.5.ky-"
                >
                  {promo.discount}
                </div>
                <p className="text-gray-600 text-sm" data-oid="jzxr55x">
                  {promo.description}
                </p>
              </div>

              <div
                className="flex items-center justify-between text-sm text-gray-500"
                data-oid="ru3.gw:"
              >
                <span data-oid="ur4a4db">Used {promo.uses} times</span>
                <Star className="w-4 h-4 text-yellow-500" data-oid="-qci2d-" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center" data-oid="to5p0eb">
          <Gift
            className="w-16 h-16 text-purple-400 mx-auto mb-4"
            data-oid="aiaub9s"
          />
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            data-oid="haa9npn"
          >
            Promotion Management
          </h2>
          <p className="text-gray-600" data-oid=":207ol3">
            Create and manage discount codes and special offers.
          </p>
        </div>
      </div>
    </div>
  );
}
