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
  type: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Suite', 'Executive']
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