"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuestModel = void 0;
// guest.model.ts
const mongoose_1 = require("mongoose");
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
/* ---------- schema ---------- */
const guestSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        // Always reference the owning Client rather than a specific business
        ref: 'Client',
    },
    businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'salon'],
        required: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    /* Loyalty program */
    membershipLevel: {
        type: String,
        enum: ['Regular', 'Silver', 'Gold', 'Platinum', 'VIP'],
        default: 'Regular'
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    },
    /* Statistics */
    totalVisits: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastVisit: Date,
    /* Preferences */
    preferences: {
        roomType: String,
        bedType: String,
        floor: String,
        seatingPreference: String,
        cuisinePreferences: [String],
        dietaryRestrictions: [String],
        preferredStylist: String,
        favoriteServices: [String],
        allergies: [String]
    },
    notes: String,
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    },
    /* Communication preferences */
    communicationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        phone: { type: Boolean, default: true }
    }
}, { timestamps: true });
// Enable pagination on the Guest model via the mongoose-paginate-v2 plugin.
// This plugin adds a `paginate` method to the model which can be used
// to retrieve paginated guest documents along with relevant metadata.
// @ts-ignore
guestSchema.plugin(mongoose_paginate_v2_1.default);
/* ---------- model ---------- */
exports.GuestModel = (0, mongoose_1.model)('Guest', guestSchema);
exports.default = exports.GuestModel;
//# sourceMappingURL=GuestModel.js.map