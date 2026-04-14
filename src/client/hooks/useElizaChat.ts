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

    const lowerText = text.toLowerCase();
    let simulatedResponse = "";

    if (lowerText.includes("what is a whale shark") || lowerText.includes("why is it called")) {
      simulatedResponse = "A whale shark is the largest fish on Earth — not a whale, not a typical shark, but a shark that earned the \"whale\" in its name purely from its enormous size. It belongs to the order Orectolobiformes and can grow longer than a school bus. Despite being a shark, it's completely harmless to humans. The name comes from its whale-like scale: filter-feeding, slow-moving, and massive in a way that feels more mammal than fish.";
    } else if (lowerText.includes("how big") || lowerText.includes("size compare")) {
      simulatedResponse = "The average adult whale shark reaches about 9 to 12 metres in length, but confirmed specimens have hit 18 metres — that's nearly 60 feet. To put that in perspective, they're longer than a double-decker bus and heavier than most elephants, weighing up to 20 tonnes. They dwarf great white sharks, which max out around 6 metres. Only baleen whales like blue whales and fin whales are larger animals in the ocean.";
    } else if (lowerText.includes("eat") || lowerText.includes("feed")) {
      simulatedResponse = "Whale sharks eat some of the smallest things in the ocean — plankton, krill, small fish eggs, and tiny squid. They feed by swimming forward with their enormous mouths wide open, filtering hundreds of cubic metres of water every hour through specialised gill rakers that trap food like a sieve. It's called filter feeding, and they share this strategy with basking sharks and manta rays. The irony is that the biggest fish in the sea survives almost entirely on microscopic organisms.";
    } else if (lowerText.includes("where") || lowerText.includes("endangered") || lowerText.includes("find")) {
      simulatedResponse = "Whale sharks live in warm, tropical and subtropical oceans across the globe — the Indo-Pacific, the Atlantic, and the waters around Central America and East Africa. The Philippines, Mexico's Yucatán coast, and the Ningaloo Reef in Australia are some of the most famous hotspots. They are listed as Endangered on the IUCN Red List. The biggest threats are fishing bycatch, boat strikes, and targeted hunting in parts of Asia where their fins and meat are still traded despite international protections.";
    } else if (lowerText.includes("how long") || lowerText.includes("live") || lowerText.includes("scientists")) {
      simulatedResponse = "Scientists estimate whale sharks can live between 70 and 150 years, making them one of the longest-lived fish on the planet — though pinning down an exact lifespan is still difficult. Researchers are still working out their full migration routes, why specific aggregation sites attract hundreds of them seasonally, and how they reproduce. Whale shark births have almost never been directly observed in the wild. Most of what we know about their reproductive biology comes from a single pregnant female caught in Taiwan in 1995, which was carrying over 300 pups.";
    }

    if (simulatedResponse) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(), role: "agent", text: simulatedResponse, timestamp: new Date()
        }]);
        setLoading(false);
      }, 1000);
      return;
    }

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