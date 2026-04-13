# ElizaOS Integration in Next.js

Reference doc for integrating an ElizaOS agent into a Next.js (App Router) frontend.
Covers the full message flow, Socket.IO setup, and known gotchas specific to this project.

---

## How It Works

```
[Next.js Client]
     |
     | POST /api/messaging/channels/:channelId/messages
     v
[ElizaOS Server :3000]
     |
     | processes via Agent Runtime
     v
[Message Bus]
     |
     | emits messageBroadcast / messageStreamChunk
     v
[Socket.IO] ──────────────────> [Next.js Client receives response]
```

The client sends messages over REST and receives responses over Socket.IO.
They are two separate channels — don't conflate them.

---

## Environment Variables

```env
NEXT_PUBLIC_ELIZA_URL=http://localhost:3000
NEXT_PUBLIC_ELIZA_AGENT_ID=<your-agent-id>
NEXT_PUBLIC_ELIZA_CHANNEL_ID=<your-channel-id>
```

Get the agent ID from:
```bash
curl http://localhost:3000/api/agents
# returns { data: { agents: [{ id, name, status }] } }
```

The channel ID (`4e10f168-...`) is whatever channel the agent was registered to.
The message server ID is always `00000000-0000-0000-0000-000000000000`.

---

## 1. Socket.IO Connection

Install the client:
```bash
npm install socket.io-client
```

> **Critical**: Socket.IO must only run client-side in Next.js App Router.
> Always initialize inside a `useEffect` — never at module level.

```ts
// hooks/useElizaChat.ts
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const ELIZA_URL    = process.env.NEXT_PUBLIC_ELIZA_URL    ?? "http://localhost:3000";
const AGENT_ID     = process.env.NEXT_PUBLIC_ELIZA_AGENT_ID   ?? "";
const CHANNEL_ID   = process.env.NEXT_PUBLIC_ELIZA_CHANNEL_ID ?? "";
const SERVER_ID    = "00000000-0000-0000-0000-000000000000";
const USER_ID      = "00000000-0000-0000-0000-000000000001"; // must be a valid UUID
```

---

## 2. Joining the Channel Room

ElizaOS uses numeric Socket.IO message types internally. To join a channel room
the client emits event `"1"` (the string representation of `SOCKET_MESSAGE_TYPE.ROOM_JOINING`):

```ts
socket.on("connect", () => {
  // auth entityId must be set on connection
  socket.emit("1", { channelId: CHANNEL_ID });
});

socket.on("channel_joined", (data) => {
  console.log("Joined room:", data);
});
```

Auth must be passed at connection time, not after:
```ts
const socket = io(ELIZA_URL, {
  transports: ["websocket"],
  auth: {
    entityId: USER_ID,
  },
});
```

If you skip `auth.entityId` you'll get:
```
[SocketIO Auth] Invalid or missing entityId: undefined
```

---

## 3. Sending a Message (REST)

ElizaOS validates all fields — including `author_id` — as UUIDs.
Plain strings like `"user"` will silently fail validation.

```ts
const sendMessage = async (text: string) => {
  await fetch(`${ELIZA_URL}/api/messaging/channels/${CHANNEL_ID}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel_id:        CHANNEL_ID,
      message_server_id: SERVER_ID,
      author_id:         USER_ID,       // must be a UUID
      content:           text,
      source_type:       "api",
      raw_message:       text,          // required — can be same as content
    }),
  });
};
```

Required fields (all must be present or you get 400):
| Field | Value |
|---|---|
| `channel_id` | channel UUID |
| `message_server_id` | `00000000-0000-0000-0000-000000000000` |
| `author_id` | valid UUID for the user |
| `content` | message text |
| `source_type` | `"api"` |
| `raw_message` | same as content |

---

## 4. Receiving Agent Responses (Socket.IO)

Two events to handle:

### `messageStreamChunk` — streaming (token by token)
```ts
socket.on("messageStreamChunk", (data: {
  chunk: string;
  agentId: string;
  messageId: string;
}) => {
  if (data.agentId !== AGENT_ID) return;
  // append chunk to current streaming message
});
```

### `messageBroadcast` — final complete message
```ts
socket.on("messageBroadcast", (data: any) => {
  const senderId = data.senderId ?? data.author_id;
  if (senderId === USER_ID) return; // ignore own message echo
  const text = data.text ?? data.content ?? "";
  // render agent message
});
```

> The agent's `senderId` in `messageBroadcast` will be the agent's UUID, not `USER_ID`.
> Filter out your own echoed messages by comparing against `USER_ID`.

---

## 5. Agent Participation (Important)

The agent must be registered to the channel to process messages.
If the agent never responds, this is likely the issue.

```ts
// call once on app init
await fetch(`${ELIZA_URL}/api/messaging/central-channels/${CHANNEL_ID}/agents`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ agentId: AGENT_ID }),
});
```

---

## 6. CORS

If you hit CORS errors making direct fetch calls from the browser to ElizaOS,
proxy through a Next.js API route:

```ts
// app/api/eliza/[...path]/route.ts
export async function POST(req: Request, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const body = await req.text();
  const res = await fetch(`${process.env.ELIZA_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const data = await res.json();
  return Response.json(data);
}
```

Then call `/api/eliza/messaging/channels/...` instead of the ElizaOS URL directly.

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Invalid or missing entityId` | Missing `auth.entityId` in socket init | Pass `auth: { entityId: USER_ID }` to `io()` |
| `400 Missing required fields` | Wrong field names or non-UUID `author_id` | Use `channel_id` not `channelId`, and use a real UUID |
| `WebSocket connection failed` | ElizaOS not running | Run `pnpm start` in the agent-challenge dir |
| Agent connected but never responds | Agent not added to channel | POST to `/central-channels/:id/agents` |
| Response received but UI stuck on "thinking" | Socket not joined to room | Emit `"1"` with `{ channelId }` on connect |
| Port keeps changing (3000 vs 3002) | ElizaOS picks next available port | Set `SERVER_PORT=3000` in ElizaOS `.env` |

---

## Full Hook Reference

```ts
export function useElizaChat() {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = io(ELIZA_URL, {
      transports: ["websocket"],
      auth: { entityId: USER_ID },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("1", { channelId: CHANNEL_ID });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("messageStreamChunk", (data) => {
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
      const senderId = data.senderId ?? data.author_id;
      if (senderId === USER_ID) return;
      const text = data.text ?? data.content ?? "";
      if (!text) return;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "agent") {
          return [...prev.slice(0, -1), { ...last, text }];
        }
        return [...prev, { id: crypto.randomUUID(), role: "agent", text, timestamp: new Date() }];
      });
      setLoading(false);
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
      await fetch(`${ELIZA_URL}/api/messaging/channels/${CHANNEL_ID}/messages`, {
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
    } catch (err) {
      console.error("Send failed:", err);
      setLoading(false);
    }
  }, []);

  return { messages, connected, loading, sendMessage };
}
```

---

## Official Reference

- Starter repo: https://github.com/elizaOS/eliza-nextjs-starter
- Socket.IO + Next.js: https://socket.io/how-to/use-with-nextjs
