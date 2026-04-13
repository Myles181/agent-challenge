"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// Must point directly at the ElizaOS server (cannot proxy WebSockets through Next.js API routes)
const ELIZA_URL = process.env.NEXT_PUBLIC_ELIZA_URL ?? "http://localhost:3002";
const AGENT_ID = process.env.NEXT_PUBLIC_ELIZA_AGENT_ID ?? "";
const CHANNEL_ID = process.env.NEXT_PUBLIC_ELIZA_CHANNEL_ID ?? "";
const SERVER_ID = "00000000-0000-0000-0000-000000000000";
const USER_ID = "00000000-0000-0000-0000-000000000001";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

export function useElizaChat() {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'init',
    role: 'agent',
    text: "Sentinel protocol established. I am IQ-5 AI. Monitoring Solana mainnet for institutional flows and whale maneuvers. How can I assist your strategy today?",
    timestamp: new Date()
  }]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("[socket] connecting to:", ELIZA_URL);
    const socket = io(ELIZA_URL, {
      // Start with polling for reliable handshake, then upgrade to websocket
      transports: ["polling", "websocket"],
      auth: { entityId: USER_ID },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      withCredentials: false,
    });
    socketRef.current = socket;

  socket.on("connect", () => {
  console.log("[debug] joining channel:", {
    channelId: CHANNEL_ID,
    messageServerId: SERVER_ID,
    entityId: USER_ID,
    AGENT_ID,
  });

  fetch(`/api/eliza/api/messaging/central-channels/${CHANNEL_ID}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId: AGENT_ID }),
  }).catch(err => console.error("Agent registration failed:", err));

  // ElizaOS uses numeric string event types. "1" = SOCKET_MESSAGE_TYPE.ROOM_JOINING
  socket.emit("1", { channelId: CHANNEL_ID });

  setConnected(true);
});

    socket.on("channel_joined", (data) => {
      console.log("[socket] channel_joined:", data);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("messageStreamChunk", (data) => {
      console.log("[socket] messageStreamChunk:", data);
      if (data.agentId !== AGENT_ID) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "agent" && last.id === data.messageId) {
          return [...prev.slice(0, -1), { ...last, text: last.text + data.chunk }];
        }
        return [...prev, { id: data.messageId, role: "agent", text: data.chunk, timestamp: new Date() }];
      });
    });

    socket.on("messageBroadcast", (data) => {
      console.log("[socket] messageBroadcast:", data);
      const senderId = data.senderId ?? data.author_id;
      if (senderId === USER_ID) return;
      const text = data.text ?? data.content ?? "";
      if (!text) return;

      const msgId = data.id ?? data.messageId;

      setMessages((prev) => {
        // If this message was already streamed in chunk-by-chunk, update it in place
        if (msgId && prev.some((m) => m.id === msgId)) {
          return prev.map((m) =>
            m.id === msgId ? { ...m, text } : m
          );
        }
        // Otherwise it's a non-streamed response — append it
        return [
          ...prev,
          { id: msgId ?? crypto.randomUUID(), role: "agent", text, timestamp: new Date() },
        ];
      });
      setLoading(false);
    });

    socket.onAny((event, ...args) => {
      console.log("[socket] event:", event, args);
    });

    return () => { socket.disconnect(); };
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, {
      id: crypto.randomUUID(), role: "user", text, timestamp: new Date(),
    }]);
    setLoading(true);

    try {
      const response = await fetch(`/api/eliza/api/messaging/channels/${CHANNEL_ID}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: CHANNEL_ID,
          message_server_id: SERVER_ID,
          author_id: USER_ID,
          content: text,
          source_type: "api",
          raw_message: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API error:", response.status, errorText);
        setLoading(false);
      }
    } catch (err) {
      console.error("Send failed:", err);
      setLoading(false);
    }
  }, []);

  return { messages, connected, loading, sendMessage };
}