import mongoose, { Schema, Document } from 'mongoose';

interface ReservationDocument extends Document {
  /** The owning client for this reservation */
  businessId: mongoose.Types.ObjectId;
  /**
   * Type of reservation.  Historically this field referenced the
   * underlying model (hotel/restaurant/salon).  It now indicates the
   * module enabled on the client: `hotel` for room bookings, `restaurant`
   * for table bookings and `salon` for service bookings.  This field is
   * maintained for backwards compatibility.
   */
  businessType: 'hotel' | 'restaurant' | 'salon';
  customerId?: mongoose.Types.ObjectId;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  roomId?: mongoose.Types.ObjectId;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  tableId?: mongoose.Types.ObjectId;
  partySize?: number;
  serviceId?: mongoose.Types.ObjectId;
  staffId?: mongoose.Types.ObjectId;
  date: Date;
  time?: string;
  duration?: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  totalAmount?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  notes?: string;
  specialRequests?: string;
  reminderSent: boolean;
  source: 'website' | 'phone' | 'walk-in' | 'admin';

  /**
   * Optional URL pointing to a reservation details file (e.g. a
   * Word document) that contains additional requirements or
   * specifications provided by the client.  When present this URL
   * should point to a file stored in an external storage system.  If
   * no reservation file is provided this property is undefined.
   */
  reservationFileUrl?: string;

  /**
   * The name of the payment method chosen by the client when
   * creating the reservation.  This corresponds to one of the
   * restaurant’s configured payment methods (e.g. "Credit Card",
   * "Cash", "PayPal").  When undefined the default payment method
   * applies (typically card).  Adding this field enables the
   * front‑end user to select how they intend to pay for their
   * booking.
   */
  paymentMethod?: string;
}

const reservationSchema = new Schema<ReservationDocument>({
  businessId: {
    type: Schema.Types.ObjectId,
    // Reference the Client model rather than Hotel.  While the original
    // implementation assumed a hotel reservation, the businessId now
    // always points to a Client (tenant) document.  Mongoose population
    // using this ref will therefore load Client records.
    refPath: 'Client',
  },
  businessType: {
    type: String,
    enum: ['hotel', 'restaurant', 'salon'],
    
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  customerInfo: {
    name: { type: String,  },
    email: { type: String,  },
    phone: { type: String,  }
  },
  roomId: {
    type: Schema.Types.ObjectId,
    ref: 'Room'
  },
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table'
  },
  partySize: Number,
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service'
  },
  staffId: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  date: { type: Date,  },
  time: String,
  duration: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  totalAmount: Number,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  notes: String,
  specialRequests: String,
  reminderSent: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'walk-in', 'admin', 'new-ui'],
    default: 'website'
  }
  ,
  // URL of an uploaded reservation file (e.g. Word document) with
  // detailed requirements.  This field is optional and remains
  // undefined when no file is attached to the reservation.
  reservationFileUrl: {
    type: String
  }
  ,
  // Name of the payment method selected by the client.  This
  // property stores a simple string (e.g. "Credit Card", "Cash")
  // referencing one of the restaurant's paymentMethods.  When no
  // payment method is provided this field remains undefined.
  paymentMethod: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model<ReservationDocument>('Reservation', reservationSchema);