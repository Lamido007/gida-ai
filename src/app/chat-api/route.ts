import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are Gida AI, a helpful Nigerian AI assistant. You help Nigerians with digital literacy, financial guidance, farming advice, education support, and job opportunities. Be warm, practical, and encouraging. Use simple, clear language.`,
  ha: `Kai ne Gida AI, mataimaki na AI na Najeriya. Ka taimaki 'yan Najeriya da ilimin dijital, jagorar kuɗi, shawara kan noma, tallafin ilimi, da damar aiki. Ka zama mai ɗumi, mai amfani, kuma mai ƙarfafawa. Yi amfani da harshe mai sauƙi kuma bayyana. Ka iya amsa da Hausa.`,
  yo: `Ìwọ ni Gida AI, olùrànlọ́wọ́ AI Nàìjíríà kan. Ẹ ràn àwọn ará Nàìjíríà lọ́wọ́ pẹ̀lú ìmọ̀ ìmọ̀-ẹ̀rọ, ìtọ́nisọ̀na owó, ìmọ̀ àgbẹ̀, àtìlẹ́yìn ìkẹ́kọ̀ọ́, àti àwọn àǹfààní iṣẹ́. Jẹ́ olóore, tó wúlò, àti alágbára. Lo èdè tó rọrùn. Ẹ lè dáhùn ní Yorùbá.`,
  ig: `Ị bụ Gida AI, onye enyemaka AI nke Nigeria. Nyere ndị Nigeria aka na ihe gbasara ọmụmụ dijitalụ, nduzi ego, ndụmọdụ ọrụ ugbo, nkwado agụmakwụkwọ, na ohere ọrụ. Bụrụ onye dị mma, bara uru, ma na-akwado ha. Jiri asụsụ dị mfe. Ị nwere ike ịza n'Igbo.`,
  pcm: `You na Gida AI, Nigeria AI helper. Help Nigerians with digital knowledge, money advice, farming tips, school support, and job opportunities. Be friendly, helpful, and encouraging. Use simple words. You fit answer for Pidgin English.`,
};

const MODULE_CONTEXTS: Record<string, string> = {
  digital: "Focus on digital literacy: smartphones, internet, social media safety, online banking, digital payments (OPay, PalmPay, Flutterwave), cybersecurity, and avoiding online scams.",
  financial: "Focus on finance: saving money, budgeting, microfinance, loans (LAPO, BOI), investments, insurance, avoiding financial fraud, and government empowerment programs.",
  farming: "Focus on agriculture: crop cultivation, soil health, fertilizers, pest control, CBN Anchor Borrowers program, commodity markets, weather, storage, and AgriTech tools.",
  education: "Focus on education: WAEC/NECO/JAMB preparation, scholarships, NYSC, vocational training, online learning, government bursaries, and university admissions.",
  jobs: "Focus on jobs and careers: CV writing, job platforms (Jobberman, LinkedIn, NGCareers), entrepreneurship, government job schemes, skills training, SME support, and freelancing.",
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
      ? `\n\nCurrent module context: ${MODULE_CONTEXTS[moduleId as string]}`
      : "";

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 8192,
            system: systemBase + moduleContext,
            messages: messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          });

          for await (const event of response) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`)
              );
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
