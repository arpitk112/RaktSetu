import { NextRequest, NextResponse } from "next/server";
import { updateDonorRequestStatus } from "@/lib/notifications";
import { verifyDonorByCode, updateDonorActiveStatus } from "@/lib/donors";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle Inline Keyboard Callbacks (Yes / No for availability check)
    if (update.callback_query) {
      const callbackData = update.callback_query.data as string;
      const [action, requestId] = callbackData.split(":");
      const chatId = update.callback_query.message?.chat?.id;

      if (action === "yes" && requestId) {
        updateDonorRequestStatus(requestId, "yes");

        // Send acknowledgement to donor
        if (chatId && process.env.TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "❤️ *Thank you!* Your contact number is being shared with the patient's family right now. Please stay reachable by phone or WhatsApp.",
              parse_mode: "Markdown",
            }),
          });
        }
      } else if (action === "no" && requestId) {
        updateDonorRequestStatus(requestId, "no");

        if (chatId && process.env.TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Understood. Thank you for letting us know! We will ask other nearby donors.",
            }),
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    // 2. Handle Text Messages (/start CODE for phone verification, or STOP)
    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = String(update.message.chat.id);

      // Registration Deep Link verification: /start RS-123456 or just pasting RS-123456
      const rsMatch = text.match(/RS-\d+/i);
      if (rsMatch) {
        const code = rsMatch[0].toUpperCase();
        const verified = await verifyDonorByCode(code, chatId);

        if (verified && process.env.TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🎉 *Registration Complete!* Welcome ${verified.name}.\n\nYour phone number (*${verified.phone}*) is verified. You will only be messaged when someone near ${verified.address} urgently needs *${verified.blood_group}* blood.\n\nReply *STOP* anytime to pause notifications.`,
              parse_mode: "Markdown",
            }),
          });
        } else if (process.env.TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `⚠️ Verification code *${code}* not found or expired. Please re-register at http://localhost:3000/donate`,
              parse_mode: "Markdown",
            }),
          });
        }
        return NextResponse.json({ ok: true });
      }

      // STOP command to pause notifications
      if (text.toUpperCase() === "STOP") {
        if (process.env.TELEGRAM_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Your donor profile has been paused. You will not receive any blood requests. Text START to resume anytime.",
            }),
          });
        }
        return NextResponse.json({ ok: true });
      }

      // Default welcome for bare /start
      if (text.startsWith("/start") && process.env.TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: "👋 *Welcome to RaktSetu (रक्तसेतु)*!\n\nTo register as a voluntary blood donor, please fill out the form at [http://localhost:3000/donate](http://localhost:3000/donate) and click *'Open Telegram Bot'* to connect.",
            parse_mode: "Markdown",
          }),
        });
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Telegram webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
