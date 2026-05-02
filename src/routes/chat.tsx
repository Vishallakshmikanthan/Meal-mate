import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import { getBotResponse, SUGGESTED_QUESTIONS } from "@/lib/chatbot";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Mess Assistant — MealOps" },
      { name: "description", content: "Chat with Messy, your in-house mess assistant. Ask about today's menu, timings, high-protein picks and more." },
    ],
  }),
  component: ChatPage,
});

interface Msg { role: "user" | "bot"; text: string }

function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "bot", text: "Hi! I'm Messy 🌿 — ask me anything about today's menu, timings, or healthy picks." },
  ]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }, { role: "bot", text: getBotResponse(t) }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-5.5rem)] max-w-2xl mx-auto">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 glass border-b border-border px-5 pt-safe">
        <div className="py-3 flex items-center gap-3">
          <div className="size-10 rounded-2xl leaf-gradient text-primary-foreground flex items-center justify-center shadow-md">
            <Bot className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg leading-tight">Mess Assistant</h1>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--leaf)] animate-pulse" />
              Online · powered by your menu
            </div>
          </div>
          <Sparkles className="size-4 text-[var(--leaf)]" />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] whitespace-pre-wrap leading-relaxed shadow-sm animate-in fade-in-0 slide-in-from-bottom-1",
              m.role === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-br-md"
                : "bg-card border border-border text-card-foreground rounded-bl-md",
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* Quick chips */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-border bg-card/60">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0 text-[12px] px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 text-secondary-foreground border border-border min-tap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="px-3 py-3 border-t border-border bg-card flex gap-2 pb-safe"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the menu..."
          className="flex-1 text-sm px-4 py-3 rounded-2xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring min-tap"
        />
        <button
          type="submit"
          className="size-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 min-tap"
          aria-label="Send"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
