"use client";

import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Pusher from 'pusher-js';

export default function ConversationsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState("recent"); // "recent" or "groups"
  const messagesEndRef = useRef(null);

  // Pusher instance reference
  const pusherRef = useRef(null);

  // Initialize Pusher and fetch conversations
  useEffect(() => {
    console.log('ConversationsPage useEffect running...');
    
    // Initialize Pusher
    pusherRef.current = new Pusher('f1f929da8fd632930b80', {
      cluster: 'ap2'
    });

    // Subscribe to the conversations channel
    const channel = pusherRef.current.subscribe('my-channel');
    
    // Listen for new messages
    channel.bind('new-message', (data) => {
      console.log('New message received:', data);
      
      // Update conversations with new message
      setConversations(prev => {
        const updatedConversations = [...prev];
        
        // Find conversation by phone number
        const convIndex = updatedConversations.findIndex(conv => 
          conv.phone === data.phone
        );
        
        if (convIndex !== -1) {
          // Update existing conversation
          const newMessage = {
            id: Date.now().toString(),
            sender: data.sender,
            text: data.message,
            time: data.time,
            phone: data.phone
          };
          
          updatedConversations[convIndex] = {
            ...updatedConversations[convIndex],
            lastMessage: data.message,
            time: data.time,
            messages: [...updatedConversations[convIndex].messages, newMessage]
          };
          
          // Move conversation to top
          const updatedConv = updatedConversations.splice(convIndex, 1)[0];
          updatedConversations.unshift(updatedConv);
        } else {
          // Create new conversation if doesn't exist
          const newConversation = {
            id: Date.now().toString(),
            client: data.sender_name || `Contact ${data.phone}`,
            phone: data.phone,
            lastMessage: data.message,
            time: data.time,
            status: 'pending',
            unread: data.sender === 'client' ? 1 : 0,
            tag: 'Regular',
            messages: [{
              id: Date.now().toString(),
              sender: data.sender,
              text: data.message,
              time: data.time,
              phone: data.phone
            }]
          };
          
          updatedConversations.unshift(newConversation);
        }
        
        return updatedConversations;
      });
    });

    // Fetch initial conversations
    fetchConversations();

    // Cleanup
    return () => {
      if (pusherRef.current) {
        pusherRef.current.unsubscribe('my-channel');
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      console.log('Fetching conversations from /api/conversations...');
      const response = await fetch(`/api/conversations`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Conversations fetched:', data);
        console.log('Setting conversations state...');
        setConversations(data);
        
        // Set first conversation as selected if available
        if (data.length > 0) {
          setSelectedConversation(data[0].id);
          console.log('Selected conversation:', data[0].id);
        }
      } else {
        console.error('Failed to fetch conversations:', response.status);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      console.log('Setting loading to false...');
      setLoading(false);
      
      // Force a re-render after a short delay
      setTimeout(() => {
        console.log('Force re-render after data fetch');
        setLoading(false);
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    
    const selectedConv = conversations.find(c => c.id === selectedConversation);
    if (!selectedConv) return;

    try {
      setSending(true);
      
      const response = await fetch(`/api/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: selectedConv.phone,
          message: message.trim(),
        }),
      });

      if (response.ok) {
        // Message sent successfully
        setMessage("");
        
        // The message will be updated via Pusher event
        console.log('Message sent successfully');
      } else {
        const errorData = await response.json();
        console.error('Failed to send message:', errorData);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  // Filter conversations based on active tab
  const filteredConversations = conversations.filter(conv => {
    if (activeTab === "recent") {
      return conv.tag === "Regular" || conv.tag === "VIP";
    } else {
      return conv.tag === "Group";
    }
  });

  if (loading) {
    console.log('Still loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Sidebar darkMode={darkMode} />
        <div className="lg:ml-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log(`Rendering with ${conversations.length} conversations, activeTab: ${activeTab}`);

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? "bg-gradient-serena-dark"
          : "bg-gradient-to-br from-purple-50 via-white to-pink-50"
      }`}
      data-oid="ab1c.n5"
    >
      {/* Sidebar */}
      <Sidebar darkMode={darkMode} data-oid="h7atjo-" />

      {/* Main Content */}
      <div className="lg:ml-64" data-oid="k6h4o_x">
        {/* Header */}
        <header
          className={`border-b transition-all duration-300 backdrop-blur-sm ${
            darkMode
              ? "bg-gray-800/90 border-gray-700"
              : "bg-white/80 border-purple-100"
          }`}
          data-oid="nu66asi"
        >
          <div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            data-oid="jecddw1"
          >
            <div
              className="flex items-center justify-between h-16"
              data-oid="2prwcmq"
            >
              <div
                className="flex items-center space-x-4 lg:ml-0 ml-12"
                data-oid="6-otkvv"
              >
                <h1
                  className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  data-oid="t0-g1:y"
                >
                  WhatsApp Conversations
                </h1>
              </div>
            </div>
          </div>
        </header>

        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          data-oid="3_3:qsn"
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]"
            data-oid="5ns-8m6"
          >
            {/* Conversations List */}
            <div
              className={`rounded-xl shadow-sm border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="6n7vxkf"
            >
              <div
                className="p-4 border-b border-gray-200 dark:border-gray-700"
                data-oid="hgncdrh"
              >
                <div className="relative" data-oid="2gs0dzw">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    data-oid="qi21ano"
                  />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                        : "border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500"
                    }`}
                    data-oid="d2o-18t"
                  />
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab("recent")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "recent"
                        ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    Recent Messages
                    {conversations.filter(c => c.tag === "Regular" || c.tag === "VIP").length > 0 && (
                      <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                        {conversations.filter(c => c.tag === "Regular" || c.tag === "VIP").length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("groups")}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === "groups"
                        ? "bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    }`}
                  >
                    Group Chats
                    {conversations.filter(c => c.tag === "Group").length > 0 && (
                      <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                        {conversations.filter(c => c.tag === "Group").length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Conversations List */}
              <div className="overflow-y-auto h-full" data-oid="4r2l6y0">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => {
                    console.log('Rendering conversation:', conv);
                    return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedConversation === conv.id
                          ? "bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-500"
                          : ""
                      }`}
                      data-oid="r:.ywu."
                    >
                      <div
                        className="flex items-start space-x-3"
                        data-oid="d7vdgev"
                      >
                        <div
                          className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium relative"
                          data-oid="cvce3n8"
                        >
                          {conv.client.charAt(0).toUpperCase()}
                          {conv.tag === "Group" && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M22 11v6"/>
                                <path d="M19 14h6"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0" data-oid="-j7x82o">
                          <div
                            className="flex items-center justify-between"
                            data-oid="mf57-vv"
                          >
                            <h3
                              className={`font-medium truncate ${darkMode ? "text-white" : "text-gray-900"}`}
                              data-oid="ij.ee_k"
                            >
                              {conv.client}
                            </h3>
                            <span
                              className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                              data-oid="w972q6o"
                            >
                              {conv.time}
                            </span>
                          </div>
                          <p
                            className={`text-sm truncate mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            data-oid="xexm4hw"
                          >
                            {conv.lastMessage}
                          </p>
                          <div
                            className="flex items-center justify-between mt-2"
                            data-oid="uk-20zr"
                          >
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  conv.tag === "VIP"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                }`}
                                data-oid="4px.h:s"
                              >
                                {conv.tag}
                              </span>
                              <span className="text-xs text-blue-600 font-medium">
                                {conv.phone || 'No phone'}
                              </span>
                            </div>
                            {conv.unread > 0 && (
                              <span
                                className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                                data-oid="uwgn51e"
                              >
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      {activeTab === "recent" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-500">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-purple-500">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M22 11v6"/>
                          <path d="M19 14h6"/>
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {activeTab === "recent" ? "No recent messages" : "No group chats"}
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      {activeTab === "recent" 
                        ? "Start a conversation or wait for incoming messages" 
                        : "No group conversations found"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Interface */}
            <div
              className={`lg:col-span-2 rounded-xl shadow-sm border flex flex-col ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-purple-100"
              }`}
              data-oid="77::mgw"
            >
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div
                    className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                    data-oid="jn.lfod"
                  >
                    <div
                      className="flex items-center space-x-3"
                      data-oid="tiz4_.d"
                    >
                      <div
                        className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium"
                        data-oid="6wm7n-g"
                      >
                        {selectedConv.client.charAt(0)}
                      </div>
                      <div data-oid=":ob.2ni">
                        <h3
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                          data-oid="zbk074r"
                        >
                          {selectedConv.client}
                        </h3>
                        <p
                          className="text-sm text-green-600"
                          data-oid="ewkwn.0"
                        >
                          Online
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-oid="14-bvfr"
                    >
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        data-oid="b.8:6ok"
                      >
                        <Phone
                          className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="d.9nvso"
                        />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        data-oid="m4gk4mo"
                      >
                        <Video
                          className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="1-66cis"
                        />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        data-oid=".aiiyqw"
                      >
                        <MoreVertical
                          className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="pkq-y_k"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                    data-oid="pz.6x0x"
                  >
                    {selectedConv?.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "client" ? "justify-start" : "justify-end"}`}
                        data-oid="d.zqr.4"
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender === "client"
                              ? darkMode
                                ? "bg-gray-700 text-gray-100"
                                : "bg-gray-100 text-gray-900"
                              : "bg-purple-500 text-white"
                          }`}
                          data-oid="l-zck.l"
                        >
                          <p className="text-sm" data-oid="59r4cgh">
                            {msg.text}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.sender === "client"
                                ? darkMode
                                  ? "text-gray-400"
                                  : "text-gray-500"
                                : "text-purple-100"
                            }`}
                            data-oid="6_-y1z_"
                          >
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {selectedConv?.messages?.length === 0 && (
                      <div className="text-center py-8">
                        <p className={`text-gray-500 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div
                    className="p-4 border-t border-gray-200 dark:border-gray-700"
                    data-oid="0237ubl"
                  >
                    <div
                      className="flex items-center space-x-2"
                      data-oid="iury7zk"
                    >
                      <button
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                        }`}
                        data-oid="fhgo_5z"
                      >
                        <Paperclip
                          className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                          data-oid="2x6id0a"
                        />
                      </button>
                      <div className="flex-1 relative" data-oid="5kftjfe">
                        <input
                          type="text"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          disabled={sending || !selectedConv}
                          className={`w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                            darkMode
                              ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                              : "border-gray-200 bg-white text-gray-900 placeholder-gray-500"
                          }`}
                          data-oid="ltv.khf"
                        />

                        <button
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded transition-colors ${
                            darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                          }`}
                          data-oid="j4i6n1m"
                        >
                          <Smile
                            className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
                            data-oid=".hr2q_4"
                          />
                        </button>
                      </div>
                      <button
                        onClick={sendMessage}
                        disabled={!message.trim() || sending || !selectedConv}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          sending
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-purple-500 hover:bg-purple-600"
                        } text-white`}
                        data-oid="30tsi8:"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" data-oid="8pd2f_3" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Select a conversation
                    </h3>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Choose a conversation from the list to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
