import mongoose, { Schema, Document } from 'mongoose';

interface MenuItemDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  available: boolean;
  popular: boolean;
  allergens: string[];
  dietaryInfo: string[];
  spiceLevel: 'mild' | 'medium' | 'hot' | 'very-hot';
  ingredients: string[];
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  images: string[];
  isActive: boolean;
}

const menuItemSchema = new Schema<MenuItemDocument>({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  prepTime: Number,
  available: {
    type: Boolean,
    default: true
  },
  popular: {
    type: Boolean,
    default: false
  },
  allergens: [String],
  dietaryInfo: [String],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'very-hot'],
    default: 'mild'
  },
  ingredients: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fat: Number,
    carbs: Number
  },
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model<MenuItemDocument>('MenuItem', menuItemSchema);