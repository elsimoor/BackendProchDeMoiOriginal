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
const serviceSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        // Link to the client that owns this service.  In previous versions
        // this field pointed at Hotel/Restaurant/Salon.  Now it always
        // references a Client document.
        ref: 'Client',
    },
    businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'salon'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    category: String,
    duration: Number,
    price: {
        type: Number,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    popular: {
        type: Boolean,
        default: false
    },
    staffRequired: [String],
    requirements: [String],
    images: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    // Additional salon-specific fields
    defaultEmployee: {
        type: String,
        default: null
    },
    defaultRoom: {
        type: String,
        default: null
    },
    allowClientChoose: {
        type: Boolean,
        default: false
    },
    options: [
        {
            name: String,
            price: Number,
            durationImpact: Number
        }
    ]
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Service', serviceSchema);
//# sourceMappingURL=ServiceModel.js.map