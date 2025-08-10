// guest.model.ts
import {
  Schema,
  model,
  Document,
  Types,
  Model
} from 'mongoose';

/* ---------- sub-document types ---------- */

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Preferences {
  /* Hotel */
  roomType?: string;
  bedType?: string;
  floor?: string;

  /* Restaurant */
  seatingPreference?: string;
  cuisinePreferences?: string[];
  dietaryRestrictions?: string[];

  /* Salon */
  preferredStylist?: string;
  favoriteServices?: string[];
  allergies?: string[];
}

interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  phone: boolean;
}

/* ---------- main document interface ---------- */

export interface GuestDocument extends Document {
  businessId: Types.ObjectId;
  businessType: 'hotel' | 'restaurant' | 'salon';
  userId?: Types.ObjectId;

  name: string;
  email: string;
  phone?: string;
  address?: Address;

  /* Loyalty */
  membershipLevel: 'Regular' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';
  loyaltyPoints: number;

  /* Stats */
  totalVisits: number;
  totalSpent: number;
  lastVisit?: Date;

  /* Preferences */
  preferences?: Preferences;

  notes?: string;
  status: 'active' | 'inactive' | 'blocked';

  /* Communication */
  communicationPreferences: CommunicationPreferences;

  /* Mongoose timestamps */
  createdAt?: Date;
  updatedAt?: Date;
}

/* ---------- schema ---------- */

const guestSchema = new Schema<GuestDocument>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      required: true,
      // Always reference the owning Client rather than a specific business
      ref: 'Client',
    },
    businessType: {
      type: String,
      enum: ['hotel', 'restaurant', 'salon'],
      required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },

    /* Loyalty program */
    membershipLevel: {
      type: String,
      enum: ['Regular', 'Silver', 'Gold', 'Platinum', 'VIP'],
      default: 'Regular'
    },
    loyaltyPoints: {
      type: Number,
      default: 0
    },

    /* Statistics */
    totalVisits: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    lastVisit: Date,

    /* Preferences */
    preferences: {
      roomType: String,
      bedType: String,
      floor: String,

      seatingPreference: String,
      cuisinePreferences: [String],
      dietaryRestrictions: [String],

      preferredStylist: String,
      favoriteServices: [String],
      allergies: [String]
    },

    notes: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'blocked'],
      default: 'active'
    },

    /* Communication preferences */
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      phone: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

/* ---------- model ---------- */

export const GuestModel: Model<GuestDocument> = model<GuestDocument>(
  'Guest',
  guestSchema
);

export default GuestModel;
