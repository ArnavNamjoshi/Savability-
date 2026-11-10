import { createFileRoute } from "@tanstack/react-router";
import { handleBuddyChat } from "@/lib/ai/buddy.server";

export const Route = createFileRoute("/api/chat")({
  server: { handlers: { POST: ({ request }) => handleBuddyChat(request) } },
});
