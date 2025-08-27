"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const hotelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    contact: {
        phone: String,
        email: String,
        website: String
    },
    settings: {
        checkInTime: { type: String, default: '15:00' },
        checkOutTime: { type: String, default: '11:00' },
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' },
        taxRate: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 0 }
    },
    amenities: [{
            name: String,
            description: String,
            included: { type: Boolean, default: true },
            category: String,
            price: { type: Number, default: 0 }
        }],
    services: [{
            name: String,
            description: String,
            price: Number,
            category: String,
            available: { type: Boolean, default: true }
        }],
    policies: [{
            title: String,
            description: String,
            category: String
        }],
    images: [String],
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    // Hotels are created inactive by default.  An administrator must
    // approve a hotel before it can appear in listings or be accessed
    // by its manager.  Once approved the isActive flag is set to true.
    isActive: {
        type: Boolean,
        default: false
    },
    // Array of opening periods for the hotel.  Each period defines a
    // continuous range of dates during which the hotel is open for
    // reservations.  Optional and defaults to empty array.
    openingPeriods: [
        {
            startDate: Date,
            endDate: Date
        }
    ],
    // Array of paid room options.  Each entry has a name, optional
    // description and category, and a price.  This allows hotel
    // managers to offer purchasable extras such as petals or boxes
    // when guests book a room.
    roomPaidOptions: [{
            name: String,
            description: String,
            category: String,
            price: Number
        }],
    // Array of view options that can be selected when booking a room.
    // Each option includes a name, optional description and optional
    // price.  This allows hotels to offer different views (e.g.
    // "City View", "Garden View") that guests can select when
    // completing a booking.  If a view has no additional cost the
    // price should be set to 0 or omitted.
    roomViewOptions: [{
            name: String,
            description: String,
            price: Number
        }]
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Hotel', hotelSchema);
//# sourceMappingURL=HotelModel.js.map