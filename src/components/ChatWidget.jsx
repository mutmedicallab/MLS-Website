import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE_URL } from "../config/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything about MUTMLSA — meetings, joining, events, fees, whatever." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: newMessages
            .slice(0, -1)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant. Try emailing machajse608@gmail.com instead." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-coral-500 text-paper shadow-lg"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-5 z-[90] flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-sm border border-ink/10 bg-paper shadow-2xl dark:border-dark-border dark:bg-dark-bg"
          >
            <div className="flex items-center gap-2.5 border-b border-ink/10 bg-lab-900 px-4 py-3 dark:border-dark-border">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-coral-500 text-paper">
                <ChatIcon />
              </div>
              <p className="label-tag text-lab-500">MUTMLSA Assistant</p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-sm px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-lab-800 text-paper"
                      : "bg-lab-50 text-ink dark:bg-dark-surface/60 dark:text-dark-ink"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: (props) => (
                          
                            <a{...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-coral-500 hover:text-coral-600"
                          />
                        ),
                        p: (props) => <p {...props} className="mb-1 last:mb-0" />,
                        ul: (props) => <ul {...props} className="list-disc pl-4 space-y-0.5" />,
                        ol: (props) => <ol {...props} className="list-decimal pl-4 space-y-0.5" />,
                        strong: (props) => <strong {...props} className="font-semibold" />,
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              ))}
              {loading && (
                <div className="w-fit rounded-sm bg-lab-50 px-3 py-2 text-sm text-ink-soft dark:bg-dark-surface/60 dark:text-dark-ink-soft">
                  Thinking…
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-ink/10 p-3 dark:border-dark-border">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                className="flex-1 rounded-sm border border-ink/15 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-lab-600 focus:outline-none dark:border-dark-border dark:text-dark-ink"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-sm bg-coral-500 px-3 py-2 text-sm font-semibold text-paper transition-colors hover:bg-coral-600 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <line x1="12" y1="8" x2="12" y2="4" />
      <circle cx="12" cy="3" r="1.2" fill="currentColor" />
      <circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <line x1="9" y1="17" x2="15" y2="17" />
      <line x1="4" y1="12" x2="1.5" y2="12" />
      <line x1="20" y1="12" x2="22.5" y2="12" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}