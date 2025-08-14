import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends Document {
  lastName: string;
  firstName: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'staff' | 'customer';
  businessType?: 'hotel' | 'restaurant' | 'salon';
  businessId?: mongoose.Types.ObjectId;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    language: string;
    timezone: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  lastName: {
    type: String,
    trim: true
  },
   firstName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'customer'],
    default: 'customer'
  },
  businessType: {
    type: String,
    enum: ['hotel', 'restaurant', 'salon'],
    required: function() {
      return this.role !== 'customer';
    }
  },
  businessId: {
    type: Schema.Types.ObjectId,
    refPath: 'businessType'
  },
  avatar: String,
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);