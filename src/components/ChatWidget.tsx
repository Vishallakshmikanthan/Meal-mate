import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Sparkles } from "lucide-react";
import { getBotResponse, SUGGESTED_QUESTIONS } from "@/lib/chatbot";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "bot";
  text: string;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "bot",
      text: "Hi! I'm Messy 🌿 — ask me anything about today's menu, timings, or healthy picks.",
    },
  ]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, { role: "user", text: t }, { role: "bot", text: getBotResponse(t) }]);
    setInput("");
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "fixed z-50 bottom-20 lg:bottom-6 right-6 size-14 rounded-full leaf-gradient text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-105",
        )}
        aria-label="Open mess assistant"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-6" />}
      </button>

      {open && (
        <div className="fixed z-50 bottom-36 lg:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] rounded-2xl bg-card border border-border ink-shadow flex flex-col overflow-hidden">
          <div className="px-4 py-3 leaf-gradient text-primary-foreground flex items-center gap-2">
            <Sparkles className="size-4" />
            <div>
              <div className="font-display text-base leading-tight">Mess Assistant</div>
              <div className="text-[10px] opacity-80">Powered by your menu, no AI bills</div>
            </div>
          </div>

          <div ref={scrollerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm",
                )}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-border">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-secondary hover:bg-secondary/70 text-secondary-foreground"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="p-3 border-t border-border flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu..."
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
