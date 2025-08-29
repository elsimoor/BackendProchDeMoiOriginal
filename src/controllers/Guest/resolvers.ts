// guestGuestModel.resolvers.ts
// Authentication checks removed to allow guest CRUD operations without
// requiring a logged‑in user.
import GuestModel from '../../models/GuestModel';

interface Context {
  user?: { id: string };
}

interface GuestsArgs {
  businessId: string;
  businessType: string;
  status?: string;
  /** Page number for pagination (1-based). */
  page?: number;
  /** Number of guests per page. */
  limit?: number;
}

interface IdArg {
  id: string;
}

type CreateGuestInput = any;   // replace with your actual input type
type UpdateGuestInput = any;

interface MutationCreateArgs {
  input: CreateGuestInput;
}

interface MutationUpdateArgs {
  id: string;
  input: UpdateGuestInput;
}

export const guestResolvers = {
  Query: {
    guests: async (
      _parent,
      { businessId, businessType, status, page, limit }: GuestsArgs
    ): Promise<any> => {
      const filter: Record<string, any> = { businessId, businessType };
      if (status) filter.status = status;
      const pageNumber = page && page > 0 ? page : 1;
      const limitNumber = limit && limit > 0 ? limit : 10;
      // Use paginate to return a paginated list of guests sorted alphabetically by name.
      return await (GuestModel as any).paginate(filter, {
        page: pageNumber,
        limit: limitNumber,
        sort: { name: 1 },
      });
    },

    guest: async (
      _parent,
      { id }: IdArg
    ): Promise<any | null> => {
      return GuestModel.findById(id);
    }
  },

  Mutation: {
    createGuest: async (
      _parent,
      { input }: MutationCreateArgs,
    ): Promise<any> => {
      
      const guest = new GuestModel(input);
      await guest.save();
      return guest;
    },

    updateGuest: async (
      _parent,
      { id, input }: MutationUpdateArgs,
      _ctx: Context
    ): Promise<any | null> => {
      return GuestModel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteGuest: async (
      _parent,
      { id }: IdArg,
      _ctx: Context
    ): Promise<boolean> => {
      await GuestModel.findByIdAndDelete(id);
      return true;
    }
  }
};
