"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomResolvers = void 0;
const RoomModel_1 = __importDefault(require("../../models/RoomModel"));
const ReservationModel_1 = __importDefault(require("../../models/ReservationModel"));
exports.roomResolvers = {
    Query: {
        rooms: async (_parent, { hotelId, status }) => {
            const filter = { hotelId, isActive: true };
            if (status)
                filter.status = status;
            return await RoomModel_1.default.find(filter).sort({ number: 1 });
        },
        room: async (_parent, { id }) => {
            return await RoomModel_1.default.findById(id).populate('hotelId');
        },
        /**
         * List rooms available for the specified hotel and date range.  A
         * room is returned only if it is active, currently marked as
         * available and there are no overlapping reservations for that
         * room within the provided interval.
         */
        availableRooms: async (_parent, { hotelId, checkIn, checkOut, adults, children }) => {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const totalGuests = adults + children;
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
                return [];
            }
            const rooms = await RoomModel_1.default.find({ hotelId, isActive: true, status: 'available', capacity: { $gte: totalGuests } });
            if (!rooms || rooms.length === 0)
                return [];
            const reservations = await ReservationModel_1.default.find({ businessId: hotelId, businessType: 'hotel' });
            return rooms.filter((room) => {
                const conflict = reservations.some((res) => {
                    if (!res.roomId)
                        return false;
                    if (String(res.roomId) !== String(room._id))
                        return false;
                    const resStart = res.checkIn ? new Date(res.checkIn) : res.date ? new Date(res.date) : null;
                    const resEnd = res.checkOut ? new Date(res.checkOut) : resStart;
                    if (!resStart || !resEnd)
                        return false;
                    return start < resEnd && end > resStart;
                });
                return !conflict;
            });
        },
        availableRoomsCount: async (_parent, { hotelId, checkIn, checkOut, adults, children }) => {
            const start = new Date(checkIn);
            const end = new Date(checkOut);
            const totalGuests = adults + children;
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
                return 0;
            }
            console.log(`Checking available rooms for hotel ${hotelId} from ${checkIn} to ${checkOut} for ${totalGuests} guests`);
            const rooms = await RoomModel_1.default.find({ hotelId, isActive: true, status: 'available', capacity: { $gte: totalGuests } });
            if (!rooms || rooms.length === 0)
                return 0;
            const reservations = await ReservationModel_1.default.find({
                businessId: hotelId,
                businessType: 'hotel',
                status: { $in: ['pending', 'confirmed'] }
            });
            const availableRooms = rooms.filter((room) => {
                const conflict = reservations.some((res) => {
                    if (!res.roomId)
                        return false;
                    if (String(res.roomId) !== String(room._id))
                        return false;
                    const resStart = res.checkIn ? new Date(res.checkIn) : res.date ? new Date(res.date) : null;
                    const resEnd = res.checkOut ? new Date(res.checkOut) : resStart;
                    if (!resStart || !resEnd)
                        return false;
                    return start < resEnd && end > resStart;
                });
                return !conflict;
            });
            return availableRooms.length;
        }
    },
    Mutation: {
        createRoom: async (_parent, { input }) => {
            const room = new RoomModel_1.default(input);
            await room.save();
            return room;
        },
        updateRoom: async (_parent, { id, input }) => {
            return await RoomModel_1.default.findByIdAndUpdate(id, input, { new: true });
        },
        deleteRoom: async (_parent, { id }) => {
            await RoomModel_1.default.findByIdAndUpdate(id, { isActive: false });
            return true;
        }
    }
};
//# sourceMappingURL=resolvers.js.map