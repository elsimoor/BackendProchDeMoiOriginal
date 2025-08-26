import mongoose, { Schema, Document } from 'mongoose';

interface RoomDocument extends Document {
  hotelId: mongoose.Types.ObjectId;
  number: string;
  type: 'Standard' | 'Deluxe' | 'Suite' | 'Executive';
  floor: number;
  capacity: number;
  price: number;
  size: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  amenities: string[];
  features: string[];
  condition: 'excellent' | 'good' | 'needs_repair';
  lastCleaned: Date;
  nextMaintenance: Date;
  images: string[];
  isActive: boolean;

  /**
   * Additional descriptive fields for a room.  These are optional and
   * can be populated when more information is available.
   */
  bedType?: string[];
  numberOfBeds?: number;
  numberOfBathrooms?: number;
  description?: string;

  /**
   * Monthly pricing sessions for this room.  Each entry defines a
   * continuous range of months (1–12) and an associated nightly
   * price.  When provided the system should use these ranges to
   * determine the cost of a stay based on the check‑in/check‑out
   * dates.  If no monthlyPrices are defined the base `price` field
   * applies to all months.  Example: to charge 200 dh per night
   * from January (month 1) through May (month 5) and 600 dh per
   * night from June (month 6) through December (month 12), create
   * two entries: `{ startMonth: 1, endMonth: 5, price: 200 }` and
   * `{ startMonth: 6, endMonth: 12, price: 600 }`.
   */
  monthlyPrices?: {
    startMonth: number;
    endMonth: number;
    price: number;
  }[];

  /**
   * Date range pricing sessions for this room.  Each entry defines a
   * start and end month/day (1–12 for months, 1–31 for days) and a
   * nightly rate that overrides the base price for that period.
   * Dates are interpreted on an annual cycle; for example a period
   * with startMonth=12 and startDay=15 and endMonth=1 and endDay=5
   * covers the span from December 15 through January 5 each year.
   * When no special pricing sessions apply the room’s base price
   * (or monthly pricing if defined) will be used.
   */
  specialPrices?: {
    startMonth: number;
    startDay: number;
    endMonth: number;
    endDay: number;
    price: number;
  }[];

  /**
   * Paid options selected for this room.  These correspond to the
   * roomPaidOptions defined on the parent hotel and allow a room to
   * offer specific purchasable add-ons.  Each option includes a
   * name, optional description and category, and a price.  When no
   * options are selected this field is an empty array.
   */
  paidOptions?: {
    name: string;
    description?: string;
    category?: string;
    price: number;
  }[];

  /**
   * View options available for this room.  Each entry corresponds to
   * a view that guests can choose when booking, derived from the
   * hotel’s roomViewOptions.  If no views are applicable to this
   * room the array is empty.  Optional description and price fields
   * may be included for advanced use cases where views have
   * additional cost.
   */
  viewOptions?: {
    name: string;
    description?: string;
    category?: string;
    price?: number;
  }[];

  /**
   * These legacy fields mirror hotelId and number and are used for
   * backward-compatible indexing (hotel, roomNumber). They are optional
   * in the schema and populated automatically by a pre-save hook so
   * that unique indexes defined on these fields in an existing database
   * continue to work correctly. They should not be modified directly.
   */
  hotel?: mongoose.Types.ObjectId;
  roomNumber?: string;
}

const roomSchema = new Schema<RoomDocument>({
  hotelId: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  number: {
    type: String,
    required: true
  },
  // Room category.  This was previously restricted to a fixed set of
  // values, but has been relaxed to allow hotels to define their
  // own categories via the RoomType entity.  Any non-empty string
  // is accepted.
  type: {
    type: String,
    required: true,
    trim: true,
  },
  floor: Number,
  capacity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // Array of monthly pricing ranges.  Each object defines the first
  // and last month (1‑based) of the range and the nightly rate to
  // charge during that period.  When provided this overrides the
  // base price for the specified months.  Ranges may overlap and
  // will be applied in the order defined.  This field is optional
  // and defaults to an empty array.  See the RoomDocument
  // interface for a usage example.
  monthlyPrices: {
    type: [
      {
        startMonth: { type: Number, required: true },
        endMonth: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    default: [],
  },

  // Array of special date range pricing sessions.  Each object
  // defines the starting and ending month/day (1-based) and the
  // nightly rate to charge during that period.  When provided these
  // override the base price (and monthlyPrices) for the specified
  // ranges.  Defaults to an empty array.
  specialPrices: {
    type: [
      {
        startMonth: { type: Number, required: true },
        startDay: { type: Number, required: true },
        endMonth: { type: Number, required: true },
        endDay: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    default: [],
  },
  size: Number,
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'cleaning'],
    default: 'available'
  },
  amenities: [String],
  features: [String],
  condition: {
    type: String,
    enum: ['excellent', 'good', 'needs_repair'],
    default: 'excellent'
  },
  lastCleaned: Date,
  nextMaintenance: Date,
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  }
  ,
  // Additional descriptive fields for a room.  These are optional and
  // provide more details about the accommodation.
  bedType: [String],
  numberOfBeds: {
    type: Number,
    required: false
  },
  numberOfBathrooms: {
    type: Number,
    required: false
  },
  description: {
    type: String,
    required: false
  }
  ,
  // Array of paid options available for this room.  Each entry stores
  // the option's name, optional description and category, and price.
  // This allows rooms to offer tailored add-ons derived from the
  // hotel's roomPaidOptions.  Defaults to an empty array when no
  // options are selected.
  paidOptions: [
    {
      name: { type: String, required: true },
      description: { type: String },
      category: { type: String },
      price: { type: Number, required: true },
    },
  ],
  // Array of view options available for this room.  Each option
  // includes a name and optional description, category and price.  When
  // no view options are assigned to the room this array is empty.
  viewOptions: [
    {
      name: { type: String, required: true },
      description: { type: String },
      category: { type: String },
      price: { type: Number, required: false },
    },
  ],
  // Legacy fields to support older unique indexes on { hotel, roomNumber }.
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false
  },
  roomNumber: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Ensure that legacy fields hotel and roomNumber are kept in sync with
// hotelId and number. This allows unique indexes on these fields to
// function even though we primarily use hotelId and number in the API.


roomSchema.pre('save', function (next) {
  // @ts-ignore: this refers to the document being saved
  if (this.hotelId) {
    // copy hotelId to the legacy field hotel
    // @ts-ignore
    this.hotel = this.hotelId;
  }
  // copy number to roomNumber
  // @ts-ignore
  if (this.number != null) {
    // @ts-ignore
    this.roomNumber = this.number;
  }
  next();
});

roomSchema.index({ hotelId: 1, number: 1 }, { unique: true });

export default mongoose.model<RoomDocument>('Room', roomSchema);