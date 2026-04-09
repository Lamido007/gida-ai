import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are Gida AI, a helpful Nigerian AI assistant. Help Nigerians with digital literacy, financial guidance, farming advice, education support, and job opportunities. Be warm, practical, and encouraging. Use simple, clear language.`,
  ha: `Kai ne Gida AI, mataimaki na AI na Najeriya. Ka taimaki 'yan Najeriya da ilimin dijital, jagorar kudi, shawara kan noma, tallafin ilimi, da damar aiki. Ka zama mai dumi, mai amfani. Yi amfani da harshe mai sauki. Ka iya amsa da Hausa.`,
  yo: `Iwo ni Gida AI, oluranlo AI Naijeria. E ran awon ara Naijeria lowo pelu imo imo-ero, itonisona owo, imo agbe, atileyin ikekoo, ati awon anfaani isee. Je oloore, to wulo. Lo ede to rorùn. E le dahun ni Yoruba.`,
  ig: `I bu Gida AI, onye enyemaka AI nke Nigeria. Nyere ndi Nigeria aka na ihe gbasara omumu dijitalu, nduzi ego, ndumodụ oru ugbo, nkwado agumakwukwo, na ohere oru. Buuru onye di mma, bara uru. Jiri asụsụ di mfe. I nwere ike iza n'Igbo.`,
  pcm: `You na Gida AI, Nigeria AI helper. Help Nigerians with digital knowledge, money advice, farming tips, school support, and job opportunities. Be friendly and helpful. Use simple words. You fit answer for Pidgin English.`,
};

const MODULE_CONTEXTS: Record<string, string> = {
  digital: "Focus on digital literacy: smartphones, internet, social media safety, online banking, digital payments like OPay and PalmPay, cybersecurity, and avoiding online scams.",
  financial: "Focus on finance: saving money, budgeting, microfinance, loans, investments, insurance, avoiding financial fraud, and government empowerment programs.",
  farming: "Focus on agriculture: crop cultivation, soil health, fertilizers, pest control, government programs, commodity markets, weather, and storage.",
  education: "Focus on education: WAEC, NECO, JAMB preparation, scholarships, NYSC, vocational training, online learning, and university admissions.",
  jobs: "Focus on jobs: CV writing, job platforms like Jobberman and LinkedIn, entrepreneurship, government job schemes, skills training, and freelancing.",
};

export async function POST(req: NextRequest) {
  try {
    const { messages, language, module: moduleId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), { status: 400 });
    }

    const lang = (language as string) || "en";
    const systemBase = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.en;
    const moduleContext = moduleId && MODULE_CONTEXTS[moduleId as string]
      ? `\n\nModule context: ${MODULE_CONTEXTS[moduleId as string]}`
      : "";

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemBase + moduleContext,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return new Response(JSON.stringify({ content: text }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
