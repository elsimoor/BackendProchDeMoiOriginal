import mongoose, { Schema, Document } from 'mongoose';

interface HotelDocument extends Document {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  settings: {
    checkInTime: string;
    checkOutTime: string;
    currency: string;
    timezone: string;
    taxRate: number;
    serviceFee: number;
  };
  amenities: {
    name: string;
    description: string;
    included: boolean;
    category: string;
  }[];
  services: {
    name: string;
    description: string;
    price: number;
    category: string;
    available: boolean;
  }[];
  policies: {
    title: string;
    description: string;
    category: string;
  }[];
  images: string[];
  rating: {
    average: number;
    count: number;
  };
  isActive: boolean;

  /**
   * Opening periods during which the hotel accepts reservations.  Each
   * period has a startDate and endDate.  Reservations cannot be made
   * outside of these ranges.
   */
  openingPeriods?: { startDate: Date; endDate: Date }[];

  /**
   * Paid room options that can be purchased with a stay.  Each option
   * represents an add‑on such as petals, champagne boxes or other
   * amenities that have an associated price.  Options include a name,
   * optional description and category, and a price.
   */
  roomPaidOptions?: {
    name: string;
    description?: string;
    category?: string;
    price: number;
  }[];

  /**
   * View options that guests can choose when booking a room.  Each entry
   * defines a type of view available at the hotel, such as "City View"
   * or "Garden View".  A view option may include an optional
   * description and an optional price when the hotel charges for
   * specific views.  The price field should default to 0 when views
   * have no extra cost.
   */
  roomViewOptions?: {
    name: string;
    description?: string;
    price?: number;
  }[];
}

const hotelSchema = new Schema<HotelDocument>({
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
    checkInTime: { type: String, default: '15:00' },
    checkOutTime: { type: String, default: '11:00' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    taxRate: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 }
  },
  amenities: [{
    name: String,
    description: String,
    included: { type: Boolean, default: true },
    category: String,
    price: { type: Number, default: 0 }

  }],
  services: [{
    name: String,
    description: String,
    price: Number,
    category: String,
    available: { type: Boolean, default: true }
  }],
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
  // Hotels are created inactive by default.  An administrator must
  // approve a hotel before it can appear in listings or be accessed
  // by its manager.  Once approved the isActive flag is set to true.
  isActive: {
    type: Boolean,
    default: false
  },
  // Array of opening periods for the hotel.  Each period defines a
  // continuous range of dates during which the hotel is open for
  // reservations.  Optional and defaults to empty array.
  openingPeriods: [
    {
      startDate: Date,
      endDate: Date
    }
  ],
  // Array of paid room options.  Each entry has a name, optional
  // description and category, and a price.  This allows hotel
  // managers to offer purchasable extras such as petals or boxes
  // when guests book a room.
  roomPaidOptions: [{
    name: String,
    description: String,
    category: String,
    price: Number
  }]
  ,
  // Array of view options that can be selected when booking a room.
  // Each option includes a name, optional description and optional
  // price.  This allows hotels to offer different views (e.g.
  // "City View", "Garden View") that guests can select when
  // completing a booking.  If a view has no additional cost the
  // price should be set to 0 or omitted.
  roomViewOptions: [{
    name: String,
    description: String,
    price: Number
  }]
}, {
  timestamps: true
});

export default mongoose.model<HotelDocument>('Hotel', hotelSchema);