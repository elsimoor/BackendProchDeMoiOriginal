// import { AuthenticationError } from 'apollo-server-express';
import ClientModel from '../../models/ClientModel';

/**
 * GraphQL resolvers for the Client entity.  These resolvers provide CRUD
 * operations on clients.  For simplicity and to match the "cahier de charge"
 * requirements we do not enforce authentication or authorisation here; in
 * a production system you should restrict these mutations to users with the
 * appropriate roles (e.g. admins).
 */

interface IdArg {
  id: string;
}

interface MutationArgs<I = any> {
  input: I;
}

interface MutationUpdateArgs<I = any> {
  id: string;
  input: I;
}

export const clientResolvers = {
  Query: {
    clients: async () => {
      // Return all active clients sorted by most recent
      return ClientModel.find({ isActive: true }).sort({ createdAt: -1 });
    },
    client: async (_parent: any, { id }: IdArg) => {
      return ClientModel.findById(id);
    },
  },
  Mutation: {
    // The createClient mutation does not require context; remove the unused
    // context parameter to satisfy the TypeScript compiler.
    createClient: async (
      _parent: any,
      { input }: MutationArgs
    ) => {
      // Potential place to perform role/permission checks
      // e.g. if (!context.user || context.user.role !== 'admin') {
      //   throw new AuthenticationError('Not authorised to create a client');
      // }
      const client = new ClientModel(input);
      await client.save();
      return client;
    },
    // The updateClient mutation does not require context; remove the unused
    // context parameter to satisfy the TypeScript compiler.
    updateClient: async (
      _parent: any,
      { id, input }: MutationUpdateArgs
    ) => {
      // Optional role check as above
      return ClientModel.findByIdAndUpdate(id, input, { new: true });
    },
    // The deleteClient mutation does not require context; remove the unused
    // context parameter to satisfy the TypeScript compiler.
    deleteClient: async (
      _parent: any,
      { id }: IdArg
    ): Promise<boolean> => {
      // Soft delete: mark the client as inactive
      const existing = await ClientModel.findById(id);
      if (!existing) return false;
      existing.isActive = false;
      await existing.save();
      return true;
    },
  },
};