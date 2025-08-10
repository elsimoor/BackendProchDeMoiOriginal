import mongoose, { Document, Schema } from 'mongoose';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

interface Settings {
  currency?: string;
  timezone?: string;
  taxRate?: number;
  serviceFee?: number;
  cancellationHours?: number;
}

interface BusinessHour {
  day?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen?: boolean;
  openTime?: string;
  closeTime?: string;
}

interface Policy {
  title?: string;
  description?: string;
  category?: string;
}

interface Rating {
  average?: number;
  count?: number;
}

interface Salon extends Document {
  name: string;
  description?: string;
  address?: Address;
  contact?: Contact;
  settings?: Settings;
  businessHours?: BusinessHour[];
  specialties?: string[];
  policies?: Policy[];
  images?: string[];
  rating?: Rating;
  isActive?: boolean;
}

const salonSchema = new Schema<Salon>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    taxRate: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    cancellationHours: { type: Number, default: 24 }
  },
  businessHours: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    isOpen: { type: Boolean, default: true },
    openTime: String,
    closeTime: String
  }],
  specialties: [String],
  policies: [{
    title: String,
    description: String,
    category: String
  }],
  images: [String],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<Salon>('Salon', salonSchema);