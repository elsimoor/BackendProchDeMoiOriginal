"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftResolvers = void 0;
const mongoose_1 = require("mongoose");
const ShiftModel_1 = __importDefault(require("../../models/ShiftModel"));
const StaffModel_1 = __importDefault(require("../../models/StaffModel"));
/**
 * Resolvers for the Shift type.  Queries allow fetching all shifts for
 * a given business, optionally filtered by staff or date range.  Single
 * shift retrieval is also supported.  Mutations enable creation,
 * updating and deletion of shift records.  When updating or deleting a
 * shift, the ID is validated before attempting any database
 * operation.  Errors are silently ignored by returning null or
 * false where appropriate; more sophisticated error handling can be
 * added as needed.
 */
exports.shiftResolvers = {
    Query: {
        shifts: async (_, args) => {
            const { businessId, businessType, staffId, startDate, endDate } = args;
            const filter = { businessId, businessType };
            if (staffId) {
                filter.staffId = staffId;
            }
            if (startDate || endDate) {
                filter.date = {};
                if (startDate) {
                    filter.date.$gte = startDate;
                }
                if (endDate) {
                    filter.date.$lte = endDate;
                }
            }
            return ShiftModel_1.default.find(filter).sort({ date: 1, startTime: 1 }).exec();
        },
        shift: async (_, { id }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            return ShiftModel_1.default.findById(id).exec();
        },
    },
    Mutation: {
        createShift: async (_, { input }) => {
            const shift = new ShiftModel_1.default(input);
            await shift.save();
            return shift;
        },
        updateShift: async (_, { id, input }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            return ShiftModel_1.default.findByIdAndUpdate(id, input, { new: true }).exec();
        },
        deleteShift: async (_, { id }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return false;
            }
            await ShiftModel_1.default.findByIdAndDelete(id).exec();
            return true;
        },
    },
    // Resolve nested fields for Shift.  The staffId field refers to a
    // Staff document; by returning the full Staff, we enable GraphQL
    // clients to request nested staff data on shifts.
    Shift: {
        staffId: async (shift) => {
            if (!shift.staffId)
                return null;
            return StaffModel_1.default.findById(shift.staffId).exec();
        },
    },
};
//# sourceMappingURL=resolvers.js.map