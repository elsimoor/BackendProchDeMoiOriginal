import mongoose, { Document, Schema } from 'mongoose';

/**
 * LandingCard model
 *
 * This schema stores promotional cards that appear on the public landing
 * page.  Each card is associated with a particular business (hotel,
 * restaurant or salon) and contains custom information such as a
 * title, description, image, pricing and rating.  Business owners
 * manage these cards via their dashboard.  By storing the cards in
 * the database we can fetch and display them dynamically instead of
 * hard‑coding fake data on the frontend.
 */
export interface LandingCardDocument extends Document {
  businessId: mongoose.Types.ObjectId;
  businessType: 'hotel' | 'restaurant' | 'salon';
  title: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  location?: string;
  tags?: string[];
  amenities?: string[];
  specialOffer?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const landingCardSchema = new Schema<LandingCardDocument>({
  businessId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  businessType: {
    type: String,
    enum: ['hotel', 'restaurant', 'salon'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  image: String,
  price: Number,
  rating: Number,
  location: String,
  tags: [String],
  amenities: [String],
  specialOffer: {
    type: Boolean,
    default: false
  }
  ,
  /**
   * Whether this card is the featured card for its associated business.
   * Only one landing card per business should have this flag set to true.
   * When a card is marked as featured it will be displayed on the public
   * landing page for the business.  All other cards for that business
   * should have this flag unset.
   */
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<LandingCardDocument>('LandingCard', landingCardSchema);