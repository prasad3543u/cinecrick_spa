import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, X, Send, Bot, Sparkles, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "How do I book a ground?",
  "What are the slot timings?",
  "What is the cancellation policy?",
  "Show me available grounds",
  "What's included in my booking?",
  "Weekend pricing?",
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  async function sendMessage(text) {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg = { role: "user", content: messageText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Send conversation history for context
      const history = newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api("/ai/chat", {
        method: "POST",
        body: {
          message: messageText,
          history: history.slice(0, -1), // exclude current message
        },
      });

      setMessages((prev) => [...prev, {
        role: "bot",
        content: response.response || "Sorry, I couldn't get a response.",
      }]);
    } catch (err) {
      toast.error("Failed to get response. Please try again.");
      setMessages((prev) => [...prev, {
        role: "bot",
        content: "Sorry, I'm having trouble connecting. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all"
        >
          <Bot className="h-5 w-5" />
          <span className="text-sm font-bold">Ask AI</span>
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[560px] bg-zinc-950 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">CrickOps AI</h3>
                <p className="text-xs text-emerald-400">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  className="text-white/30 hover:text-white/60 text-xs transition"
                >
                  Clear
                </button>
              )}
              <button onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-4">
                <Sparkles className="h-10 w-10 mx-auto mb-3 text-emerald-400/40" />
                <p className="text-white/70 text-sm font-semibold">Hi! I'm CrickOps AI</p>
                <p className="text-white/40 text-xs mt-1">
                  Ask me anything about grounds, bookings, or cricket!
                </p>
                <div className="mt-4 space-y-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="block w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent text-sm text-white/60 hover:text-white transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "bot" && (
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-2 mt-1 shrink-0">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-br-sm"
                    : "bg-white/10 text-white rounded-bl-sm"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-2 shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-sm h-10 focus-visible:ring-emerald-500/40"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 h-10 w-10 p-0 shrink-0 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-white/20 mt-2">Powered by Google Gemini</p>
          </div>
        </div>
      )}
    </>
  );
}