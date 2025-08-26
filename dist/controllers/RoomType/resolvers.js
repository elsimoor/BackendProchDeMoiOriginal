"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomTypeResolvers = void 0;
const mongoose_1 = require("mongoose");
const RoomTypeModel_1 = __importDefault(require("../../models/RoomTypeModel"));
/**
 * Resolver functions for the RoomType entity.  These resolvers
 * implement basic CRUD operations for room types.  Authentication is
 * intentionally omitted to simplify the example; consumers should
 * integrate appropriate authorization in a real application.
 */
exports.roomTypeResolvers = {
    Query: {
        /**
         * Return all active room types for a given hotel.  Results are
         * sorted alphabetically by name.  Deleted types (isActive = false)
         * are excluded.
         */
        roomTypes: async (_, { hotelId }) => {
            return RoomTypeModel_1.default.find({ hotelId, isActive: true }).sort({ name: 1 }).exec();
        },
        /**
         * Look up a single room type by its identifier.  Returns null
         * when the id is invalid or not found.
         */
        roomType: async (_, { id }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            return RoomTypeModel_1.default.findById(id).exec();
        },
    },
    Mutation: {
        /**
         * Create a new room type.  Requires a hotelId and name.  Throws
         * if a type with the same name already exists for the hotel.
         */
        createRoomType: async (_, { input }) => {
            const roomType = new RoomTypeModel_1.default(input);
            await roomType.save();
            return roomType;
        },
        /**
         * Update the name of an existing room type.  The hotelId cannot
         * be changed.  Returns null if the id is invalid.  If the name
         * would collide with an existing type an error is thrown.
         */
        updateRoomType: async (_, { id, input }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return null;
            }
            // only update the name; ignore hotelId changes
            const update = {};
            if (input.name)
                update.name = input.name;
            return RoomTypeModel_1.default.findByIdAndUpdate(id, update, { new: true }).exec();
        },
        /**
         * Soft delete a room type by marking it inactive.  Returns true
         * if the operation succeeded and false otherwise.
         */
        deleteRoomType: async (_, { id }) => {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                return false;
            }
            const doc = await RoomTypeModel_1.default.findByIdAndUpdate(id, { isActive: false }).exec();
            return !!doc;
        },
    },
};
//# sourceMappingURL=resolvers.js.map