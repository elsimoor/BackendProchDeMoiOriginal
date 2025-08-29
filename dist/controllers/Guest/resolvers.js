"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestResolvers = void 0;
// guestGuestModel.resolvers.ts
// Authentication checks removed to allow guest CRUD operations without
// requiring a logged‑in user.
const GuestModel_1 = __importDefault(require("../../models/GuestModel"));
exports.guestResolvers = {
    Query: {
        guests: async (_parent, { businessId, businessType, status, page, limit }) => {
            const filter = { businessId, businessType };
            if (status)
                filter.status = status;
            const pageNumber = page && page > 0 ? page : 1;
            const limitNumber = limit && limit > 0 ? limit : 10;
            // Use paginate to return a paginated list of guests sorted alphabetically by name.
            return await GuestModel_1.default.paginate(filter, {
                page: pageNumber,
                limit: limitNumber,
                sort: { name: 1 },
            });
        },
        guest: async (_parent, { id }) => {
            return GuestModel_1.default.findById(id);
        }
    },
    Mutation: {
        createGuest: async (_parent, { input }) => {
            const guest = new GuestModel_1.default(input);
            await guest.save();
            return guest;
        },
        updateGuest: async (_parent, { id, input }, _ctx) => {
            return GuestModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteGuest: async (_parent, { id }, _ctx) => {
            await GuestModel_1.default.findByIdAndDelete(id);
            return true;
        }
    }
};
//# sourceMappingURL=resolvers.js.map