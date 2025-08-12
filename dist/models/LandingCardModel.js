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
const landingCardSchema = new mongoose_1.Schema({
    businessId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true
    },
    businessType: {
        type: String,
        enum: ['hotel', 'restaurant', 'salon'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    image: String,
    price: Number,
    rating: Number,
    location: String,
    tags: [String],
    amenities: [String],
    specialOffer: {
        type: Boolean,
        default: false
    },
    /**
     * Whether this card is the featured card for its associated business.
     * Only one landing card per business should have this flag set to true.
     * When a card is marked as featured it will be displayed on the public
     * landing page for the business.  All other cards for that business
     * should have this flag unset.
     */
    isFeatured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('LandingCard', landingCardSchema);
//# sourceMappingURL=LandingCardModel.js.map