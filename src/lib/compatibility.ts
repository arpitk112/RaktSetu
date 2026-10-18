import { BloodGroup } from "./constants";

// Medical red blood cell compatibility matrix
// Keys = Patient's blood group (recipient)
// Values = Compatible donor blood groups
export const BLOOD_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal recipient
  "AB-": ["AB-", "A-", "B-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"], // Universal donor
};

export function getCompatibleBloodGroups(patientGroup: string): BloodGroup[] {
  const group = patientGroup.trim() as BloodGroup;
  return BLOOD_COMPATIBILITY[group] || [group];
}

export function isBloodCompatible(patientGroup: string, donorGroup: string): boolean {
  const compatible = getCompatibleBloodGroups(patientGroup);
  return compatible.includes(donorGroup.trim() as BloodGroup);
}
