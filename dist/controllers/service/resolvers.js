"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceResolvers = void 0;
// AuthenticationError import removed; authentication checks are omitted
// from service mutations for simplicity.
const ServiceModel_1 = __importDefault(require("../../models/ServiceModel"));
exports.serviceResolvers = {
    Query: {
        services: async (_parent, { businessId, businessType, category }) => {
            const filter = { businessId, businessType, isActive: true };
            if (category)
                filter.category = category;
            return ServiceModel_1.default.find(filter).sort({ name: 1 });
        },
        service: async (_parent, { id }) => {
            return ServiceModel_1.default.findById(id);
        }
    },
    Mutation: {
        createService: async (_parent, { input }, _ctx) => {
            const service = new ServiceModel_1.default(input);
            await service.save();
            return service;
        },
        updateService: async (_parent, { id, input }, _ctx) => {
            return ServiceModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteService: async (_parent, { id }, _ctx) => {
            await ServiceModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        }
    }
};
//# sourceMappingURL=resolvers.js.map