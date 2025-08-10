import mongoose, { Document, Schema } from 'mongoose';

interface IAvailability {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface IStaff extends Document {
  businessId: mongoose.Types.ObjectId;
  businessType: 'hotel' | 'restaurant' | 'salon';
  userId?: mongoose.Types.ObjectId;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  hireDate?: Date;
  schedule?: 'Full-time' | 'Part-time' | 'Contract';
  hourlyRate?: number;
  status?: 'active' | 'on-leave' | 'inactive';
  specialties: string[];
  availability: IAvailability[];
  avatar?: string;
  notes?: string;
  isActive?: boolean;
}

const staffSchema = new Schema<IStaff>({
  businessId: {
    type: Schema.Types.ObjectId,
    required: true,
    // Associate a staff member with a client.  Previously this pointed
    // at Hotel/Restaurant/Salon documents.  Now it references the Client
    // entity for multi‑tenant support.
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
  role: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  hireDate: Date,
  schedule: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract'],
    default: 'Full-time'
  },
  hourlyRate: Number,
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active'
  },
  specialties: [String],
  availability: [{
    day: String,
    startTime: String,
    endTime: String,
    available: { type: Boolean, default: true }
  }],
  avatar: String,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IStaff>('Staff', staffSchema);