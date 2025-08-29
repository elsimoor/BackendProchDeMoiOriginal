import CancellationPolicyModel from '../../models/CancellationPolicyModel';

/**
 * Resolvers for cancellation policy queries and mutations.  These
 * resolvers enable business owners to manage their cancellation rules
 * through the GraphQL API.  Policies are scoped to a single client
 * (business) and are not shared across tenants.
 */
export const cancellationPolicyResolvers = {
  Query: {
    /**
     * Retrieve all cancellation policies for a given business.  The
     * returned array is sorted by daysBefore in descending order so that
     * the most generous policy is encountered first during evaluation.
     */
    cancellationPolicies: async (_parent: any, { businessId }: { businessId: string }) => {
      return CancellationPolicyModel.find({ businessId }).sort({ daysBefore: -1 });
    },
  },
  Mutation: {
    /**
     * Create a new cancellation policy.  The input must specify the
     * associated business and the rule parameters.  The newly created
     * policy is returned.
     */
    createCancellationPolicy: async (_parent: any, { input }: { input: any }) => {
      const policy = new CancellationPolicyModel(input);
      await policy.save();
      return policy;
    },
    /**
     * Update an existing cancellation policy.  Finds the policy by id and
     * applies the provided input fields.  Returns the updated policy or
     * null if no policy exists.
     */
    updateCancellationPolicy: async (_parent: any, { id, input }: { id: string; input: any }) => {
      const updated = await CancellationPolicyModel.findByIdAndUpdate(id, input, { new: true });
      return updated;
    },
    /**
     * Delete a cancellation policy by id.  Returns true if a policy
     * existed and was removed or false otherwise.
     */
    deleteCancellationPolicy: async (_parent: any, { id }: { id: string }) => {
      const res = await CancellationPolicyModel.findByIdAndDelete(id);
      return !!res;
    },
  },
};