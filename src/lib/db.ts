import { supabase, isSupabaseConfigured } from "./supabase";

export interface BloodRequest {
  id: string;
  patient_name: string;
  age: number;
  blood_group: string;
  lat: number | null;
  lng: number | null;
  address: string;
  requester_phone: string;
  status: "open" | "closed";
  created_at: string;
}

// Global fallback in-memory store for local testing
const inMemoryRequests: Map<string, BloodRequest> = new Map();

// Helper to normalize Indian phone numbers to 10 digits
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.substring(1);
  }
  return digits;
}

// Validator for Indian mobile numbers (starts with 6, 7, 8, or 9; exactly 10 digits)
export function isValidIndianPhone(phone: string): boolean {
  const normalized = normalizeIndianPhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

export async function createBloodRequest(
  data: Omit<BloodRequest, "id" | "status" | "created_at">
): Promise<BloodRequest> {
  const id = crypto.randomUUID();
  const newRequest: BloodRequest = {
    id,
    ...data,
    requester_phone: normalizeIndianPhone(data.requester_phone),
    status: "open",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: inserted, error } = await supabase
        .from("blood_requests")
        .insert([newRequest])
        .select()
        .single();

      if (error) {
        console.warn("Supabase insert error, falling back to local store:", error.message);
        inMemoryRequests.set(id, newRequest);
        return newRequest;
      }
      return inserted as BloodRequest;
    } catch (err) {
      console.warn("Database connection issue, falling back to local store:", err);
      inMemoryRequests.set(id, newRequest);
      return newRequest;
    }
  }

  // Fallback to in-memory store
  inMemoryRequests.set(id, newRequest);
  return newRequest;
}

export async function getBloodRequest(id: string): Promise<BloodRequest | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("blood_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as BloodRequest;
      }
    } catch (err) {
      console.warn("Database fetch error, checking local store:", err);
    }
  }

  return inMemoryRequests.get(id) || null;
}
