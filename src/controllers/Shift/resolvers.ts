import { Types } from 'mongoose';
import ShiftModel from '../../models/ShiftModel';
import StaffModel from '../../models/StaffModel';

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
export const shiftResolvers = {
  Query: {
    shifts: async (_: any, args: { businessId: string; businessType: string; staffId?: string; startDate?: Date; endDate?: Date; }) => {
      const { businessId, businessType, staffId, startDate, endDate } = args;
      const filter: any = { businessId, businessType };
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
      return ShiftModel.find(filter).sort({ date: 1, startTime: 1 }).exec();
    },
    shift: async (_: any, { id }: { id: string }) => {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      return ShiftModel.findById(id).exec();
    },
  },
  Mutation: {
    createShift: async (_: any, { input }: any) => {
      const shift = new ShiftModel(input);
      await shift.save();
      return shift;
    },
    updateShift: async (_: any, { id, input }: { id: string; input: any }) => {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      return ShiftModel.findByIdAndUpdate(id, input, { new: true }).exec();
    },
    deleteShift: async (_: any, { id }: { id: string }) => {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
      await ShiftModel.findByIdAndDelete(id).exec();
      return true;
    },
  },
  // Resolve nested fields for Shift.  The staffId field refers to a
  // Staff document; by returning the full Staff, we enable GraphQL
  // clients to request nested staff data on shifts.
  Shift: {
    staffId: async (shift: any) => {
      if (!shift.staffId) return null;
      return StaffModel.findById(shift.staffId).exec();
    },
  },
};