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
    // Room category.  This was previously restricted to a fixed set of
    // values, but has been relaxed to allow hotels to define their
    // own categories via the RoomType entity.  Any non-empty string
    // is accepted.
    type: {
        type: String,
        required: true,
        trim: true,
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
    // Array of monthly pricing ranges.  Each object defines the first
    // and last month (1‑based) of the range and the nightly rate to
    // charge during that period.  When provided this overrides the
    // base price for the specified months.  Ranges may overlap and
    // will be applied in the order defined.  This field is optional
    // and defaults to an empty array.  See the RoomDocument
    // interface for a usage example.
    monthlyPrices: {
        type: [
            {
                startMonth: { type: Number, required: true },
                endMonth: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        default: [],
    },
    // Array of special date range pricing sessions.  Each object
    // defines the starting and ending month/day (1-based) and the
    // nightly rate to charge during that period.  When provided these
    // override the base price (and monthlyPrices) for the specified
    // ranges.  Defaults to an empty array.
    specialPrices: {
        type: [
            {
                startMonth: { type: Number, required: true },
                startDay: { type: Number, required: true },
                endMonth: { type: Number, required: true },
                endDay: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        default: [],
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
    // Array of paid options available for this room.  Each entry stores
    // the option's name, optional description and category, and price.
    // This allows rooms to offer tailored add-ons derived from the
    // hotel's roomPaidOptions.  Defaults to an empty array when no
    // options are selected.
    paidOptions: [
        {
            name: { type: String, required: true },
            description: { type: String },
            category: { type: String },
            price: { type: Number, required: true },
        },
    ],
    // Array of view options available for this room.  Each option
    // includes a name and optional description, category and price.  When
    // no view options are assigned to the room this array is empty.
    viewOptions: [
        {
            name: { type: String, required: true },
            description: { type: String },
            category: { type: String },
            price: { type: Number, required: false },
        },
    ],
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