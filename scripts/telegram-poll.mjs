import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let token = process.env.TELEGRAM_BOT_TOKEN;

if (!token && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    if (line.startsWith("TELEGRAM_BOT_TOKEN=")) {
      token = line.split("=")[1].trim();
      break;
    }
  }
}

if (!token || token.includes("your-telegram-bot-token")) {
  console.error("❌ TELEGRAM_BOT_TOKEN not found in .env.local");
  process.exit(1);
}

console.log("🤖 RaktSetu Telegram Bot Poller active!");
console.log("Listening for messages and /start commands...\n");

let offset = 0;

async function poll() {
  while (true) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=10`
      );
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // Forward update to local Next.js webhook handler
          try {
            const webhookRes = await fetch("http://localhost:3000/api/telegram/webhook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(update),
            });
            console.log(`[Update #${update.update_id}] Processed -> Status ${webhookRes.status}`);
          } catch (whErr) {
            console.warn(`[Update #${update.update_id}] Local webhook error:`, whErr.message);
          }
        }
      }
    } catch (err) {
      console.warn("Polling error, retrying in 3s...", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}

poll();
