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

  /**
   * A list of additional services managed by the user.  Each entry
   * associates the user with a business identifier and its type.  This
   * allows a single account to manage multiple business entities
   * (e.g. a hotel and a restaurant) without overriding the primary
   * businessId/businessType fields.  The `isActive` flag on each
   * service is not stored here; instead the business’s own `isActive`
   * field should be queried to determine whether the dashboard
   * should be accessible.  When adding a service via the
   * `appendUserService` mutation the new entry will be pushed onto
   * this array.
   */
  services?: {
    businessType: 'hotel' | 'restaurant' | 'salon';
    businessId: mongoose.Types.ObjectId;
  }[];
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
    /**
     * Require a business type only for roles that manage a specific
     * business (manager or staff).  Administrators and customers do
     * not need an associated business type.  Using a function as
     * `required` allows us to access `this.role` at runtime.
     */
    required: function(this: any) {
      const role = this.role;
      return role === 'manager' || role === 'staff';
    },
  },
  businessId: {
    type: Schema.Types.ObjectId,
    refPath: 'businessType'
  },
  avatar: String,
  phone: String,
  // Indicates whether the user can access protected dashboards.  New
  // accounts start inactive so that an administrator must approve the
  // associated business before the user can log in.  When the admin
  // approves the business the resolver will flip this flag to true.
  isActive: {
    type: Boolean,
    default: false
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
  },
  // Additional services managed by the user.  Each object stores
  // the type of business and its ObjectId.  We do not enforce
  // uniqueness at the schema level because the appendUserService
  // resolver checks for duplicates before pushing.
  services: [
    {
      businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'salon'],
      },
      businessId: {
        type: Schema.Types.ObjectId,
        refPath: 'services.businessType',
      },
    },
  ]
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