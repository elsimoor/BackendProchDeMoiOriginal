"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientResolvers = void 0;
// import { AuthenticationError } from 'apollo-server-express';
const ClientModel_1 = __importDefault(require("../../models/ClientModel"));
exports.clientResolvers = {
    Query: {
        clients: async () => {
            // Return all active clients sorted by most recent
            return ClientModel_1.default.find({ isActive: true }).sort({ createdAt: -1 });
        },
        client: async (_parent, { id }) => {
            return ClientModel_1.default.findById(id);
        },
    },
    Mutation: {
        // The createClient mutation does not require context; remove the unused
        // context parameter to satisfy the TypeScript compiler.
        createClient: async (_parent, { input }) => {
            // Potential place to perform role/permission checks
            // e.g. if (!context.user || context.user.role !== 'admin') {
            //   throw new AuthenticationError('Not authorised to create a client');
            // }
            const client = new ClientModel_1.default(input);
            await client.save();
            return client;
        },
        // The updateClient mutation does not require context; remove the unused
        // context parameter to satisfy the TypeScript compiler.
        updateClient: async (_parent, { id, input }) => {
            // Optional role check as above
            return ClientModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        // The deleteClient mutation does not require context; remove the unused
        // context parameter to satisfy the TypeScript compiler.
        deleteClient: async (_parent, { id }) => {
            // Soft delete: mark the client as inactive
            const existing = await ClientModel_1.default.findById(id);
            if (!existing)
                return false;
            existing.isActive = false;
            await existing.save();
            return true;
        },
    },
};
//# sourceMappingURL=resolvers.js.map