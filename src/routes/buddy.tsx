import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Wallet, Target, Gamepad2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { buddyContext } from "@/lib/buddy";
import { buddySrc } from "@/lib/art";
import { play } from "@/lib/sound";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";

export const Route = createFileRoute("/buddy")({
  head: () => ({
    meta: [
      { title: "Ask Buddy — Savability" },
      { name: "description", content: "Chat with Buddy, a friendly money coach that helps kids think before they spend." },
      { property: "og:title", content: "Ask Buddy — Savability" },
      { property: "og:description", content: "A friendly money coach for kids." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuddyPage,
});

const CHAT_KEY = "savability-buddy-chat-v1";

const QUICK = [
  { text: "Can I afford this?", icon: Wallet, tint: "bg-mint" },
  { text: "How fast can I reach my goal?", icon: Target, tint: "bg-lemon" },
  { text: "I'm bored and want to spend.", icon: Gamepad2, tint: "bg-peach" },
];

function loadChat(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function BuddyPage() {
  // The page only renders in the browser once saved data has loaded, so reading storage here is safe.
  const [saved] = useState(loadChat);
  return <BuddyChat initial={saved} />;
}

function BuddyChat({ initial }: { initial: UIMessage[] }) {
  const { state } = useStore();
  const face = buddySrc(state.avatar);
  const context = useMemo(() => buddyContext(state), [state]);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop, error, setMessages, clearError } = useChat({
    id: "buddy",
    messages: initial,
    transport,
    onFinish: () => play("right"),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      try {
        localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
      } catch {
        /* storage full or blocked */
      }
    }
  }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    clearError();
    void sendMessage({ text: t }, { body: { context } });
  };

  const onSubmit = (m: PromptInputMessage) => send(m.text);

  const startFresh = () => {
    if (busy) stop();
    setMessages([]);
    clearError();
    localStorage.removeItem(CHAT_KEY);
  };

  const last = messages[messages.length - 1];
  const waiting = busy && (!last || last.role === "user" || !last.parts.some((p) => p.type === "text" && p.text.length > 0));

  return (
    <div className="flex h-[calc(100dvh-9.5rem)] flex-col gap-3 md:h-[calc(100dvh-5rem)]">
      <div className="flex items-center gap-3">
        <img src={face} alt="Buddy" className="h-14 w-14 rounded-full border-4 border-foreground bg-sunny p-1" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold md:text-3xl">Ask Buddy</h1>
          <p className="text-sm text-muted-foreground">Your money coach. Big buys always need mum or dad.</p>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={startFresh} className="btn bg-lavender px-3 py-2 text-sm">
            <RotateCcw className="h-4 w-4" /> Start fresh
          </button>
        )}
      </div>

      <div className="card-soft flex min-h-0 flex-1 flex-col p-0">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent className="gap-5 p-4 md:p-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <img src={face} alt="" className="h-28 w-28 animate-pop" />
                <h2 className="text-xl font-bold">Hi! I'm Buddy.</h2>
                <p className="max-w-sm text-muted-foreground">
                  I know your savings, your goal and what you've bought. Ask me anything about spending or saving.
                </p>
              </div>
            )}
            {messages.map((m) => (
              <Message key={m.id} from={m.role}>
                <MessageContent className="text-base group-[.is-user]:rounded-2xl group-[.is-user]:border-2 group-[.is-user]:border-foreground group-[.is-user]:bg-sky group-[.is-user]:text-foreground">
                  {m.role === "assistant" ? (
                    <div className="flex items-start gap-2">
                      <img src={face} alt="" className="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-sunny p-0.5" />
                      <div className="min-w-0 flex-1">
                        {m.parts.map((p, i) =>
                          p.type === "text" ? <MessageResponse key={i} className="text-base">{p.text}</MessageResponse> : null,
                        )}
                      </div>
                    </div>
                  ) : (
                    m.parts.map((p, i) => (p.type === "text" ? <span key={i} className="whitespace-pre-wrap">{p.text}</span> : null))
                  )}
                </MessageContent>
              </Message>
            ))}
            {waiting && (
              <div className="flex items-center gap-2">
                <img src={face} alt="" className="h-8 w-8 rounded-full bg-sunny p-0.5" />
                <Shimmer className="font-semibold">Buddy is thinking...</Shimmer>
              </div>
            )}
            {error && !busy && (
              <div role="alert" className="rounded-2xl border-2 border-foreground bg-coral px-4 py-3 text-sm font-semibold">
                {error.message || "Buddy couldn't answer just now. Please try again."}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK.map(({ text, icon: Icon, tint }) => (
          <button key={text} type="button" disabled={busy} onClick={() => send(text)} className={`btn ${tint} px-3 py-2 text-sm`}>
            <Icon className="h-4 w-4" /> {text}
          </button>
        ))}
      </div>

      <PromptInput onSubmit={onSubmit} className="rounded-2xl border-2 border-foreground bg-card">
        <PromptInputTextarea autoFocus placeholder="Ask Buddy about your money..." className="text-base" />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
