"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ─── Constants ───────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: "en", label: "English", greeting: "Welcome" },
  { code: "ha", label: "Hausa", greeting: "Sannu" },
  { code: "yo", label: "Yoruba", greeting: "Ẹ káàbọ̀" },
  { code: "ig", label: "Igbo", greeting: "Nnọọ" },
  { code: "pcm", label: "Pidgin", greeting: "Welcome" },
];

const LANG_BCP47: Record<string, string> = {
  en: "en-NG", ha: "ha", yo: "yo", ig: "ig", pcm: "en-NG",
};

const MODULES = [
  {
    id: "digital", icon: "📱",
    en: { title: "Digital Literacy", desc: "Internet, phones, online safety, digital payments" },
    ha: { title: "Ilimin Dijital", desc: "Intanet, wayoyi, amincin kan layi, biyan kuɗi" },
    yo: { title: "Ìmọ̀ Àgbéròjò", desc: "Íńtánẹ́ẹ̀tì, fóònù, ààbò orí ayélujára" },
    ig: { title: "Ọmụmụ Dijitalụ", desc: "Ịntanetị, ekwentị, nchekwa na ịntanetị" },
    pcm: { title: "Digital Learning", desc: "Internet, phone, online safety, digital money" },
  },
  {
    id: "financial", icon: "💰",
    en: { title: "Financial Guide", desc: "Savings, loans, investments, avoid fraud" },
    ha: { title: "Jagorar Kuɗi", desc: "Tattara kuɗi, rance, zuba jari, guji zamba" },
    yo: { title: "Ìtọ́nisọ̀na Owó", desc: "Àpamọ owó, gbèsè, idokowo, yẹra fún jibìtì" },
    ig: { title: "Nduzi Ego", desc: "Ịchekwa ego, mbọrọ, itinye ego, zọchaa aghụghọ" },
    pcm: { title: "Money Guide", desc: "Save money, loan, investment, avoid fraud" },
  },
  {
    id: "farming", icon: "🌾",
    en: { title: "Farmers Assistant", desc: "Crops, soil, government programs, agritech" },
    ha: { title: "Mataimakin Manomi", desc: "Amfanin gona, ƙasa, shirye-shiryen gwamnati" },
    yo: { title: "Olùrànlọ́wọ́ Àgbẹ̀", desc: "Àwọn irúgbìn, ilẹ̀, ètò ìjọba, imọ̀-ẹ̀rọ àgbẹ̀" },
    ig: { title: "Onye Enyemaka Ugbo", desc: "Ihe ọkụkụ, ala, mmemme gọọmentị, teknọlọjị ugbo" },
    pcm: { title: "Farmer Helper", desc: "Crops, soil, government farm programs, agri-tech" },
  },
  {
    id: "education", icon: "📚",
    en: { title: "Education Helper", desc: "WAEC, JAMB, scholarships, vocational training" },
    ha: { title: "Taimako na Ilimi", desc: "WAEC, JAMB, tallafin karatu, horo" },
    yo: { title: "Olùrànlọ́wọ́ Ẹ̀kọ́", desc: "WAEC, JAMB, sikolashipi, ikẹ́kọ̀ọ́ iṣẹ́" },
    ig: { title: "Onye Enyemaka Agụmakwụkwọ", desc: "WAEC, JAMB, ọtụtụ mmụta, ọzụzụ ọrụ" },
    pcm: { title: "Education Help", desc: "WAEC, JAMB, scholarship, vocational training" },
  },
  {
    id: "jobs", icon: "💼",
    en: { title: "Jobs Guide", desc: "CV writing, job search, entrepreneurship, skills" },
    ha: { title: "Jagorar Ayyukan Aiki", desc: "Rubutun CV, neman aiki, kasuwanci, ƙwarewa" },
    yo: { title: "Ìtọ́nisọ̀na Iṣẹ́", desc: "Kíkọ CV, wíwá iṣẹ́, iṣòwò, àwọn ọgbọ́n" },
    ig: { title: "Nduzi Ọrụ", desc: "Ide CV, ịchọ ọrụ, azụmahịa, nkà na ọgụgụ isi" },
    pcm: { title: "Jobs Guide", desc: "Write CV, find job, business, skills training" },
  },
];

const PLACEHOLDERS: Record<string, string> = {
  en: "Ask me anything...",
  ha: "Tambaye ni wani abu...",
  yo: "Béèrè ohun kan lọ́wọ́ mi...",
  ig: "Jụọ m ihe ọ bụla...",
  pcm: "Ask me anything...",
};

const MODULE_PROMPTS: Record<string, Record<string, string>> = {
  digital: { en: "How can I help with digital literacy today?", ha: "Ta yaya zan taimake ku game da ilimin dijital yau?", yo: "Báwo ni mo ṣe lè ràn yín lọ́wọ́ pẹ̀lú ìmọ̀ àgbéròjò lónìí?", ig: "Kedu ka m ga-si inyere gị aka na ọmụmụ dijitalụ taa?", pcm: "How I fit help you with digital things today?" },
  financial: { en: "What financial questions can I help you with?", ha: "Wace tambayoyi game da kuɗi zan iya taimaka muku?", yo: "Àwọn ìbéèrè owó wo ni mo lè ràn yín lọ́wọ́?", ig: "Kedu ajụjụ ego m ga-esi nyere gị aka?", pcm: "Wetin money question you wan ask?" },
  farming: { en: "What farming questions can I help you with today?", ha: "Wace tambayoyi game da noma zan iya amsa?", yo: "Àwọn ìbéèrè àgbẹ̀ wo ni mo lè ràn yín lọ́wọ́?", ig: "Kedu ajụjụ ugbo m ga-esi nyere gị aka taa?", pcm: "Wetin farm question you wan ask today?" },
  education: { en: "How can I support your education journey?", ha: "Ta yaya zan tallafa muku a tafiyar ilimi?", yo: "Báwo ni mo ṣe lè ṣètìlẹ́yìn ìrìn àjò ẹ̀kọ́ yín?", ig: "Kedu ka m ga-si akwado ụzọ agụmakwụkwọ gị?", pcm: "How I fit help your education journey?" },
  jobs: { en: "What career help do you need today?", ha: "Wace taimako game da aiki kuke bukata?", yo: "Àtìlẹ́yìn iṣẹ́ àtọwọ́dọ̀wọ́ wo ni ẹ nílò?", ig: "Kedu enyemaka ọrụ ị chọrọ taa?", pcm: "Wetin work help you need today?" },
};

const QUICK_PROMPTS: Record<string, Record<string, string[]>> = {
  digital: { en: ["How do I use OPay?", "How to avoid online scams?", "What is data bundle?"], ha: ["Yadda ake amfani da OPay?", "Yadda ake guji zamba?", "Menene data bundle?"], yo: ["Báwo ni mo ṣe lè lo OPay?", "Báwo ni mo ṣe lè yẹra fún jibìtì?", "Kíni data bundle?"], ig: ["Kedu ka m ga-esi jiri OPay?", "Kedu ka m ga-esi zọchaa aghụghọ?", "Gịnị bụ data bundle?"], pcm: ["How I go use OPay?", "How to avoid online scam?", "Wetin be data bundle?"] },
  financial: { en: ["How do I open a bank account?", "Best way to save money?", "What is microfinance?"], ha: ["Yadda ake buɗe asusun banki?", "Mafi kyawun hanyar tattara kuɗi?", "Menene microfinance?"], yo: ["Báwo ni mo ṣe ṣí àkáǹtì bánkì?", "Ọ̀nà tó dára jùlọ láti pamọ́ owó?", "Kíni microfinance?"], ig: ["Kedu ka m ga-esi mepee akaụntụ ụlọ akụ?", "Ụzọ kachasị mma ịchekwa ego?", "Gịnị bụ microfinance?"], pcm: ["How I go open bank account?", "Best way to save money?", "Wetin be microfinance?"] },
  farming: { en: ["Best crops in dry season?", "How to get fertilizer subsidy?", "Anchor Borrowers program?"], ha: ["Mafi kyawun amfanin gona a lokacin rani?", "Yadda ake samun taimakon taki?", "Shiryen Anchor Borrowers?"], yo: ["Àwọn irúgbìn tó dára jùlọ ní àkókò ẹ̀rẹ̀?", "Báwo ni mo ṣe gba ìràwọ̀ fertilizer?", "Ètò Anchor Borrowers?"], ig: ["Ihe ọkụkụ kacha mma n'oge okpomọkụ?", "Kedu ka m ga-esi nweta nkwado fertilizer?", "Mmemme Anchor Borrowers?"], pcm: ["Best crops for dry season?", "How to get fertilizer subsidy?", "Wetin be Anchor Borrowers?"] },
  education: { en: ["How to register for JAMB?", "Available scholarships?", "NYSC requirements?"], ha: ["Yadda ake rajista don JAMB?", "Wane tallafin karatu ake da shi?", "Abin da ake bukata don NYSC?"], yo: ["Báwo ni mo ṣe forúkọ sílẹ̀ fún JAMB?", "Àwọn sikolashipi tó wà?", "Ohun tó nílò fún NYSC?"], ig: ["Kedu ka m ga-esi debanye aha maka JAMB?", "Ọtụtụ mmụta dị?", "Ihe achọrọ maka NYSC?"], pcm: ["How to register for JAMB?", "Wetin scholarship dey?", "NYSC requirements?"] },
  jobs: { en: ["How to write a good CV?", "Best job sites in Nigeria?", "How to start a business?"], ha: ["Yadda ake rubuta CV mai kyau?", "Mafi kyawun shafukan aiki a Najeriya?", "Yadda ake fara kasuwanci?"], yo: ["Báwo ni mo ṣe kọ CV tó dára?", "Àwọn ojúewé iṣẹ́ tó dára jùlọ ní Nàìjíríà?", "Báwo ni mo ṣe bẹ̀rẹ̀ iṣòwò?"], ig: ["Kedu ka m ga-esi dee CV ọma?", "Ọkara weebụsaịtị ọrụ kachasị mma na Nigeria?", "Kedu ka m ga-esi bido azụmahịa?"], pcm: ["How to write good CV?", "Best job sites for Nigeria?", "How to start business?"] },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GidaAI() {
  const [lang, setLang] = useState("en");
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Settings
  const [speechRate, setSpeechRate] = useState(1.0);
  const [showSettings, setShowSettings] = useState(false);

  // TTS
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Offline
  const [isOffline, setIsOffline] = useState(false);

  // Saved chats badge
  const [savedModules, setSavedModules] = useState<Set<string>>(new Set());

  // Share toast
  const [shareToast, setShareToast] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Load initial state from localStorage ────────────────────────────────────
  useEffect(() => {
    const saved = new Set<string>();
    MODULES.forEach((m) => {
      if (localStorage.getItem(`gida-chat-${m.id}`)) saved.add(m.id);
    });
    if (localStorage.getItem("gida-chat-general")) saved.add("general");
    setSavedModules(saved);
    const rate = parseFloat(localStorage.getItem("gida-speech-rate") || "1.0");
    setSpeechRate(rate);
  }, []);

  // ── Offline detection ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // ── Save messages to localStorage ───────────────────────────────────────────
  const persistMessages = useCallback((key: string, msgs: Message[]) => {
    if (msgs.length > 0) {
      localStorage.setItem(`gida-chat-${key}`, JSON.stringify(msgs));
      setSavedModules((prev) => new Set([...prev, key]));
    }
  }, []);

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speakText = useCallback((text: string, id: string) => {
    if (!("speechSynthesis" in window)) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.lang = LANG_BCP47[lang] || "en-NG";
    utterance.onstart = () => setSpeakingId(id);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  }, [speakingId, speechRate, lang]);

  // ── Open module ──────────────────────────────────────────────────────────────
  const openModule = (moduleId: string) => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    setActiveModule(moduleId);

    // Try to restore saved conversation
    const saved = localStorage.getItem(`gida-chat-${moduleId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        setMessages(parsed);
      } catch {
        setMessages([{ role: "assistant", content: MODULE_PROMPTS[moduleId]?.[lang] || MODULE_PROMPTS[moduleId]?.en || "", id: Date.now().toString() }]);
      }
    } else {
      setMessages([{ role: "assistant", content: MODULE_PROMPTS[moduleId]?.[lang] || MODULE_PROMPTS[moduleId]?.en || "", id: Date.now().toString() }]);
    }

    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const openGeneralChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    setActiveModule(null);
    const saved = localStorage.getItem("gida-chat-general");
    if (saved) {
      try {
        setMessages(JSON.parse(saved) as Message[]);
      } catch {
        setDefaultGreeting();
      }
    } else {
      setDefaultGreeting();
    }
    setShowChat(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const setDefaultGreeting = () => {
    const langData = LANGUAGES.find((l) => l.code === lang);
    setMessages([{
      role: "assistant",
      content: `${langData?.greeting || "Welcome"} 👋 I'm Gida AI, your Nigerian assistant. ${lang === "ha" ? "Zan iya taimaka muku da komai. Menene kuke so?" : lang === "yo" ? "Mo lè ràn yín lọ́wọ́ pẹ̀lú ohun gbogbo. Kíni o fẹ́?" : lang === "ig" ? "Nwere ike inyere gị aka n'ihe ọ bụla. Gịnị chọrọ gị?" : lang === "pcm" ? "I fit help you with anything. Wetin you wan ask?" : "How can I help you today?"}`,
      id: Date.now().toString(),
    }]);
  };

  const goHome = () => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
    const key = activeModule || "general";
    if (messages.length > 1) persistMessages(key, messages);
    setShowChat(false);
  };

  // ── Clear saved chat ────────────────────────────────────────────────────────
  const clearSavedChat = (moduleId: string) => {
    localStorage.removeItem(`gida-chat-${moduleId}`);
    setSavedModules((prev) => { const s = new Set(prev); s.delete(moduleId); return s; });
  };

  // ── Share conversation ───────────────────────────────────────────────────────
  const shareConversation = async () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "Gida AI"}: ${m.content}`)
      .join("\n\n");
    const shareData = {
      title: "Gida AI Conversation",
      text: text.slice(0, 1500) + (text.length > 1500 ? "..." : ""),
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        setShareToast("Copied to clipboard!");
        setTimeout(() => setShareToast(""), 2500);
      }
    } catch {}
  };

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading || isOffline) return;
    const userMsg: Message = { role: "user", content: input.trim(), id: Date.now().toString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { role: "assistant", content: "", id: assistantId }]);

    try {
      const res = await fetch("/chat-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          language: lang,
          module: activeModule,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (parsed.content) {
                fullText += parsed.content;
                setMessages((prev) =>
                  prev.map((m) => m.id === assistantId ? { ...m, content: fullText } : m)
                );
              }
            } catch {}
          }
        }
      }

      // Persist updated messages
      const finalMsgs = [...newMessages, { role: "assistant" as const, content: fullText, id: assistantId }];
      persistMessages(activeModule || "general", finalMsgs);
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, content: "Sorry, I couldn't connect. Please check your internet and try again." } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const updateSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem("gida-speech-rate", String(rate));
  };

  const activeModuleData = activeModule ? MODULES.find((m) => m.id === activeModule) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100svh", backgroundColor: "#FAFAF8", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>

      {/* Offline banner */}
      {isOffline && (
        <div style={{ backgroundColor: "#DC2626", color: "white", textAlign: "center", padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>
          📵 You&apos;re offline — saved chats still available
        </div>
      )}

      {/* Share toast */}
      {shareToast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", backgroundColor: "#1B4332", color: "white", padding: "8px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap" }}>
          ✓ {shareToast}
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: "#1B4332", padding: "12px 14px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>

          {/* Left: back + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            {showChat && (
              <button onClick={goHome} style={{ color: "#F59E0B", background: "none", border: "none", cursor: "pointer", padding: "4px 6px 4px 0", fontSize: 20 }} aria-label="Back">←</button>
            )}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 20 }}>🏠</span>
                <span style={{ color: "#F59E0B", fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>Gida AI</span>
              </div>
              {showChat && activeModuleData && (
                <div style={{ color: "#B7E4C7", fontSize: 10, marginTop: 1 }}>
                  {(activeModuleData[lang as keyof typeof activeModuleData] as { title: string })?.title || activeModuleData.en.title}
                </div>
              )}
            </div>
          </div>

          {/* Right: lang selector + settings/share */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Language buttons */}
            <div style={{ display: "flex", gap: 2 }}>
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)} style={{ padding: "3px 5px", borderRadius: 5, border: lang === l.code ? "2px solid #F59E0B" : "2px solid transparent", backgroundColor: lang === l.code ? "#F59E0B" : "rgba(255,255,255,0.1)", color: lang === l.code ? "#1B4332" : "#D8F3DC", fontSize: 9.5, fontWeight: lang === l.code ? 700 : 500, cursor: "pointer", lineHeight: 1.3 }}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Share button (in chat) */}
            {showChat && (
              <button onClick={shareConversation} title="Share conversation" style={{ color: "#F59E0B", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", padding: "5px 7px", borderRadius: 8, fontSize: 15 }}>
                ↗
              </button>
            )}

            {/* Settings button */}
            <button onClick={() => setShowSettings(true)} title="Settings" style={{ color: "#F59E0B", background: "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", padding: "5px 7px", borderRadius: 8, fontSize: 15 }}>
              ⚙
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowSettings(false)}
        >
          <div
            style={{ backgroundColor: "white", borderRadius: "20px 20px 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: 480, margin: "0 auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 36, height: 4, backgroundColor: "#E5E7EB", borderRadius: 2, margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1B4332", marginBottom: 20 }}>⚙ Settings</h3>

            {/* Speech rate */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>🔊 Voice Speed</label>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>{speechRate.toFixed(1)}×</span>
              </div>
              <input
                type="range" min="0.5" max="2.0" step="0.1" value={speechRate}
                onChange={(e) => updateSpeechRate(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#F59E0B" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#9CA3AF" }}>
                <span>Slow (0.5×)</span><span>Normal (1.0×)</span><span>Fast (2.0×)</span>
              </div>
            </div>

            {/* Test voice */}
            <button
              onClick={() => {
                const u = new SpeechSynthesisUtterance("Welcome to Gida AI, your Nigerian assistant.");
                u.rate = speechRate;
                u.lang = LANG_BCP47[lang] || "en-NG";
                window.speechSynthesis?.speak(u);
              }}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "2px solid #1B4332", backgroundColor: "transparent", color: "#1B4332", fontWeight: 700, fontSize: 14, cursor: "pointer", marginBottom: 12 }}
            >
              🔊 Test Voice
            </button>

            <button onClick={() => setShowSettings(false)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", backgroundColor: "#1B4332", color: "#F59E0B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── HOME SCREEN ────────────────────────────────────────────────────── */}
      {!showChat && (
        <main style={{ flex: 1, padding: "16px 14px 24px", overflowY: "auto" }}>

          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)", borderRadius: 16, padding: "22px 18px", marginBottom: 20, color: "white", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, fontSize: 80, opacity: 0.07 }}>🏠</div>
            <div style={{ fontSize: 12, color: "#B7E4C7", fontWeight: 500, marginBottom: 3 }}>Welcome to</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#F59E0B", marginBottom: 8, letterSpacing: "-0.5px" }}>Gida AI 🇳🇬</div>
            <p style={{ fontSize: 13, color: "#D8F3DC", lineHeight: 1.5, marginBottom: 14, maxWidth: 250 }}>
              {lang === "ha" && "Mataimakina AI na Najeriya don komai."}
              {lang === "yo" && "Olùrànlọ́wọ́ AI Nàìjíríà fún gbogbo nkan."}
              {lang === "ig" && "Onye enyemaka AI nke Nigeria maka ihe niile."}
              {lang === "pcm" && "Your Nigerian AI helper for everything."}
              {lang === "en" && "Your Nigerian AI assistant — ask me anything."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={openGeneralChat} style={{ backgroundColor: "#F59E0B", color: "#1B4332", border: "none", borderRadius: 10, padding: "9px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                💬 {lang === "ha" ? "Fara Tattaunawa" : lang === "yo" ? "Bẹ̀rẹ̀ Ìfọ̀rọ̀wánilẹ́nu" : lang === "ig" ? "Bido Mkparịta Ụka" : lang === "pcm" ? "Start Chat" : "Start Chat"}
              </button>
              {savedModules.has("general") && (
                <button onClick={() => { clearSavedChat("general"); }} style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#D8F3DC", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "9px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                  🗑 Clear saved
                </button>
              )}
            </div>
          </div>

          {/* Module label */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            {lang === "ha" ? "Zabi Module" : lang === "yo" ? "Yan Ìpínrọ̀" : lang === "ig" ? "Họrọ Modul" : lang === "pcm" ? "Choose Topic" : "Choose a Topic"}
          </div>

          {/* Module cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {MODULES.map((mod) => {
              const text = (mod[lang as keyof typeof mod] as { title: string; desc: string }) || mod.en;
              const hasSaved = savedModules.has(mod.id);
              return (
                <div key={mod.id} style={{ position: "relative" }}>
                  <button
                    onClick={() => openModule(mod.id)}
                    style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: "white", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "13px 14px", cursor: "pointer", textAlign: "left", width: "100%", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget).style.borderColor = "#F59E0B"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.borderColor = "#E5E7EB"; }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: "#D8F3DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {mod.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1B4332", marginBottom: 2 }}>{text.title}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{text.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      {hasSaved && <span title="Saved chat" style={{ fontSize: 10, backgroundColor: "#FEF3C7", color: "#D97706", borderRadius: 4, padding: "1px 5px", fontWeight: 700 }}>saved</span>}
                      <span style={{ color: "#F59E0B", fontSize: 18 }}>›</span>
                    </div>
                  </button>
                  {hasSaved && (
                    <button onClick={() => clearSavedChat(mod.id)} title="Clear saved chat" style={{ position: "absolute", top: 6, right: 30, background: "none", border: "none", color: "#9CA3AF", fontSize: 11, cursor: "pointer", padding: "2px 4px" }}>
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Offline message */}
          {isOffline && (
            <div style={{ marginTop: 16, backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#92400E" }}>
              📵 <strong>You&apos;re offline.</strong> You can still view your saved conversations above. Chat will resume when you&apos;re back online.
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 22, textAlign: "center" }}>
            <a
              href={`sms:?body=${encodeURIComponent("Gida AI Feedback: I love/suggest improving [write your feedback here]")}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#D8F3DC", color: "#1B4332", borderRadius: 20, padding: "8px 16px", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}
            >
              📱 Send SMS Feedback
            </a>
            <div style={{ marginTop: 10, fontSize: 11, color: "#9CA3AF" }}>
              Powered by Claude AI · Made for Nigerians 🇳🇬
            </div>
          </div>
        </main>
      )}

      {/* ── CHAT SCREEN ────────────────────────────────────────────────────── */}
      {showChat && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>

                {msg.role === "assistant" && (
                  <div style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: "#1B4332", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 6, marginTop: 2 }}>
                    🏠
                  </div>
                )}

                <div style={{ maxWidth: "76%", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
                  <div style={{ padding: "10px 13px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", backgroundColor: msg.role === "user" ? "#1B4332" : "white", color: msg.role === "user" ? "white" : "#1A1A1A", fontSize: 14, lineHeight: 1.55, border: msg.role === "assistant" ? "1px solid #E5E7EB" : "none", boxShadow: msg.role === "assistant" ? "0 1px 3px rgba(0,0,0,0.06)" : "none", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {msg.content === "" && loading ? (
                      <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    ) : msg.content}
                  </div>

                  {/* Speak button for assistant messages */}
                  {msg.role === "assistant" && msg.content && (
                    <button
                      onClick={() => speakText(msg.content, msg.id)}
                      title={speakingId === msg.id ? "Stop speaking" : "Read aloud"}
                      style={{ background: speakingId === msg.id ? "#FEF3C7" : "none", border: speakingId === msg.id ? "1px solid #F59E0B" : "1px solid #E5E7EB", borderRadius: 8, padding: "3px 8px", fontSize: 11, color: speakingId === msg.id ? "#D97706" : "#9CA3AF", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, fontWeight: 500 }}
                    >
                      {speakingId === msg.id ? "■ Stop" : "🔊 Listen"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && activeModule && (
            <div style={{ padding: "0 12px 8px", display: "flex", gap: 5, flexWrap: "wrap" }}>
              {(QUICK_PROMPTS[activeModule]?.[lang] || QUICK_PROMPTS[activeModule]?.en || []).map((prompt, i) => (
                <button key={i} onClick={() => { setInput(prompt); inputRef.current?.focus(); }} style={{ padding: "6px 11px", borderRadius: 20, border: "1.5px solid #D8F3DC", backgroundColor: "white", color: "#1B4332", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{ padding: "8px 10px", backgroundColor: "white", borderTop: "1px solid #E5E7EB", display: "flex", gap: 7, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isOffline ? "You're offline..." : (PLACEHOLDERS[lang] || PLACEHOLDERS.en)}
              disabled={isOffline}
              rows={1}
              style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 12, padding: "9px 12px", fontSize: 14, resize: "none", outline: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, overflowY: "auto", backgroundColor: isOffline ? "#F3F4F6" : "#FAFAF8" }}
              onFocus={(e) => { e.target.style.borderColor = "#F59E0B"; }}
              onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; }}
            />
            <button
              onClick={sendMessage} disabled={loading || !input.trim() || isOffline}
              style={{ backgroundColor: input.trim() && !loading && !isOffline ? "#1B4332" : "#E5E7EB", color: input.trim() && !loading && !isOffline ? "#F59E0B" : "#9CA3AF", border: "none", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() && !loading && !isOffline ? "pointer" : "not-allowed", fontSize: 16, flexShrink: 0, transition: "all 0.15s" }}
              aria-label="Send"
            >
              ➤
            </button>
          </div>

          {/* Chat footer: SMS + offline note */}
          <div style={{ textAlign: "center", padding: "6px 0 8px", backgroundColor: "white", borderTop: "1px solid #F3F4F6" }}>
            <a href={`sms:?body=${encodeURIComponent("Gida AI Feedback: [write your feedback here]")}`} style={{ fontSize: 11, color: "#9CA3AF", textDecoration: "none" }}>
              📱 SMS Feedback
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
