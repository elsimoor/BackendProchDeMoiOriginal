"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.landingCardResolvers = void 0;
const LandingCardModel_1 = __importDefault(require("../../models/LandingCardModel"));
exports.landingCardResolvers = {
    Query: {
        landingCards: async (_parent, { businessType, businessId, isFeatured }) => {
            const filter = {};
            if (businessType)
                filter.businessType = businessType;
            if (businessId)
                filter.businessId = businessId;
            // If the client requests only featured cards, filter accordingly.
            if (typeof isFeatured === 'boolean') {
                filter.isFeatured = isFeatured;
            }
            return LandingCardModel_1.default.find(filter);
        },
        /**
         * Return the single featured landing card for a business.  This resolver
         * finds the card with isFeatured = true matching the provided
         * businessType and businessId.  Returns null if no such card
         * exists.
         */
        featuredLandingCard: async (_parent, { businessType, businessId }) => {
            return LandingCardModel_1.default.findOne({ businessType, businessId, isFeatured: true });
        }
    },
    Mutation: {
        createLandingCard: async (_parent, { input }) => {
            const card = new LandingCardModel_1.default(input);
            await card.save();
            return card;
        },
        updateLandingCard: async (_parent, { id, input }) => {
            const card = await LandingCardModel_1.default.findByIdAndUpdate(id, input, { new: true });
            return card;
        },
        deleteLandingCard: async (_parent, { id }) => {
            await LandingCardModel_1.default.findByIdAndDelete(id);
            return true;
        },
        /**
         * Set the featured landing card for a business.  This mutation first
         * unsets the isFeatured flag on all other landing cards belonging to
         * the specified business.  Then it sets isFeatured on the selected
         * card and returns the updated card.  If the provided card does not
         * belong to the specified business an error will be thrown.
         */
        setFeaturedLandingCard: async (_parent, { id, businessId, businessType }) => {
            // Unset any currently featured cards for this business
            await LandingCardModel_1.default.updateMany({ businessId, businessType }, { isFeatured: false });
            // Set the selected card as featured
            const card = await LandingCardModel_1.default.findByIdAndUpdate(id, { isFeatured: true }, { new: true });
            return card;
        }
    }
};
//# sourceMappingURL=resolvers.js.map