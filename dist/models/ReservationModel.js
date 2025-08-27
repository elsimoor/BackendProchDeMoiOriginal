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
const reservationSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        // Reference the Client model rather than Hotel.  While the original
        // implementation assumed a hotel reservation, the businessId now
        // always points to a Client (tenant) document.  Mongoose population
        // using this ref will therefore load Client records.
        refPath: 'Client',
    },
    businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'salon'],
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerInfo: {
        name: { type: String, },
        email: { type: String, },
        phone: { type: String, }
    },
    roomId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Room'
    },
    checkIn: Date,
    checkOut: Date,
    guests: Number,
    tableId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Table'
    },
    partySize: Number,
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service'
    },
    staffId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    date: { type: Date, },
    time: String,
    duration: Number,
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    totalAmount: Number,
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    notes: String,
    specialRequests: String,
    reminderSent: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['website', 'phone', 'walk-in', 'admin', 'new-ui'],
        default: 'website'
    },
    // URL of an uploaded reservation file (e.g. Word document) with
    // detailed requirements.  This field is optional and remains
    // undefined when no file is attached to the reservation.
    reservationFileUrl: {
        type: String
    },
    // Name of the payment method selected by the client.  This
    // property stores a simple string (e.g. "Credit Card", "Cash")
    // referencing one of the restaurant's paymentMethods.  When no
    // payment method is provided this field remains undefined.
    paymentMethod: {
        type: String
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Reservation', reservationSchema);
//# sourceMappingURL=ReservationModel.js.map