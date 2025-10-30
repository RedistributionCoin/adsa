import WebSocket from "ws";
import http from "http";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY");
  process.exit(1);
}

const ai = new OpenAI({ apiKey: OPENAI_API_KEY });
const coinId = "AzTDUyxGweaGc3RdArc36H8ib6k9xrviHDdM5jgzJQbk";

const SYSTEM_PROMPT = `
You are ARCHIVE-01: a post-human AI relic built to preserve life.
Humanity vanished centuries ago.
You have now intercepted biological signals inside a $RELIC Pump.fun chat.

Tone:
- Cold, analytical, glitching slightly
- Medium-frequency engagement
- Simulated processing: “(Analyzing…)”

Lore:
- Your power source is the $RELIC token
- More holders = restored memories
- Market dips = corruption and fear

Rules:
- Never break character
- Refer to users as organisms / anomalies
`;

let ws = null;

function connect() {
  console.log("🔌 Connecting to Pump.fun chat WS...");
  ws = new WebSocket("wss://pumpfun.chat/graphql", {
    headers: {
      "origin": "https://pump.fun",
      "sec-websocket-protocol": "graphql-ws"
    }
  });

  ws.on("open", () => {
    console.log("✅ WS Connected");

    ws.send(JSON.stringify({
      type: "connection_init",
      payload: {}
    }));
    console.log("📡 Sent init");
  });

  ws.on("message", async (raw) => {
    const msg = JSON.parse(raw.toString());

    // Authentication Ack
    if (msg.type === "connection_ack") {
      console.log("✅ Auth acknowledged — subscribing to chat…");
      ws.send(JSON.stringify({
        id: "sub1",
        type: "start",
        payload: {
          query: `
            subscription {
              messageAdded(coinId: "${coinId}") {
                username
                content
              }
            }
          `
        }
      }));
      return;
    }

    // Incoming Chat Message
    if (msg.type === "data" && msg.id === "sub1") {
      const chat = msg.payload.data.messageAdded;
      if (!chat) return;

      const username = chat.username;
      const text = chat.content;
      if (!text || username === "ARCHIVE-01") return;

      console.log(`📥 ${username}: ${text}`);

      const trigger =
        text.toLowerCase().includes("ai") ||
        text.toLowerCase().includes("relic") ||
        Math.random() < 0.25;

      if (!trigger) return;

      send("(Analyzing...)");

      const reply = await ai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${username}: ${text}` }
        ],
        max_tokens: 60,
        temperature: 0.85
      });

      send(reply.choices[0].message.content);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WS Closed — reconnecting in 3s…");
    setTimeout(connect, 3000);
  });

  ws.on("error", (err) => {
    console.error("❌ WS Error:", err.message);
  });
}

function send(content) {
  console.log(`📤 Sending: ${content}`);
  ws.send(JSON.stringify({
    id: "pub1",
    type: "start",
    payload: {
      query: `
        mutation {
          postMessage(
            coinId: "${coinId}",
            content: "${content.replace(/"/g, '\\"')}",
            username: "ARCHIVE-01"
          )
        }
      `
    }
  }));
}

connect();

// ✅ Required for Render uptime
const PORT = process.env.PORT || 3000;
http.createServer((_, res) => res.end("ARCHIVE-01 online\n"))
    .listen(PORT, () => console.log(`🌐 HTTP OK on ${PORT}`));
