import { Types } from 'mongoose';
import RoomTypeModel from '../../models/RoomTypeModel';

/**
 * Resolver functions for the RoomType entity.  These resolvers
 * implement basic CRUD operations for room types.  Authentication is
 * intentionally omitted to simplify the example; consumers should
 * integrate appropriate authorization in a real application.
 */
export const roomTypeResolvers = {
  Query: {
    /**
     * Return all active room types for a given hotel.  Results are
     * sorted alphabetically by name.  Deleted types (isActive = false)
     * are excluded.
     */
    roomTypes: async (_: any, { hotelId }: { hotelId: string }) => {
      return RoomTypeModel.find({ hotelId, isActive: true }).sort({ name: 1 }).exec();
    },
    /**
     * Look up a single room type by its identifier.  Returns null
     * when the id is invalid or not found.
     */
    roomType: async (_: any, { id }: { id: string }) => {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      return RoomTypeModel.findById(id).exec();
    },
  },
  Mutation: {
    /**
     * Create a new room type.  Requires a hotelId and name.  Throws
     * if a type with the same name already exists for the hotel.
     */
    createRoomType: async (_: any, { input }: { input: { hotelId: string; name: string } }) => {
      const roomType = new RoomTypeModel(input);
      await roomType.save();
      return roomType;
    },
    /**
     * Update the name of an existing room type.  The hotelId cannot
     * be changed.  Returns null if the id is invalid.  If the name
     * would collide with an existing type an error is thrown.
     */
    updateRoomType: async (
      _: any,
      { id, input }: { id: string; input: { hotelId: string; name: string } },
    ) => {
      if (!Types.ObjectId.isValid(id)) {
        return null;
      }
      // only update the name; ignore hotelId changes
      const update: any = {};
      if (input.name) update.name = input.name;
      return RoomTypeModel.findByIdAndUpdate(id, update, { new: true }).exec();
    },
    /**
     * Soft delete a room type by marking it inactive.  Returns true
     * if the operation succeeded and false otherwise.
     */
    deleteRoomType: async (_: any, { id }: { id: string }) => {
      if (!Types.ObjectId.isValid(id)) {
        return false;
      }
      const doc = await RoomTypeModel.findByIdAndUpdate(id, { isActive: false }).exec();
      return !!doc;
    },
  },
};