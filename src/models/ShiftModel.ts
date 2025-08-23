import mongoose, { Document, Schema } from 'mongoose';

/**
 * A Shift represents a scheduled block of time during which a staff
 * member is working.  Each shift belongs to a business (client) and
 * references a specific staff member.  Shifts are stored with a
 * date (normalized to midnight), a start time and an end time in
 * 24‑hour HH:mm format.  The businessType field allows the same
 * model to be reused for different modules (salon, hotel, restaurant)
 * should scheduling be required in the future.  Notes can be used to
 * capture additional details about the shift (e.g. tasks or
 * observations).
 */
export interface IShift extends Document {
  businessId: mongoose.Types.ObjectId;
  businessType: 'salon' | 'hotel' | 'restaurant';
  staffId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  notes?: string;
}

const shiftSchema = new Schema<IShift>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    businessType: {
      type: String,
      enum: ['hotel', 'restaurant', 'salon'],
      required: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IShift>('Shift', shiftSchema);