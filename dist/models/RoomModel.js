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
const roomSchema = new mongoose_1.Schema({
    hotelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    number: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Standard', 'Deluxe', 'Suite', 'Executive']
    },
    floor: Number,
    capacity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    size: Number,
    status: {
        type: String,
        enum: ['available', 'occupied', 'maintenance', 'cleaning'],
        default: 'available'
    },
    amenities: [String],
    features: [String],
    condition: {
        type: String,
        enum: ['excellent', 'good', 'needs_repair'],
        default: 'excellent'
    },
    lastCleaned: Date,
    nextMaintenance: Date,
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    // Additional descriptive fields for a room.  These are optional and
    // provide more details about the accommodation.
    bedType: [String],
    numberOfBeds: {
        type: Number,
        required: false
    },
    numberOfBathrooms: {
        type: Number,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    // Legacy fields to support older unique indexes on { hotel, roomNumber }.
    hotel: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: false
    },
    roomNumber: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});
// Ensure that legacy fields hotel and roomNumber are kept in sync with
// hotelId and number. This allows unique indexes on these fields to
// function even though we primarily use hotelId and number in the API.
roomSchema.pre('save', function (next) {
    // @ts-ignore: this refers to the document being saved
    if (this.hotelId) {
        // copy hotelId to the legacy field hotel
        // @ts-ignore
        this.hotel = this.hotelId;
    }
    // copy number to roomNumber
    // @ts-ignore
    if (this.number != null) {
        // @ts-ignore
        this.roomNumber = this.number;
    }
    next();
});
roomSchema.index({ hotelId: 1, number: 1 }, { unique: true });
exports.default = mongoose_1.default.model('Room', roomSchema);
//# sourceMappingURL=RoomModel.js.map