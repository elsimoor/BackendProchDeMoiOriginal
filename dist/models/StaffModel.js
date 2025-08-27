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
const staffSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        // Associate a staff member with a client.  Previously this pointed
        // at Hotel/Restaurant/Salon documents.  Now it references the Client
        // entity for multi‑tenant support.
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
    role: {
        type: String,
        required: true
    },
    email: String,
    phone: String,
    hireDate: Date,
    schedule: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract'],
        default: 'Full-time'
    },
    hourlyRate: Number,
    status: {
        type: String,
        enum: ['active', 'on-leave', 'inactive'],
        default: 'active'
    },
    specialties: [String],
    availability: [{
            day: String,
            startTime: String,
            endTime: String,
            available: { type: Boolean, default: true }
        }],
    avatar: String,
    notes: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Staff', staffSchema);
//# sourceMappingURL=StaffModel.js.map