import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Mic,
  Send,
  Sparkles,
  Trash2,
  User,
  Volume2,
} from "lucide-react";
import axiosClient from "../../../services/axiosClient";

const suggestions = [
  ["How is my attendance?", "What is my attendance?"],
  ["Explain my marks", "How am I doing in my subjects?"],
  ["What fees are due?", "How much fee do I still need to pay?"],
  ["Help me make a study plan", "Give me a study plan based on my performance"],
];

function AIAssistant({ studentName = "your" }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    window.speechSynthesis.speak(speech);
  };

  const askAI = async (customQuery) => {
    const question = (customQuery ?? query).trim();
    if (!question || loading) return;

    const userMessage = { role: "user", content: question };
    const history = [...messages, userMessage].slice(-40);
    while (history[0]?.role !== "user") history.shift();

    setMessages(history);
    setQuery("");
    setError("");
    setLoading(true);

    try {
      const { data } = await axiosClient.post("/student/ai/chat", {
        messages: history.map(({ role, content }) => ({ role, content })),
      });

      if (!data.success || !data.answer) {
        throw new Error(data.message || "AI Assistant could not answer");
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: data.answer },
      ]);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        "Could not reach the AI Assistant. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. You can type instead.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      void askAI(event.results[0][0].transcript);
    };
    recognition.onerror = () => {
      setError("Voice input could not be started. Please type your question.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
    window.speechSynthesis?.cancel();
  };

  return (
    <section className="flex h-[min(680px,75vh)] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-slate-900 p-2.5 text-white">
            <Bot size={22} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-bold text-slate-900">
              Campus AI Assistant
            </h2>
            <p className="text-xs text-slate-500">
              Ask about {studentName} academics, attendance or fees
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex">
            <Sparkles size={13} />
            Gemini
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              disabled={loading}
              aria-label="Clear chat"
              title="Clear chat"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </header>

      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 sm:mt-10">
            <div className="flex items-center gap-2 text-slate-900">
              <Bot size={19} />
              <p className="font-semibold">Hi! What would you like help with?</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              I can answer using the academic information in your campus account.
              Try one of these:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map(([label, question]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => void askAI(question)}
                  disabled={loading}
                  className="rounded-full border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-end gap-2 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <span className="mb-1 rounded-full bg-slate-200 p-2 text-slate-700">
                  <Bot size={15} />
                </span>
              )}
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${
                  isUser
                    ? "rounded-br-md bg-slate-900 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => speak(message.content)}
                    aria-label="Read answer aloud"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-slate-700"
                  >
                    <Volume2 size={13} />
                    Listen
                  </button>
                )}
              </div>
              {isUser && (
                <span className="mb-1 rounded-full bg-slate-900 p-2 text-white">
                  <User size={15} />
                </span>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-end gap-2">
            <span className="mb-1 rounded-full bg-slate-200 p-2 text-slate-700">
              <Bot size={15} />
            </span>
            <p className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              Thinking...
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void askAI();
        }}
        className="border-t border-slate-100 bg-white p-4 sm:p-5"
      >
        {error && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={3000}
            disabled={loading}
            aria-label="Ask the AI Assistant"
            placeholder="Ask about your attendance, marks, fees..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:bg-white disabled:opacity-60"
          />
          <button
            type="button"
            onClick={startVoice}
            disabled={loading || listening}
            aria-label="Ask using voice"
            title={listening ? "Listening..." : "Ask using voice"}
            className={`rounded-xl border p-3 transition disabled:opacity-50 ${
              listening
                ? "border-red-200 bg-red-50 text-red-600"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Mic size={18} className={listening ? "animate-pulse" : ""} />
          </button>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            aria-label="Send message"
            className="rounded-xl bg-slate-900 p-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <MessageCircle size={18} /> : <Send size={18} />}
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Uses your campus records. Check important decisions with your campus
          office.
        </p>
      </form>
    </section>
  );
}

export default AIAssistant;
