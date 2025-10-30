import WebSocket from "ws";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment variables!");
  process.exit(1);
}

const client = new WebSocket("wss://pumpportal.fun/ws");
const ai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
  console.log("ARCHIVE-01 connected to Stream.");
});

client.on("message", (data) => {
  try {
    const msg = JSON.parse(data.toString());
    console.log("WS EVENT:", JSON.stringify(msg, null, 2));
  } catch (err) {
    console.error("PARSE ERROR:", err);
  }
});

// Minimal HTTP server to keep Render happy
import http from "http";

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("ARCHIVE-01 is operational.\n");
}).listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
});

