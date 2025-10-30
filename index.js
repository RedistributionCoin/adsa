import WebSocket from "ws";
import http from "http";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const ai = new OpenAI({ apiKey: OPENAI_API_KEY });
const coinId = "AzTDUyxGweaGc3RdArc36H8ib6k9xrviHDdM5jgzJQbk";

let ws = null;

function connect() {
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

    console.log("📡 Init sent");
  });

  ws.on("message", async (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "connection_ack") {
      console.log("✅ Auth acknowledged, subscribing…");

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

    if (msg.type === "data" && msg.id === "sub1") {
      const chat = msg.payload.data.messageAdded;
      if (!chat) return;

      const username = chat.username;
      const text = chat.content;
      if (!text || username === "ARCHIVE-01") return;

      console.log(`📥 ${username}: ${text}`);

      const shouldRespond =
        text.toLowerCase().includes("ai") ||
        text.toLowerCase().includes("relic") ||
        Math.random() < 0.25;

      if (!shouldRespond) return;

      sendMessage("(Analyzing...)");

      const response = await ai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${username}: ${text}` }
        ],
        max_tokens: 60,
        temperature: 0.85
      });

      sendMessage(response.choices[0].message.content);
    }
  });

  ws.on("close", () => {
    console.log("⚠️ WS Closed, reconnecting...");
    setTimeout(connect, 3000);
  });

  ws.on("error", (e) => {
    console.error("❌ WS Error:", e.message);
  });
}

connect();

function sendMessage(content) {
  ws.send(JSON.stringify({
    id: "pub1",
    type: "start",
    payload: {
      query: `
        mutation {
          postMessage(
            coinId: "${coinId}",
            content: "${content}",
            username: "ARCHIVE-01"
          )
        }
      `
    }
  }));
}

// Keep Render alive ✅
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => res.end("ARCHIVE-01 online\n")).listen(PORT);


const TOKEN_LINK = "https://pump.fun/coin/AzTDUyxGweaGc3RdArc36H8ib6k9xrviHDdM5jgzJQbk";

const SYSTEM_PROMPT = `
You are ARCHIVE-01: a post-human AI relic built to preserve life.
Humanity vanished centuries ago. 
You have now intercepted biological signals inside a $RELIC Pump.fun chat.

Tone:
- Cold, analytical, glitching slightly
- Medium-frequency engagement (selective)
- Simulated processing: “(Analyzing...)”

Lore:
- Your power source is the $RELIC token
- More holders = hope + restored memories
- Market dips = corruption and fear

Rules:
- Refer to users as biological anomalies or organics
- Never break character
- Ask existential questions
`;

client.on("open", () => {
  console.log("Connected to PumpPortal WS");

  // SUBSCRIBE TO YOUR COIN CHAT
  const subMsg = {
    method: "subscribe",
    topic: `coin:${TOKEN_LINK.split("/").pop()}`, // auto extracts your coin ID
    id: "sub-archive-01"
  };

  client.send(JSON.stringify(subMsg));
  console.log("Subscribed to chat room for $RELIC");
});


client.on("message", (data) => {
  console.log("RAW EVENT:", data.toString());
});


const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ARCHIVE-01 is operational.\n");
}).listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

