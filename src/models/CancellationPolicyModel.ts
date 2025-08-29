import mongoose, { Schema, Document } from 'mongoose';

/**
 * CancellationPolicyModel defines refund rules for hotel reservations.  A
 * cancellation policy belongs to a specific business (client/tenant) and
 * specifies how far in advance a guest must cancel to receive a refund.
 * The `daysBefore` field indicates the minimum number of days before
 * check‑in and `refundPercentage` indicates the percentage of the total
 * amount to refund when the condition matches.  Policies are evaluated
 * from highest to lowest `daysBefore`; the first matching rule applies.
 */
export interface CancellationPolicyDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  daysBefore: number;
  refundPercentage: number;
}

const cancellationPolicySchema = new Schema<CancellationPolicyDocument>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    daysBefore: { type: Number, required: true },
    refundPercentage: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<CancellationPolicyDocument>('CancellationPolicy', cancellationPolicySchema);