import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Invoice model
 *
 * Represents a billing record for a reservation.  Each invoice is
 * associated with a reservation and the owning business (client).  It
 * stores an array of line items, a total amount and a creation date.
 */
interface InvoiceItem {
  description: string;
  price: number;
  quantity: number;
  total: number;
}

export interface InvoiceDocument extends Document {
  /**
   * Reference to the associated reservation.  An invoice is always
   * generated for a reservation so we keep the relationship explicit.
   */
  reservationId: mongoose.Types.ObjectId;
  /**
   * The business (client) to which this invoice belongs.  Stored
   * separately to simplify queries when filtering by client.
   */
  businessId: mongoose.Types.ObjectId;
  /**
   * Timestamp when the invoice was created.  Defaults to now.
   */
  date: Date;
  /**
   * Array of invoice line items.
   */
  items: InvoiceItem[];
  /**
   * Total amount for the invoice.  Stored redundantly to avoid
   * recomputing on every read.
   */
  total: number;
}

const invoiceItemSchema = new Schema<InvoiceItem>(
  {
    description: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    reservationId: { type: Schema.Types.ObjectId, ref: 'Reservation', required: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    date: { type: Date, default: Date.now },
    items: { type: [invoiceItemSchema], default: [] },
    total: { type: Number, required: true },
  },
  { timestamps: true }
);

// Enable pagination on the Invoice model.  The mongoose-paginate-v2 plugin
// adds a paginate() method to the model which returns paginated
// results and associated metadata.
// @ts-ignore
invoiceSchema.plugin(mongoosePaginate);

// Cast to any to satisfy TypeScript when using the paginate method.
export default mongoose.model<InvoiceDocument>('Invoice', invoiceSchema) as any;