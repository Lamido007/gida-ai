"use client";

import { useState, useRef, useEffect } from "react";

const LANGUAGES = [
  { code: "en", label: "English", greeting: "How can I help you today?" },
  { code: "ha", label: "Hausa", greeting: "Yaya zan iya taimaka maka yau?" },
  { code: "yo", label: "Yoruba", greeting: "Bawo ni mo se le ran o lowo loni?" },
  { code: "ig", label: "Igbo", greeting: "Kedu ka m ga-esi nyere gi aka taa?" },
  { code: "pcm", label: "Pidgin", greeting: "How I fit help you today?" },
];

const MODULES = [
  { id: "digital", icon: "📱", labels: { en: "Digital Literacy", ha: "Ilimin Dijital", yo: "Imo Imo-ero", ig: "Omumu Dijitalu", pcm: "Digital Learning" } },
  { id: "financial", icon: "💰", labels: { en: "Financial Guide", ha: "Jagorar Kudi", yo: "Itonisona Owo", ig: "Nduzi Ego", pcm: "Money Guide" } },
  { id: "farming", icon: "🌾", labels: { en: "Farmers Assistant", ha: "Mataimakin Manomi", yo: "Oluranlo Agbe", ig: "Onye Enyemaka Ugbo", pcm: "Farmer Helper" } },
  { id: "education", icon: "📚", labels: { en: "Education Helper", ha: "Taimako na Ilimi", yo: "Oluranlo Eko", ig: "Onye Enyemaka Agumakwukwo", pcm: "Education Help" } },
  { id: "jobs", icon: "💼", labels: { en: "Jobs & Skills", ha: "Jagorar Ayyukan Aiki", yo: "Itonisona Ise", ig: "Nduzi Oru", pcm: "Jobs Guide" } },
];

type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [language, setLanguage] = useState("en");
  const [selectedModule, setSelectedModule] = useState("digital");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/chat-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          language: language,
          module: selectedModule,
        }),
      });

      const data = await res.json();

      if (data.content) {
        setMessages(prev => [...prev, { role: "assistant", content: data.content }]);
      } else if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Error: " + data.error }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text: string) => {
    const langMap: Record<string, string> = {
      en: "en-NG",
      ha: "ha",
      yo: "yo",
      ig: "ig",
      pcm: "en-NG",
    };
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langMap[language] || "en-NG";
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-green-900 text-white px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🏠</span>
            <div>
              <h1 className="text-xl font-bold text-yellow-400">Gida AI 🇳🇬</h1>
              <p className="text-xs text-green-200">Your Community Digital Voice</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  language === lang.code
                    ? "bg-yellow-400 text-green-900"
                    : "bg-green-800 text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">

        {/* Home Screen */}
        {!chatOpen ? (
          <>
            {/* Welcome Card */}
            <div className="bg-green-900 text-white rounded-2xl p-5 mb-4 text-center">
              <p className="text-3xl mb-2">🏠</p>
              <p className="text-yellow-400 font-semibold text-lg mb-1">
                {currentLang.greeting}
              </p>
              <p className="text-green-300 text-sm mb-3">
                Powered by Claude AI
              </p>
              <button
                onClick={() => setChatOpen(true)}
                className="bg-yellow-400 text-green-900 font-bold px-6 py-2 rounded-full"
              >
                💬 Start Chat
              </button>
            </div>

            {/* Module Selector */}
            <p className="text-gray-500 text-xs font-semibold uppercase mb-2 tracking-wide">
              Choose a Topic
            </p>
            <div className="space-y-2">
              {MODULES.map(mod => (
                <button
                  key={mod.id}
                  onClick={() => {
                    setSelectedModule(mod.id);
                    setChatOpen(true);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                    selectedModule === mod.id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="text-2xl">{mod.icon}</span>
                  <span className="font-semibold text-green-900">
                    {mod.labels[language as keyof typeof mod.labels] || mod.labels.en}
                  </span>
                  <span className="ml-auto text-yellow-500 text-lg">›</span>
                </button>
              ))}
            </div>

            <p className="text-center text-gray-400 text-xs mt-6">
              Built for Nigeria 🇳🇬 by Sadiq Lamido
            </p>
          </>
        ) : (

          /* Chat Screen */
          <div className="flex flex-col" style={{ height: "calc(100vh - 140px)" }}>

            {/* Chat Header */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setChatOpen(false)}
                className="text-green-900 font-semibold text-sm"
              >
                ← Back
              </button>
              <span className="text-lg">
                {MODULES.find(m => m.id === selectedModule)?.icon}
              </span>
              <span className="text-green-900 font-semibold text-sm">
                {MODULES.find(m => m.id === selectedModule)?.labels[language as keyof typeof MODULES[0]["labels"]] || selectedModule}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-16">
                  <p className="text-4xl mb-3">🏠</p>
                  <p className="text-sm">{currentLang.greeting}</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-yellow-400 text-green-900"
                        : "bg-green-900 text-white"
                    }`}
                  >
                    <p className="leading-relaxed">{msg.content}</p>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speak(msg.content)}
                        className="text-green-300 text-xs mt-2 flex items-center gap-1"
                      >
                        🔊 Listen
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-green-900 text-white rounded-2xl px-4 py-3 text-sm">
                    <span className="animate-pulse">Thinking...</span>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2 pb-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder={
                  language === "ha" ? "Rubuta sakonka..." :
                  language === "yo" ? "Kọ ifiranṣẹ rẹ..." :
                  language === "ig" ? "Dee ozi gị..." :
                  language === "pcm" ? "Type your message..." :
                  "Type your message..."
                }
                className="flex-1 border-2 border-green-900 rounded-full px-4 py-2 text-sm outline-none focus:border-yellow-400"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-green-900 text-white rounded-full px-4 py-2 text-sm font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
