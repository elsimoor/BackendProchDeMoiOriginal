import mongoose, { Schema, Document } from 'mongoose';

/**
 * Payment model
 *
 * Represents a payment transaction processed via Stripe or other
 * providers.  Payments are typically created when a checkout
 * session is initiated for a reservation and updated via webhook
 * events once the payment completes.  Each payment references the
 * associated reservation and invoice, along with details about
 * amounts, currency and Stripe identifiers.
 */
export interface PaymentDocument extends Document {
  reservationId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation' },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    businessId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    paymentMethod: { type: String },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<PaymentDocument>('Payment', paymentSchema);