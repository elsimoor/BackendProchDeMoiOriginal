import mongoose, { Schema, Document } from 'mongoose';

/**
 * A RoomType represents a category of rooms offered by a hotel.  It
 * contains a name and is associated with a specific hotel via the
 * `hotelId` field.  Additional properties (e.g. description) can be
 * added in the future without affecting existing clients.  When a
 * room type is deleted it is simply marked inactive rather than
 * removed from the database.
 */
interface RoomTypeDocument extends Document {
  hotelId: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
}

const roomTypeSchema = new Schema<RoomTypeDocument>(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// enforce unique room type names per hotel
roomTypeSchema.index({ hotelId: 1, name: 1 }, { unique: true });

export default mongoose.model<RoomTypeDocument>('RoomType', roomTypeSchema);