import mongoose, { Document, Schema } from 'mongoose';

interface IPosition {
  x: number;
  y: number;
}

interface ITable extends Document {
  restaurantId: mongoose.Types.ObjectId;
  number: number;
  capacity: number;
  location: 'Main Dining' | 'Patio' | 'Bar Area' | 'Private Room';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  features: string[];
  position: IPosition;
  images: string[];
  isActive: boolean;
}

const tableSchema = new Schema<ITable>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    // enum: ['Main Dining', 'Patio', 'Bar Area', 'Private Room'],
    default: 'Main Dining'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  features: [String],
  position: {
    x: Number,
    y: Number
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for restaurant and table number uniqueness
tableSchema.index({ restaurantId: 1, number: 1 }, { unique: true });

export default mongoose.model<ITable>('Table', tableSchema);