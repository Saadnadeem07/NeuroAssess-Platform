"use client";

import { useEffect, useRef, useState } from "react";
import { MessagesSquare, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageIntro, LoadingBlock, EmptyState } from "@/components/dashboard/widgets";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { Conversation, MessageEntity } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MessagesPanel({ currentUserId }: { currentUserId: string }) {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Conversation | null>(null);
  const [thread, setThread] = useState<MessageEntity[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    const res = await api.get<{ data: Conversation[] }>("/messages/conversations");
    setConversations(res.data ?? []);
  };

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, []);

  const openThread = async (c: Conversation) => {
    setActive(c);
    try {
      const res = await api.get<{ data: MessageEntity[] }>(`/messages/conversation/${c.partnerId}`);
      setThread(res.data ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    } catch (err) {
      toast({ title: "Couldn't open conversation", description: (err as Error).message, variant: "error" });
    }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    setSending(true);
    try {
      const res = await api.post<{ data: MessageEntity }>("/messages", {
        receiverId: active.partnerId,
        content: draft.trim(),
      });
      setThread((t) => [...t, res.data]);
      setDraft("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (err) {
      toast({ title: "Message not sent", description: (err as Error).message, variant: "error" });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading messages…" />;

  return (
    <div>
      <PageIntro title="Messages" description="Your conversations." />
      <div className="grid h-[560px] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm md:grid-cols-[300px_1fr]">
        {/* Conversation list */}
        <div className={cn("flex-col border-r border-border md:flex", active ? "hidden md:flex" : "flex")}>
          {conversations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState icon={MessagesSquare} title="No conversations" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {conversations.map((c) => (
                <button
                  key={c.partnerId}
                  onClick={() => openThread(c)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent",
                    active?.partnerId === c.partnerId && "bg-accent"
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                    {c.partnerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.partnerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thread */}
        <div className={cn("flex-col md:flex", active ? "flex" : "hidden md:flex")}>
          {!active ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Select a conversation to start chatting.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <button className="md:hidden" onClick={() => setActive(null)} aria-label="Back">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand text-sm font-semibold text-primary-foreground">
                  {active.partnerName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <p className="font-medium">{active.partnerName}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
                {thread.map((m) => {
                  const mine = String(m.sender) === currentUserId;
                  return (
                    <div key={m._id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                          mine ? "gradient-brand text-primary-foreground" : "bg-card text-foreground"
                        )}
                      >
                        {m.content}
                        <span className={cn("mt-1 block text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…" />
                <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
