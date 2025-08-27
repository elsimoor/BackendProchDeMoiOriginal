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
const restaurantSchema = new mongoose_1.Schema({
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Client',
        // required: true,
    },
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
        // Default currency for restaurants set to MAD (Moroccan Dirham).  Using MAD
        // as the default ensures that newly created restaurants in regions like
        // Morocco display prices and totals consistently without having to
        // explicitly set a currency.  Existing restaurants will retain their
        // configured currency.
        currency: { type: String, default: 'MAD' },
        timezone: { type: String, default: 'UTC' },
        taxRate: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 0 },
        maxPartySize: { type: Number, default: 10 },
        reservationWindow: { type: Number, default: 60 },
        cancellationHours: { type: Number, default: 2 },
        horaires: [{
                ouverture: String,
                fermeture: String,
                prix: {
                    type: Number,
                    default: 0,
                }
            }],
        capaciteTotale: { type: Number, default: 0 },
        tables: {
            size2: { type: Number, default: 0 },
            size4: { type: Number, default: 0 },
            size6: { type: Number, default: 0 },
            size8: { type: Number, default: 0 }
        },
        frequenceCreneauxMinutes: { type: Number, default: 30 },
        maxReservationsParCreneau: { type: Number, default: 10 },
        capaciteTheorique: { type: Number, default: 0 },
        // Périodes de fermeture (congés ou fermeture annuelle)
        fermetures: [
            {
                debut: String,
                fin: String
            }
        ],
        // Jours ouverts dans la semaine (ex. ["Monday", "Tuesday"])
        joursOuverts: {
            type: [String],
            default: []
        },
        // Tables personnalisées (ex. taille: 10 personnes, nombre: 2 tables)
        customTables: [
            {
                taille: { type: Number },
                nombre: { type: Number }
            }
        ],
        // Dress code enforced by the restaurant.  Defaults to "smart-casual".
        dressCode: { type: String, default: 'smart-casual' }
    },
    businessHours: [{
            day: {
                type: String,
                enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            },
            isOpen: { type: Boolean, default: true },
            openTime: String,
            closeTime: String
        }],
    cuisine: {
        type: [String],
        default: []
    },
    priceRange: {
        type: String,
        enum: ['$', '$$', '$$$', '$$$$'],
        default: '$$'
    },
    features: [String],
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
    // Restaurants are initially inactive.  After an administrator
    // reviews the registration request they set isActive to true.  Until
    // then the owner cannot access the dashboard and the restaurant
    // remains hidden from listings.
    isActive: {
        type: Boolean,
        default: false
    },
    // Payment methods accepted by the restaurant.  Each entry defines the
    // method name, whether it is enabled, an optional processing fee and
    // an optional ISO date on which the method is specially enabled.  When
    // not provided, paymentMethods defaults to an empty array.
    paymentMethods: [
        {
            name: String,
            enabled: { type: Boolean, default: true },
            processingFee: { type: Number, default: 0 },
            specialDate: String
        }
    ]
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model('Restaurant', restaurantSchema);
//# sourceMappingURL=RestaurantModel.js.map