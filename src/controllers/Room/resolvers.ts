// room.resolvers.ts
import { IResolvers } from 'apollo-server-express';
import RoomModel from '../../models/RoomModel';
import ReservationModel from '../../models/ReservationModel';

interface Context {
  user?: { id: string };
}

interface RoomsArgs {
  hotelId: string;
  status?: string;
}

interface IdArg {
  id: string;
}

type CreateRoomInput = any;    // replace with your actual input shape
type UpdateRoomInput = any;

interface MutationCreateArgs {
  input: CreateRoomInput;
}

interface MutationUpdateArgs {
  id: string;
  input: UpdateRoomInput;
}

export const roomResolvers: IResolvers<unknown, Context> = {
  Query: {
    rooms: async (
      _parent,
      { hotelId, status }: RoomsArgs
    ) => {
      const filter: Record<string, any> = { hotelId, isActive: true };
      if (status) filter.status = status;
      return await RoomModel.find(filter).sort({ number: 1 });
    },

    room: async (
      _parent,
      { id }: IdArg
    ) => {
      return await RoomModel.findById(id).populate('hotelId');
    }
    ,
    /**
     * List rooms available for the specified hotel and date range.  A
     * room is returned only if it is active, currently marked as
     * available and there are no overlapping reservations for that
     * room within the provided interval.
     */
    availableRooms: async (
      _parent,
      { hotelId, checkIn, checkOut, adults, children }: { hotelId: string; checkIn: string; checkOut: string; adults: number; children: number }
    ) => {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const totalGuests = adults + children;
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return [];
      }
      const rooms = await RoomModel.find({ hotelId, isActive: true, status: 'available', capacity: { $gte: totalGuests } });

      console.log("rooms:", rooms);
      if (!rooms || rooms.length === 0) return [];
      const reservations = await ReservationModel.find({
        businessId: hotelId,
        status: { $in: ['pending', 'confirmed'] },
        businessType: 'hotel'
      });
      return rooms.filter((room: any) => {
        const conflict = reservations.some((res: any) => {
          if (!res.roomId) return false;
          if (String(res.roomId) !== String(room._id)) return false;
          const resStart = res.checkIn ? new Date(res.checkIn) : res.date ? new Date(res.date) : null;
          const resEnd = res.checkOut ? new Date(res.checkOut) : resStart;
          if (!resStart || !resEnd) return false;
          return start < resEnd && end > resStart;
        });
        return !conflict;
      });
    },
    availableRoomsCount: async (
      _parent,
      { hotelId, checkIn, checkOut, adults, children }: { hotelId: string; checkIn: string; checkOut: string; adults: number; children: number }
    ) => {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const totalGuests = adults + children;
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return 0;
      }

      console.log(`Checking available rooms for hotel ${hotelId} from ${checkIn} to ${checkOut} for ${totalGuests} guests`);
      const rooms = await RoomModel.find({ hotelId, isActive: true, status: 'available', capacity: { $gte: totalGuests } });
      if (!rooms || rooms.length === 0) return 0;
      const reservations = await ReservationModel.find({
        businessId: hotelId,
        businessType: 'hotel',
        status: { $in: ['pending', 'confirmed'] }
      });
      const availableRooms = rooms.filter((room: any) => {
        const conflict = reservations.some((res: any) => {
          if (!res.roomId) return false;
          if (String(res.roomId) !== String(room._id)) return false;
          const resStart = res.checkIn ? new Date(res.checkIn) : res.date ? new Date(res.date) : null;
          const resEnd = res.checkOut ? new Date(res.checkOut) : resStart;
          if (!resStart || !resEnd) return false;
          return start < resEnd && end > resStart;
        });
        return !conflict;
      });
      return availableRooms.length;
    }
  },

  Mutation: {
    createRoom: async (
      _parent,
      { input }: MutationCreateArgs,
    ) => {

      const room = new RoomModel(input);
      await room.save();
      return room;
    },

    updateRoom: async (
      _parent,
      { id, input }: MutationUpdateArgs,
    ) => {

      return await RoomModel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteRoom: async (
      _parent,
      { id }: IdArg,
    ): Promise<boolean> => {

      await RoomModel.findByIdAndUpdate(id, { isActive: false });
      return true;
    }
  }
};
