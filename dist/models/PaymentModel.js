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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const mongoose_paginate_v2_1 = __importDefault(require("mongoose-paginate-v2"));
const paymentSchema = new mongoose_1.Schema({
    reservationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Reservation' },
    invoiceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Invoice' },
    businessId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Client', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    // Include 'refunded' as a valid status so that completed payments
    // which have been refunded can be distinguished from those that remain
    // paid.  The default remains 'pending' until the Stripe checkout
    // webhook confirms payment.  When a refund occurs we update the
    // status to 'refunded' accordingly.
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    paymentMethod: { type: String },
    receiptUrl: { type: String },
}, { timestamps: true });
// Enable pagination on the Payment model via mongoose-paginate-v2.  This adds
// a paginate() method for retrieving paginated payment records with
// metadata.
// @ts-ignore
paymentSchema.plugin(mongoose_paginate_v2_1.default);
// Cast to any to allow TypeScript to accept the paginate method.
exports.default = mongoose_1.default.model('Payment', paymentSchema);
//# sourceMappingURL=PaymentModel.js.map