import mongoose, { Document, Schema } from 'mongoose';

interface IService extends Document {
  businessId: mongoose.Types.ObjectId;
  businessType: 'hotel' | 'restaurant' | 'salon';
  name: string;
  description?: string;
  category?: string;
  duration?: number; // in minutes
  price: number;
  available?: boolean;
  popular?: boolean;
  staffRequired: string[];
  requirements: string[];
  images: string[];
  isActive?: boolean;

  // New fields for salon services
  /**
   * Identifier of the default employee assigned to this service.  This
   * field allows salon owners to specify which staff member should be
   * scheduled by default when a client books the service.  It stores
   * a string referencing the Staff document’s id.
   */
  defaultEmployee?: string;
  /**
   * Identifier of the default room assigned to this service.  Rooms in
   * a salon are analogous to tables in a restaurant or rooms in a hotel.
   * If provided, booking the service will automatically reserve the
   * corresponding room.  It stores a string referencing the Table
   * document’s id, which is re‑used for salon rooms.
   */
  defaultRoom?: string;
  /**
   * Whether clients are allowed to choose their own employee and/or
   * room when booking this service.  When set to true the booking UI
   * will offer a selection of available staff and rooms instead of
   * automatically assigning the defaults.
   */
  allowClientChoose?: boolean;
  /**
   * Optional service add‑ons.  Each option can modify the price and
   * duration of the service.  For example, adding a hot stone massage
   * option might add 15 minutes and 10€ to the base service.  These
   * options are embedded directly on the service rather than being
   * separate documents.
   */
  options?: {
    name: string;
    price?: number;
    durationImpact?: number;
  }[];
}

const serviceSchema = new Schema<IService>({
  businessId: {
    type: Schema.Types.ObjectId,
    required: true,
    // Link to the client that owns this service.  In previous versions
    // this field pointed at Hotel/Restaurant/Salon.  Now it always
    // references a Client document.
    ref: 'Client',
  },
  businessType: {
    type: String,
    enum: ['hotel', 'restaurant', 'salon'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  duration: Number, // in minutes
  price: {
    type: Number,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  staffRequired: [String],
  requirements: [String],
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  }
  ,
  // Additional salon-specific fields
  defaultEmployee: {
    type: String,
    default: null
  },
  defaultRoom: {
    type: String,
    default: null
  },
  allowClientChoose: {
    type: Boolean,
    default: false
  },
  options: [
    {
      name: String,
      price: Number,
      durationImpact: Number
    }
  ]
}, {
  timestamps: true
});

export default mongoose.model<IService>('Service', serviceSchema);