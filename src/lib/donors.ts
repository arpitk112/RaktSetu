import { supabase, isSupabaseConfigured } from "./supabase";
import { normalizeIndianPhone } from "./db";

export interface Donor {
  id: string;
  name: string;
  age: number;
  blood_group: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  phone_verified: boolean;
  verification_code: string;
  telegram_chat_id: string | null;
  consent_whatsapp: boolean;
  consent_share: boolean;
  last_donated_at: string | null;
  is_active: boolean;
  created_at: string;
}

// In-memory store with realistic seed donors for testing
const inMemoryDonors: Map<string, Donor> = new Map();

// Seed initial certified test donors across key Indian areas
const initialSeedDonors: Donor[] = [
  {
    id: "donor-del-1",
    name: "Vikram Malhotra",
    age: 28,
    blood_group: "O+",
    address: "Hauz Khas, New Delhi",
    lat: 28.5494,
    lng: 77.2001,
    phone: "9811223344",
    phone_verified: true,
    verification_code: "RS-SEED01",
    telegram_chat_id: "demo_chat_1",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: "2024-01-15",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "donor-del-2",
    name: "Ananya Sharma",
    age: 32,
    blood_group: "A+",
    address: "Green Park, New Delhi",
    lat: 28.5589,
    lng: 77.2028,
    phone: "9822334455",
    phone_verified: true,
    verification_code: "RS-SEED02",
    telegram_chat_id: "demo_chat_2",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "donor-del-3",
    name: "Rohan Gupta",
    age: 26,
    blood_group: "B+",
    address: "Lajpat Nagar, New Delhi",
    lat: 28.5700,
    lng: 77.2400,
    phone: "9833445566",
    phone_verified: true,
    verification_code: "RS-SEED03",
    telegram_chat_id: "demo_chat_3",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "donor-del-4",
    name: "Meera Sen",
    age: 24,
    blood_group: "O-",
    address: "South Extension, New Delhi",
    lat: 28.5732,
    lng: 77.2201,
    phone: "9844556677",
    phone_verified: true,
    verification_code: "RS-SEED04",
    telegram_chat_id: "demo_chat_4",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "donor-blr-1",
    name: "Karthik Raja",
    age: 30,
    blood_group: "A+",
    address: "Indiranagar, Bengaluru",
    lat: 12.9784,
    lng: 77.6408,
    phone: "9855667788",
    phone_verified: true,
    verification_code: "RS-SEED05",
    telegram_chat_id: "demo_chat_5",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "donor-blr-2",
    name: "Divya Nambiar",
    age: 29,
    blood_group: "O+",
    address: "Koramangala, Bengaluru",
    lat: 12.9352,
    lng: 77.6245,
    phone: "9866778899",
    phone_verified: true,
    verification_code: "RS-SEED06",
    telegram_chat_id: "demo_chat_6",
    consent_whatsapp: true,
    consent_share: true,
    last_donated_at: null,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// Initialize seed donors
initialSeedDonors.forEach((d) => inMemoryDonors.set(d.phone, d));

export async function createDonor(data: {
  name: string;
  age: number;
  blood_group: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string;
  consent_whatsapp: boolean;
  consent_share: boolean;
  last_donated_at: string | null;
}): Promise<{ donor: Donor; verificationCode: string; alreadyExisted: boolean }> {
  const normalizedPhone = normalizeIndianPhone(data.phone);
  const existing = inMemoryDonors.get(normalizedPhone);

  const code = `RS-${Math.floor(100000 + Math.random() * 900000)}`;

  if (existing) {
    // Update existing profile with new verification code
    existing.name = data.name;
    existing.age = data.age;
    existing.blood_group = data.blood_group;
    existing.address = data.address;
    existing.lat = data.lat;
    existing.lng = data.lng;
    existing.consent_whatsapp = data.consent_whatsapp;
    existing.consent_share = data.consent_share;
    existing.last_donated_at = data.last_donated_at;
    existing.verification_code = code;
    existing.is_active = true;

    return { donor: existing, verificationCode: code, alreadyExisted: true };
  }

  const id = crypto.randomUUID();
  const newDonor: Donor = {
    id,
    name: data.name,
    age: data.age,
    blood_group: data.blood_group,
    address: data.address,
    lat: data.lat,
    lng: data.lng,
    phone: normalizedPhone,
    phone_verified: false,
    verification_code: code,
    telegram_chat_id: null,
    consent_whatsapp: data.consent_whatsapp,
    consent_share: data.consent_share,
    last_donated_at: data.last_donated_at,
    is_active: true,
    created_at: new Date().toISOString(),
  };

  inMemoryDonors.set(normalizedPhone, newDonor);

  // If Supabase is available, sync to DB
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("donors").upsert([newDonor], { onConflict: "phone" });
    } catch (e) {
      console.warn("Supabase donor save error:", e);
    }
  }

  return { donor: newDonor, verificationCode: code, alreadyExisted: false };
}

export async function verifyDonorByCode(
  code: string,
  telegramChatId?: string,
  verifiedPhone?: string
): Promise<Donor | null> {
  // 1. Check in-memory first
  for (const donor of inMemoryDonors.values()) {
    if (donor.verification_code === code) {
      donor.phone_verified = true;
      if (telegramChatId) {
        donor.telegram_chat_id = telegramChatId;
      }
      if (verifiedPhone) {
        donor.phone = normalizeIndianPhone(verifiedPhone);
      }

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from("donors")
            .update({
              phone_verified: true,
              telegram_chat_id: donor.telegram_chat_id,
            })
            .eq("id", donor.id);
        } catch (e) {
          console.warn("Supabase donor verification update error:", e);
        }
      }

      return donor;
    }
  }

  // 2. Also check Supabase directly if not found in memory
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("verification_code", code)
        .maybeSingle();

      if (data && !error) {
        const updatedChatId = telegramChatId || data.telegram_chat_id;
        await supabase
          .from("donors")
          .update({
            phone_verified: true,
            telegram_chat_id: updatedChatId,
          })
          .eq("id", data.id);

        const verifiedDonor: Donor = {
          ...data,
          phone_verified: true,
          telegram_chat_id: updatedChatId,
        };
        inMemoryDonors.set(verifiedDonor.phone, verifiedDonor);
        return verifiedDonor;
      }
    } catch (e) {
      console.warn("Supabase donor verification query error:", e);
    }
  }

  return null;
}

export async function getDonorByPhone(phone: string): Promise<Donor | null> {
  const norm = normalizeIndianPhone(phone);
  const mem = inMemoryDonors.get(norm);
  if (mem) return mem;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("phone", norm)
        .maybeSingle();
      if (data && !error) {
        inMemoryDonors.set(norm, data as Donor);
        return data as Donor;
      }
    } catch (e) {
      console.warn("Supabase getDonorByPhone error:", e);
    }
  }
  return null;
}

export async function getAllDonors(): Promise<Donor[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("donors").select("*");
      if (data && !error && data.length > 0) {
        data.forEach((d) => inMemoryDonors.set(d.phone, d as Donor));
        return data as Donor[];
      }
    } catch (e) {
      console.warn("Supabase getAllDonors error:", e);
    }
  }
  return Array.from(inMemoryDonors.values());
}

export async function updateDonorActiveStatus(
  phone: string,
  isActive: boolean
): Promise<boolean> {
  const donor = await getDonorByPhone(phone);
  if (!donor) return false;
  donor.is_active = isActive;

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("donors")
        .update({ is_active: isActive })
        .eq("phone", donor.phone);
    } catch (e) {
      console.warn("Supabase updateDonorActiveStatus error:", e);
    }
  }
  return true;
}

export async function deleteDonorByPhone(phone: string): Promise<boolean> {
  const norm = normalizeIndianPhone(phone);
  inMemoryDonors.delete(norm);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("donors").delete().eq("phone", norm);
    } catch (e) {
      console.warn("Supabase deleteDonorByPhone error:", e);
    }
  }
  return true;
}
