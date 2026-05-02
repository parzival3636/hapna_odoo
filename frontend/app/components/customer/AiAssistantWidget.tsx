"use client";

import { useState } from "react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
  actionCard?: {
    title: string;
    service: string;
    time: string;
  };
}

export function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  const mockMessages: Message[] = [
    {
      id: "1",
      sender: "user",
      text: "I'm looking for a premium spa slot this Friday.",
      time: "10:42 AM",
    },
    {
      id: "2",
      sender: "ai",
      text: "Certainly. Let me check the availability at our flagship spa for Friday...",
      time: "10:42 AM",
    },
    {
      id: "3",
      sender: "ai",
      text: "",
      time: "10:43 AM",
      actionCard: {
        title: "I found a slot for you!",
        service: "Royal Orchid Deep Tissue",
        time: "Fri, 4:00 PM - 5:30 PM",
      },
    },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] flex items-end justify-end p-6 md:p-8">
      <div className="relative flex flex-col items-end pointer-events-auto">
        {/* Chat Panel */}
        {isOpen && (
          <div className="w-[380px] h-[500px] mb-4 rounded-xl overflow-hidden flex flex-col shadow-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="p-4 bg-white/60 border-b border-indigo-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Hapna AI Assistant</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Online Now</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((msg) => (
                <div key={msg.id}>
                  {msg.sender === "user" ? (
                    <div className="flex flex-col items-end">
                      <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-none max-w-[85%] text-sm shadow-sm">
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{msg.time}</span>
                    </div>
                  ) : msg.actionCard ? (
                    <div className="flex flex-col items-start w-full">
                      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 w-full shadow-sm">
                        <h4 className="text-sm font-bold text-indigo-600 mb-2">{msg.actionCard.title}</h4>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs border-b border-slate-100 pb-2">
                            <span className="text-slate-500">Service:</span>
                            <span className="font-bold text-slate-900">{msg.actionCard.service}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Time:</span>
                            <span className="font-bold text-slate-900">{msg.actionCard.time}</span>
                          </div>
                        </div>
                        <button className="w-full bg-indigo-600 py-2.5 rounded-lg text-white text-xs font-bold uppercase tracking-wider hover:bg-indigo-700 transition-all">
                          Proceed to Booking
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{msg.time}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start">
                      <div className="bg-slate-50/80 border border-slate-200/80 text-slate-900 px-4 py-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm">
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-semibold uppercase">{msg.time}</span>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              <div className="flex items-center gap-1 bg-slate-50/80 border border-slate-200/80 px-3 py-2 rounded-full w-fit">
                <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/60 border-t border-indigo-50">
              <div className="relative">
                <input
                  className="w-full bg-white/80 border border-indigo-100 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 pr-12 placeholder:italic outline-none"
                  placeholder="Ask about services..."
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button className="absolute right-2 top-2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                </button>
              </div>
              <div className="mt-3 text-center">
                <a className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-600/30 hover:border-indigo-600 transition-all cursor-pointer" href="/services">
                  Try the booking form instead
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <div className="relative group">
          {/* Unread Badge */}
          {!isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10 border-2 border-white">
              2
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all duration-300 relative z-0"
            style={{
              boxShadow: isOpen ? "0 4px 20px rgba(79, 70, 229, 0.3)" : "0 0 0 0 rgba(79, 70, 229, 0.4)",
              animation: isOpen ? "none" : "pulse-fab 2s infinite",
            }}
          >
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isOpen ? "close" : "chat"}
            </span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-fab {
          0% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(79, 70, 229, 0); }
          100% { box-shadow: 0 0 0 0 rgba(79, 70, 229, 0); }
        }
      `}} />
    </div>
  );
}
