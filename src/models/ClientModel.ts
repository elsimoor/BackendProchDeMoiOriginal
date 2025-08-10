import mongoose, { Document, Schema } from 'mongoose';

/**
 * Client (or Business) model
 *
 * This schema represents a single customer of the reservation system. A client
 * can enable one or more reservation modules (rooms, services, restaurant)
 * according to the contract defined in the "cahier de charge".  The client
 * also holds basic identification details (name, contact info, SIRET number)
 * and optionally a visual theme used by the front‑office.  All clients are
 * independent from one another; data for each client is isolated via the
 * `clientId` references used by other models (reservations, services, rooms, etc.).
 */

export interface Modules {
  /** Whether the client has activated the room/chambre module */
  rooms: boolean;
  /** Whether the client has activated the service/spa module */
  services: boolean;
  /** Whether the client has activated the restaurant module */
  restaurant: boolean;
}

export interface Theme {
  /** Public URL pointing at the client logo (stored in a CDN or S3) */
  logoUrl?: string;
  /** Primary colour used by the client’s branding */
  primaryColor?: string;
  /** Secondary colour used by the client’s branding */
  secondaryColor?: string;
  /** Typography identifier (e.g. a CSS font‑family) */
  typography?: string;
}

export interface ClientDocument extends Document {
  /** Display name of the organisation or company */
  name: string;
  /** Optional French SIRET number identifying the business */
  siret?: string;
  /** Nested address information */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  /** Nested contact information */
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  /** Enabled reservation modules for this client */
  modules: Modules;
  /** Optional visual theme overriding colours, logo and typography */
  theme?: Theme;
  /** Flag toggling soft deletion of a client */
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const clientSchema = new Schema<ClientDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  siret: {
    type: String,
    default: undefined,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  contact: {
    phone: String,
    email: String,
    website: String,
  },
  modules: {
    rooms: { type: Boolean, default: false },
    services: { type: Boolean, default: false },
    restaurant: { type: Boolean, default: false },
  },
  theme: {
    logoUrl: String,
    primaryColor: String,
    secondaryColor: String,
    typography: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ClientDocument>('Client', clientSchema);