import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await api("/ai/chat", {
        method: "POST",
        body: { message: input }
      });
      
      const botMessage = { role: "bot", content: response.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-pink-500 to-violet-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[550px] bg-zinc-900 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-pink-500/10 to-violet-500/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">CrickOps AI Assistant</h3>
            <p className="text-xs text-white/50">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/50 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-pink-400/50" />
            <p className="text-white/70 text-sm">Hi! I'm your AI assistant.</p>
            <p className="text-white/50 text-xs mt-1">
              Ask me about grounds, bookings, or anything cricket!
            </p>
            <div className="mt-4 space-y-2">
              <SuggestionChip text="Recommend a ground near Bangalore" onClick={() => setInput("Recommend a ground near Bangalore")} />
              <SuggestionChip text="What's your cancellation policy?" onClick={() => setInput("What's your cancellation policy?")} />
              <SuggestionChip text="How do I book a slot?" onClick={() => setInput("How do I book a slot?")} />
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                  : "bg-white/10 text-white"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-black/40 border-white/10 text-white placeholder:text-white/40"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-pink-500 to-violet-500 hover:opacity-90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 transition"
    >
      {text}
    </button>
  );
}