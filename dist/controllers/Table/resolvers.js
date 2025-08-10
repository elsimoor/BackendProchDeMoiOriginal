"use strict";
// src/graphql/resolvers/tableResolvers.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tableResolvers = void 0;
// Authentication checks are intentionally removed to simplify
// development.  Clients may call these mutations without requiring
// authentication.
const mongoose_1 = require("mongoose");
const TableModel_1 = __importDefault(require("../../models/TableModel"));
exports.tableResolvers = {
    Query: {
        tables: async (_, { restaurantId, status }, _ctx) => {
            const filter = { restaurantId, isActive: true };
            if (status) {
                filter.status = status;
            }
            return TableModel_1.default.find(filter).sort({ number: 1 }).exec();
        },
        table: async (_, { id }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            return TableModel_1.default.findById(id).exec();
        },
    },
    Mutation: {
        createTable: async (_, { input }, _ctx) => {
            const table = new TableModel_1.default(input);
            await table.save();
            return table;
        },
        updateTable: async (_, { id, input }, _ctx) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            return TableModel_1.default.findByIdAndUpdate(id, input, { new: true }).exec();
        },
        deleteTable: async (_, { id }, _ctx) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return false;
            }
            await TableModel_1.default.findByIdAndUpdate(id, { isActive: false }).exec();
            return true;
        },
    },
};
//# sourceMappingURL=resolvers.js.map