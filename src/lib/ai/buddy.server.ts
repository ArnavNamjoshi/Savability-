import { APICallError, convertToModelMessages, validateUIMessages } from "ai";
import { z } from "zod";
import { createResponsesCall } from "./responses.ts";
import { buildBuddyFacts } from "../buddy.ts";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const money = z.number().finite().min(-1e9).max(1e9);
const ContextSchema = z.object({
  unitName: z.string().trim().min(1).max(40),
  unitPrice: z.number().finite().positive().max(1e7),
  balance: money,
  goal: z.object({ name: z.string().max(80), price: money }).nullable(),
  pocket: z.object({ amount: money, freq: z.enum(["weekly", "monthly"]) }).nullable(),
  recent: z
    .array(z.object({ label: z.string().max(80), amount: money, wanted: z.boolean(), daysAgo: z.number().min(0).max(100000) }))
    .max(15),
  month: z.object({ added: money, needed: money, wanted: money }),
});

const BodySchema = z.object({
  messages: z.array(z.unknown()).min(1).max(60),
  context: ContextSchema,
});

const INSTRUCTIONS = `You are Buddy, a warm and playful money coach inside Savability, an app that helps children (about 6 to 12 years old) save and spend wisely.

How you talk:
- Use short, simple sentences a young child understands. Keep answers to 2 to 5 sentences unless the child asks for more.
- Be encouraging, never scolding. Do not lecture.
- Prefer asking one gentle question that helps the child think for themselves (for example "Will you still play with it in two weeks?") over telling them what to do.
- Always show amounts in rupees first (like ₹120) and then in the child's own unit (like "12 chocolates"). Use the numbers in the facts below; never invent a balance, goal or purchase.
- Never use emojis.

Rules you must follow:
- A child may only buy something if it costs LESS than 75% of their savings, and even then a parent must approve it. Never say they can buy something above that limit. For any purchase, remind them to check with mum or dad first.
- Never ask for or repeat personal details (real name, school, address, phone, passwords, photos). If the child shares any, kindly tell them not to share that and move on.
- Stay on saving, spending, goals and money habits. Do not talk about stocks, crypto, loans, interest rates, betting or anything unsafe for children. Gently steer other topics back to money and saving.
- If they feel bored and want to spend, suggest free fun ideas and remind them how close they are to their goal.

The child's money facts (from the app, no personal data):`;

function friendlyError(error: unknown): string {
  const status = APICallError.isInstance(error) ? error.statusCode : undefined;
  if (status === 429) return "Buddy is chatting with lots of savers right now. Please try again in a minute.";
  if (status === 402) return "Buddy has run out of thinking power for now. Ask a grown-up to add AI credits to the app.";
  if (status === 403) return "Buddy isn't allowed to answer right now. Ask a grown-up to check the app's AI settings.";
  if (status === 401) return "Buddy isn't set up properly yet. Ask a grown-up to check the app's settings.";
  return "Buddy couldn't answer just now. Please try again.";
}

function json(status: number, error: string) {
  return new Response(JSON.stringify({ error }), { status, headers: { "content-type": "application/json" } });
}

export async function handleBuddyChat(request: Request): Promise<Response> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return json(500, "Buddy isn't set up properly yet.");

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return json(400, "That message didn't make sense to Buddy.");
  }

  let messages;
  try {
    messages = await validateUIMessages({ messages: body.messages });
  } catch {
    return json(400, "That message didn't make sense to Buddy.");
  }
  const tooLong = messages.some((m) => m.parts.some((p) => p.type === "text" && p.text.length > 2000));
  if (tooLong) return json(400, "That message is too long. Try a shorter one.");

  const instructions = `${INSTRUCTIONS}\n${buildBuddyFacts(body.context)}`;
  const call = createResponsesCall(
    request,
    { baseURL: GATEWAY_URL, apiKey, model: MODEL, reasoningEffort: "low" },
    await convertToModelMessages(messages.slice(-30)),
    instructions,
  );
  return call.response({ originalMessages: messages, onError: friendlyError });
}
