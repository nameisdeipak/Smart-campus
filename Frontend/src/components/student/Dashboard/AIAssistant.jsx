import { useState } from "react";
import axios from "axios";

import {
  Bot,
  MessageCircle,
  Mic,
  User,
  Sparkles,
  Volume2,
  Trash2,
} from "lucide-react";

function AIAssistant({ studentName }) {
  const [query, setQuery] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [listening, setListening] = useState(false);

  // ==========================================
  // TEXT TO SPEECH
  // ==========================================

  const speak = (text) => {
    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    speech.rate = 1;

    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  // ==========================================
  // ASK AI
  // ==========================================

  const askAI = async (customQuery = "") => {
    const finalQuery = customQuery.trim() || query.trim();

    if (!finalQuery) {
      return;
    }

    // USER MESSAGE

    setMessages((previous) => [
      ...previous,

      {
        type: "user",
        text: finalQuery,
      },
    ]);

    setQuery("");

    setLoading(true);

    try {
      const { data } = await axios.get("http://localhost:3000/api/ai", {
        params: {
          query: finalQuery,
        },
      });

      if (!data.success) {
        const errorMessage = "Sorry, I could not find the student.";

        setMessages((previous) => [
          ...previous,

          {
            type: "ai",
            text: errorMessage,
          },
        ]);

        speak(errorMessage);

        return;
      }

      // ==================================
      // NORMAL ANSWER
      // ==================================

      if (data.type !== "recommendation") {
        setMessages((previous) => [
          ...previous,

          {
            type: "ai",
            text: data.answer,
          },
        ]);

        speak(data.answer);
      }

      // ==================================
      // RECOMMENDATIONS
      // ==================================
      else {
        const recommendationText = data.recommendations
          .map((item, index) => `${index + 1}. ${item}`)
          .join("\n");

        setMessages((previous) => [
          ...previous,

          {
            type: "ai",
            text: recommendationText,
          },
        ]);

        speak(data.recommendations.join(". "));
      }
    } catch (error) {
      console.error("AI API Error:", error);

      const errorMessage =
        "AI server is not available. Please check the FastAPI server.";

      setMessages((previous) => [
        ...previous,

        {
          type: "ai",
          text: errorMessage,
        },
      ]);

      speak(errorMessage);
    }

    setLoading(false);
  };

  // ==========================================
  // VOICE RECOGNITION
  // ==========================================

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported. Please use Google Chrome.");

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;

      console.log("Voice:", spokenText);

      setListening(false);

      setQuery(spokenText);

      askAI(spokenText);
    };

    recognition.onerror = (event) => {
      console.error("Voice Error:", event.error);

      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  // ==========================================
  // CLEAR CHAT
  // ==========================================

  const clearChat = () => {
    setMessages([]);

    window.speechSynthesis?.cancel();
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="flex h-[450px] max-w-5.5xl flex-col rounded-2xl bg-slate-900 p-5 text-white">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3">
            <Bot size={23} />
          </div>

          <div>
            <h2 className="font-bold">Campus AI Assistant</h2>

            <p className="text-xs text-slate-400">
              Ask about {studentName}'s academics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1">
            <Sparkles size={12} className="text-emerald-400" />

            <span className="text-xs text-emerald-300">Online</span>
          </div>

          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ================================= */}
      {/* CHAT AREA */}
      {/* ================================= */}

      <div className="mt-5 h-[300px] overflow-y-auto space-y-3 pr-1 md:h-[350px]">
        {/* EMPTY STATE */}

        {messages.length === 0 && (
          <div className="rounded-xl bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-slate-300" />

              <p className="text-sm text-slate-300">
                Hi! I'm your Smart Campus AI Assistant.
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500">Try asking:</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => askAI("What is my attendance?")}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
              >
                Attendance
              </button>

              <button
                onClick={() => askAI("What is my performance?")}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
              >
                Performance
              </button>

              <button
                onClick={() => askAI("What is my risk?")}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
              >
                Risk
              </button>

              <button
                onClick={() => askAI("Give me study recommendations")}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs hover:bg-white/20"
              >
                Recommendations
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES */}

        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.type === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={`
                                    max-w-[85%]
                                    rounded-xl
                                    px-4
                                    py-3
                                    text-sm
                                    whitespace-pre-line
                                    ${
                                      message.type === "user"
                                        ? "bg-white text-slate-900"
                                        : "bg-white/10 text-slate-200"
                                    }
                                `}
            >
              <div className="mb-2 flex items-center gap-2">
                {message.type === "user" ? (
                  <User size={13} />
                ) : (
                  <Bot size={13} />
                )}

                <span className="text-xs opacity-60">
                  {message.type === "user" ? "You" : "Smart Campus AI"}
                </span>
              </div>

              <div>{message.text}</div>

              {/* AI SPEAK BUTTON */}

              {message.type === "ai" && (
                <button
                  onClick={() => speak(message.text)}
                  className="mt-3 flex items-center gap-1 text-xs text-slate-400 hover:text-white"
                >
                  <Volume2 size={14} />
                  Speak
                </button>
              )}
            </div>
          </div>
        ))}

        {/* LOADING */}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-sm text-slate-400">
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* INPUT */}
      {/* ================================= */}

      <div className="mt-5 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askAI();
            }
          }}
          placeholder="Ask about attendance, marks..."
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/30"
        />

        <button
          onClick={() => askAI()}
          disabled={loading || !query.trim()}
          className="rounded-xl bg-white px-4 text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MessageCircle size={19} />
        </button>
      </div>

      {/* ================================= */}
      {/* VOICE BUTTON */}
      {/* ================================= */}

      <button
        onClick={startVoice}
        disabled={listening}
        className={`
                    mt-3
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    py-3
                    text-sm
                    transition
                    ${
                      listening
                        ? "border-red-400/30 bg-red-500/10 text-red-300"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }
                `}
      >
        <Mic size={18} className={listening ? "animate-pulse" : ""} />

        {listening ? "Listening..." : "🎤 Talk to AI Assistant"}
      </button>
    </div>
  );
}

export default AIAssistant;
