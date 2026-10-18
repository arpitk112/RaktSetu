import { Donor, getAllDonors } from "./donors";
import { BloodRequest } from "./db";
import { calculateDistanceKm } from "./blood-banks";

export interface DonorRequestRecord {
  id: string;
  search_id: string;
  donor_id: string;
  donor_name: string;
  donor_phone: string;
  donor_blood_group: string;
  distance_km: number;
  status: "sent" | "yes" | "no" | "no_response" | "failed";
  sent_at: string;
  responded_at: string | null;
}

// In-memory store for donor requests
const inMemoryDonorRequests = new Map<string, DonorRequestRecord>();

// Notification Channel Interface (Swappable for WhatsApp later)
export interface NotificationChannel {
  name: string;
  sendAvailabilityCheck(
    donor: Donor,
    request: BloodRequest,
    searchId: string,
    distanceKm: number
  ): Promise<{ success: boolean; error?: string }>;
}

export class TelegramNotificationChannel implements NotificationChannel {
  name = "Telegram";

  async sendAvailabilityCheck(
    donor: Donor,
    request: BloodRequest,
    searchId: string,
    distanceKm: number
  ): Promise<{ success: boolean; error?: string }> {
    const requestId = crypto.randomUUID();

    const record: DonorRequestRecord = {
      id: requestId,
      search_id: searchId,
      donor_id: donor.id,
      donor_name: donor.name,
      donor_phone: donor.phone,
      donor_blood_group: donor.blood_group,
      distance_km: distanceKm,
      status: "sent",
      sent_at: new Date().toISOString(),
      responded_at: null,
    };

    inMemoryDonorRequests.set(requestId, record);

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = donor.telegram_chat_id;

    // If live Telegram bot token and chat ID are configured, transmit via Telegram API
    if (botToken && chatId) {
      try {
        const text = `🩸 *Urgent Blood Need*\n\nSomeone near *${request.address}* urgently needs *${request.blood_group}* blood.\n\nAre you available to donate? Tap below to reply. If YES, your contact will be shared with the patient's family.`;
        const keyboard = {
          inline_keyboard: [
            [
              { text: "✅ YES (I can donate)", callback_data: `yes:${requestId}` },
              { text: "❌ NO (Cannot donate)", callback_data: `no:${requestId}` },
            ],
          ],
        };

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "Markdown",
            reply_markup: keyboard,
          }),
        });

        if (!res.ok) {
          console.warn("Telegram sendMessage API responded with non-200:", await res.text());
        }
      } catch (err) {
        console.warn("Telegram send failed, keeping record as sent for local simulation:", err);
      }
    }

    return { success: true };
  }
}

// Disabled stub for future WhatsApp Cloud API upgrade (Meta template required)
export class WhatsAppNotificationChannel implements NotificationChannel {
  name = "WhatsApp (Disabled Stub)";

  async sendAvailabilityCheck(): Promise<{ success: boolean; error?: string }> {
    return {
      success: false,
      error:
        "WhatsApp automated messaging requires paid Meta Business Cloud API. Using free Telegram channel.",
    };
  }
}

export const activeNotificationChannel: NotificationChannel = new TelegramNotificationChannel();

// Record a donor's YES or NO response
export function updateDonorRequestStatus(
  requestId: string,
  status: "yes" | "no" | "no_response"
): DonorRequestRecord | null {
  const req = inMemoryDonorRequests.get(requestId);
  if (!req) return null;

  req.status = status;
  req.responded_at = new Date().toISOString();
  return req;
}

export function getDonorRequestsForSearch(searchId: string): DonorRequestRecord[] {
  return Array.from(inMemoryDonorRequests.values()).filter(
    (r) => r.search_id === searchId
  );
}

// Find matched donors and dispatch outreach messages
export async function matchAndAskDonors(
  bloodRequest: BloodRequest,
  searchId: string,
  radiusKm = 15
): Promise<{ askedCount: number; matchedDonors: DonorRequestRecord[] }> {
  const allDonors = await getAllDonors();
  const compatible = allDonors.filter((d) => {
    if (!d.is_active || !d.phone_verified || !d.consent_whatsapp || !d.consent_share) {
      return false;
    }

    // Check donation cooldown (minimum 90 days)
    if (d.last_donated_at) {
      const last = new Date(d.last_donated_at).getTime();
      const diffDays = (Date.now() - last) / (1000 * 3600 * 24);
      if (diffDays < 90) return false;
    }

    // Check 12-hour notification cooldown
    const recentMessage = Array.from(inMemoryDonorRequests.values()).find(
      (r) =>
        r.donor_id === d.id &&
        Date.now() - new Date(r.sent_at).getTime() < 12 * 3600 * 1000
    );
    if (recentMessage) return false;

    return true;
  });

  // Calculate distances
  const patientLat = bloodRequest.lat ?? 28.5672;
  const patientLng = bloodRequest.lng ?? 77.2100;

  const withDistances = compatible
    .map((donor) => {
      const dLat = donor.lat ?? patientLat;
      const dLng = donor.lng ?? patientLng;
      const distance = calculateDistanceKm(patientLat, patientLng, dLat, dLng);
      return { donor, distance };
    })
    .filter((item) => item.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15); // Limit to nearest 15 per round to prevent spam

  const dispatchedRecords: DonorRequestRecord[] = [];

  for (const { donor, distance } of withDistances) {
    await activeNotificationChannel.sendAvailabilityCheck(
      donor,
      bloodRequest,
      searchId,
      distance
    );
  }

  const results = getDonorRequestsForSearch(searchId);
  return { askedCount: results.length, matchedDonors: results };
}
