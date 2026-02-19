import { Timestamp } from 'firebase/firestore';

export interface Location {
  id: string;
  label: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isPrimary: boolean;
}

export interface Household {
  adults: number;
  children: number;
  infants: number;
  pets: { type: string; count: number }[];
  specialNeeds: string[];
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isOutOfState: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp | null;
  profileComplete: boolean;
  locations: Location[];
  household: Household;
  emergencyContacts: EmergencyContact[];
}

export interface RiskItem {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  seasonalMonths: number[];
  icon: string;
}

export interface KitItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  acquired: boolean;
  notes?: string;
}
