"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Phone,
  Play,
  Pause,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function VoiceCallsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [playingCall, setPlayingCall] = useState<number | null>(null);

  const voiceCalls = [
    {
      id: 1,
      client: "Anna Wilson",
      phone: "+1 (555) 234-5678",
      duration: "3:45",
      time: "2024-01-20 14:30",
      summary:
        "Booking inquiry for wedding package. Customer interested in full bridal party services including hair, makeup, and nails for 6 people.",
      sentiment: "positive" as const,
      confidence: 0.92,
      highlights: [
        "Wedding package interest",
        "Booking made for March 15",
        "Bridal party of 6",
        "Budget discussed: $1,200",
      ],

      transcript:
        "Hi, I'm calling about your wedding packages. I need services for my bridal party of 6 people on March 15th. We're looking for hair, makeup, and nails. What would be the total cost?",
      keyMoments: [
        { time: "0:15", text: "Wedding package inquiry" },
        { time: "1:30", text: "Discussed pricing" },
        { time: "2:45", text: "Booking confirmed" },
      ],

      audioUrl: "/audio/call-1.mp3",
    },
    {
      id: 2,
      client: "Robert Kim",
      phone: "+1 (555) 876-5432",
      duration: "2:12",
      time: "2024-01-20 11:15",
      summary:
        "Complaint about service quality during last visit. Customer was unsatisfied with haircut and is requesting a refund or redo.",
      sentiment: "negative" as const,
      confidence: 0.87,
      highlights: [
        "Service complaint",
        "Haircut dissatisfaction",
        "Refund requested",
        "Follow-up scheduled",
      ],

      transcript:
        "I'm very disappointed with the haircut I received yesterday. It's not what I asked for and I'd like either a refund or to have it fixed by someone else.",
      keyMoments: [
        { time: "0:05", text: "Complaint initiated" },
        { time: "0:45", text: "Specific issues discussed" },
        { time: "1:30", text: "Resolution offered" },
      ],

      audioUrl: "/audio/call-2.mp3",
    },
    {
      id: 3,
      client: "Lisa Martinez",
      phone: "+1 (555) 345-6789",
      duration: "1:30",
      time: "2024-01-20 09:45",
      summary:
        "General inquiry about available services and pricing. New customer exploring options for regular beauty treatments.",
      sentiment: "neutral" as const,
      confidence: 0.78,
      highlights: [
        "Service inquiry",
        "Pricing questions",
        "New customer",
        "Callback requested",
      ],

      transcript:
        "Hi, I'm new to the area and looking for a beauty salon. Can you tell me about your services and pricing? I'm particularly interested in facials and hair treatments.",
      keyMoments: [
        { time: "0:10", text: "Service inquiry" },
        { time: "0:50", text: "Pricing discussion" },
        { time: "1:15", text: "Follow-up arranged" },
      ],

      audioUrl: "/audio/call-3.mp3",
    },
    {
      id: 4,
      client: "David Thompson",
      phone: "+1 (555) 567-8901",
      duration: "4:20",
      time: "2024-01-19 16:20",
      summary:
        "Booking appointment for corporate event. Company needs grooming services for 12 executives before important presentation.",
      sentiment: "positive" as const,
      confidence: 0.94,
      highlights: [
        "Corporate booking",
        "12 people",
        "Urgent timeline",
        "Premium package",
        "Payment confirmed",
      ],

      transcript:
        "We have an important board presentation next week and need grooming services for our executive team. Can you accommodate 12 people on short notice?",
      keyMoments: [
        { time: "0:20", text: "Corporate event explained" },
        { time: "1:45", text: "Timeline discussed" },
        { time: "3:30", text: "Booking confirmed" },
      ],

      audioUrl: "/audio/call-4.mp3",
    },
  ];

  const filteredCalls = voiceCalls.filter((call) => {
    const matchesSearch =
      call.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment =
      sentimentFilter === "all" || call.sentiment === sentimentFilter;
    return matchesSearch && matchesSentiment;
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return (
          <TrendingUp className="w-4 h-4 text-green-500" data-oid="g.oxl5z" />
        );
      case "negative":
        return (
          <TrendingDown className="w-4 h-4 text-red-500" data-oid="k.cz4zj" />
        );
      default:
        return <Minus className="w-4 h-4 text-gray-500" data-oid="8yk865q" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200";
      case "negative":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-50 border-green-200";
      case "negative":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
      data-oid="6r67us2"
    >
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100"
        data-oid="lghiyx."
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="1c2p52n"
        >
          <div
            className="flex items-center justify-between h-16"
            data-oid="7mnd71o"
          >
            <div className="flex items-center space-x-4" data-oid="zyom7bd">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                data-oid="..rbh1z"
              >
                <ArrowLeft
                  className="w-5 h-5 text-gray-600"
                  data-oid="8lpkfnu"
                />
              </button>
              <h1
                className="text-xl font-semibold text-gray-900"
                data-oid="9q-fblt"
              >
                Voice Call Analytics
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        data-oid="qk39l4h"
      >
        {/* Analytics Summary */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-oid="4k__bq5"
        >
          <div
            className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
            data-oid="o.n5rx6"
          >
            <div
              className="flex items-center justify-between"
              data-oid="kvuf68w"
            >
              <div data-oid="8ls9:db">
                <p
                  className="text-sm font-medium text-gray-600"
                  data-oid="bc6d_y0"
                >
                  Total Calls
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  data-oid="oz4.hln"
                >
                  {voiceCalls.length}
                </p>
              </div>
              <Phone className="w-8 h-8 text-purple-400" data-oid="t.huzla" />
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
            data-oid="pw5flfz"
          >
            <div
              className="flex items-center justify-between"
              data-oid="uexsagk"
            >
              <div data-oid="_s3_245">
                <p
                  className="text-sm font-medium text-gray-600"
                  data-oid="jgjmomz"
                >
                  Positive Sentiment
                </p>
                <p
                  className="text-2xl font-bold text-green-600"
                  data-oid="txmn.8z"
                >
                  {voiceCalls.filter((c) => c.sentiment === "positive").length}
                </p>
              </div>
              <TrendingUp
                className="w-8 h-8 text-green-400"
                data-oid="zrofz6-"
              />
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
            data-oid="hvseinj"
          >
            <div
              className="flex items-center justify-between"
              data-oid="vf:26uu"
            >
              <div data-oid="2znhpx_">
                <p
                  className="text-sm font-medium text-gray-600"
                  data-oid="-f2u80."
                >
                  Negative Sentiment
                </p>
                <p
                  className="text-2xl font-bold text-red-600"
                  data-oid="3-q4t8n"
                >
                  {voiceCalls.filter((c) => c.sentiment === "negative").length}
                </p>
              </div>
              <TrendingDown
                className="w-8 h-8 text-red-400"
                data-oid="nb-l.92"
              />
            </div>
          </div>

          <div
            className="bg-white rounded-xl shadow-sm border border-purple-100 p-6"
            data-oid="m3qlvyk"
          >
            <div
              className="flex items-center justify-between"
              data-oid="xov-x:a"
            >
              <div data-oid="hehkltn">
                <p
                  className="text-sm font-medium text-gray-600"
                  data-oid="ssonirt"
                >
                  Avg Duration
                </p>
                <p
                  className="text-2xl font-bold text-gray-900"
                  data-oid="c2zfate"
                >
                  2:52
                </p>
              </div>
              <div
                className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                data-oid="49s1pju"
              >
                <Phone className="w-4 h-4 text-blue-600" data-oid="bahfy-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 mb-6"
          data-oid="zo0rlu3"
        >
          <div
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
            data-oid="wv55d55"
          >
            <div
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1"
              data-oid="8tewxrx"
            >
              <div className="relative flex-1 max-w-md" data-oid="3c2f_i4">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  data-oid="07mfe.e"
                />
                <input
                  type="text"
                  placeholder="Search calls..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  data-oid="9l9kycr"
                />
              </div>

              <div className="flex space-x-2" data-oid="vrs533k">
                {["all", "positive", "negative", "neutral"].map((sentiment) => (
                  <button
                    key={sentiment}
                    onClick={() => setSentimentFilter(sentiment)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sentimentFilter === sentiment
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    data-oid="99llhz6"
                  >
                    {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call List */}
        <div className="space-y-6" data-oid="ocnpzel">
          {filteredCalls.map((call) => (
            <div
              key={call.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${getSentimentBg(call.sentiment)}`}
              data-oid="b-.h_k0"
            >
              {/* Call Header */}
              <div className="p-6 border-b border-gray-200" data-oid="8wk0.9e">
                <div
                  className="flex items-start justify-between"
                  data-oid="02dequi"
                >
                  <div
                    className="flex items-start space-x-4"
                    data-oid="pf48qbt"
                  >
                    <div
                      className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium"
                      data-oid="80gilxa"
                    >
                      {call.client.charAt(0)}
                    </div>
                    <div data-oid="dnqqye-">
                      <div
                        className="flex items-center space-x-3"
                        data-oid="-mr0xbx"
                      >
                        <h3
                          className="text-lg font-semibold text-gray-900"
                          data-oid="c3s:inh"
                        >
                          {call.client}
                        </h3>
                        <div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getSentimentColor(call.sentiment)}`}
                          data-oid="orv8qrm"
                        >
                          {getSentimentIcon(call.sentiment)}
                          <span
                            className="text-xs font-medium"
                            data-oid="a0sm.ns"
                          >
                            {call.sentiment}
                          </span>
                          <span className="text-xs" data-oid="0plrwo.">
                            ({Math.round(call.confidence * 100)}%)
                          </span>
                        </div>
                      </div>
                      <p
                        className="text-sm text-gray-600 mt-1"
                        data-oid="6rkz-.v"
                      >
                        {call.phone}
                      </p>
                      <div
                        className="flex items-center space-x-4 mt-2 text-sm text-gray-500"
                        data-oid="acwgp0d"
                      >
                        <span data-oid="wtm_t_t">
                          {new Date(call.time).toLocaleString()}
                        </span>
                        <span data-oid="-fvwwhj">
                          Duration: {call.duration}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-2"
                    data-oid="267hr0f"
                  >
                    <button
                      onClick={() =>
                        setPlayingCall(playingCall === call.id ? null : call.id)
                      }
                      className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                      data-oid="1szka:s"
                    >
                      {playingCall === call.id ? (
                        <Pause className="w-4 h-4" data-oid=".c3-p99" />
                      ) : (
                        <Play className="w-4 h-4" data-oid="b3l4u:8" />
                      )}
                    </button>
                    <button
                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      data-oid="p7039hb"
                    >
                      <Download className="w-4 h-4" data-oid="4lzq3n6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Call Content */}
              <div className="p-6" data-oid="p3turv4">
                <div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                  data-oid="cijarbi"
                >
                  {/* Summary and Transcript */}
                  <div className="space-y-4" data-oid="z-3f82c">
                    <div data-oid="b6nvr:o">
                      <h4
                        className="text-sm font-medium text-gray-900 mb-2"
                        data-oid="e-e8j89"
                      >
                        AI Summary
                      </h4>
                      <p
                        className="text-sm text-gray-700 bg-white p-3 rounded-lg border"
                        data-oid="5vf-i.7"
                      >
                        {call.summary}
                      </p>
                    </div>

                    <div data-oid=":f8f7s9">
                      <h4
                        className="text-sm font-medium text-gray-900 mb-2"
                        data-oid="d:tbv7_"
                      >
                        Transcript Preview
                      </h4>
                      <p
                        className="text-sm text-gray-700 bg-white p-3 rounded-lg border italic"
                        data-oid="kr2iy89"
                      >
                        "{call.transcript}"
                      </p>
                    </div>
                  </div>

                  {/* Key Highlights and Moments */}
                  <div className="space-y-4" data-oid="1t94snr">
                    <div data-oid="mc5w8v5">
                      <h4
                        className="text-sm font-medium text-gray-900 mb-2"
                        data-oid="j:nfceu"
                      >
                        Key Highlights
                      </h4>
                      <div className="flex flex-wrap gap-2" data-oid="otwfjx3">
                        {call.highlights.map((highlight, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                            data-oid=".n0-jio"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div data-oid="cf3y99:">
                      <h4
                        className="text-sm font-medium text-gray-900 mb-2"
                        data-oid=".ca0r.g"
                      >
                        Key Moments
                      </h4>
                      <div className="space-y-2" data-oid="b-v5dfz">
                        {call.keyMoments.map((moment, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 bg-white p-2 rounded-lg border"
                            data-oid="h8fztmo"
                          >
                            <span
                              className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded"
                              data-oid="6tms9z-"
                            >
                              {moment.time}
                            </span>
                            <span
                              className="text-xs text-gray-700 flex-1"
                              data-oid="leiljut"
                            >
                              {moment.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio Player (when playing) */}
                {playingCall === call.id && (
                  <div
                    className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200"
                    data-oid="a1hdio3"
                  >
                    <div
                      className="flex items-center space-x-4"
                      data-oid="al:z61p"
                    >
                      <button
                        onClick={() => setPlayingCall(null)}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        data-oid=":038m2b"
                      >
                        <Pause className="w-4 h-4" data-oid="tmbwco-" />
                      </button>
                      <div className="flex-1" data-oid="7i:zp8m">
                        <div
                          className="w-full bg-purple-200 rounded-full h-2"
                          data-oid="z4f_n-a"
                        >
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: "35%" }}
                            data-oid="p_xrwf1"
                          ></div>
                        </div>
                        <div
                          className="flex justify-between text-xs text-purple-600 mt-1"
                          data-oid="esu:-uy"
                        >
                          <span data-oid="ujywx17">1:15</span>
                          <span data-oid="dx:8jfc">{call.duration}</span>
                        </div>
                      </div>
                      <span
                        className="text-sm text-purple-700"
                        data-oid="eu9-2no"
                      >
                        Playing...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCalls.length === 0 && (
          <div className="text-center py-12" data-oid="awpfl6t">
            <Phone
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              data-oid="2hkr6t2"
            />
            <h3
              className="text-lg font-medium text-gray-900 mb-2"
              data-oid=":hvdhvp"
            >
              No calls found
            </h3>
            <p className="text-gray-600 mb-4" data-oid="9zyuaxf">
              Try adjusting your search or filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSentimentFilter("all");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              data-oid="-p507mv"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
