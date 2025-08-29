"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancellationPolicyResolvers = void 0;
const CancellationPolicyModel_1 = __importDefault(require("../../models/CancellationPolicyModel"));
/**
 * Resolvers for cancellation policy queries and mutations.  These
 * resolvers enable business owners to manage their cancellation rules
 * through the GraphQL API.  Policies are scoped to a single client
 * (business) and are not shared across tenants.
 */
exports.cancellationPolicyResolvers = {
    Query: {
        /**
         * Retrieve all cancellation policies for a given business.  The
         * returned array is sorted by daysBefore in descending order so that
         * the most generous policy is encountered first during evaluation.
         */
        cancellationPolicies: async (_parent, { businessId }) => {
            return CancellationPolicyModel_1.default.find({ businessId }).sort({ daysBefore: -1 });
        },
    },
    Mutation: {
        /**
         * Create a new cancellation policy.  The input must specify the
         * associated business and the rule parameters.  The newly created
         * policy is returned.
         */
        createCancellationPolicy: async (_parent, { input }) => {
            const policy = new CancellationPolicyModel_1.default(input);
            await policy.save();
            return policy;
        },
        /**
         * Update an existing cancellation policy.  Finds the policy by id and
         * applies the provided input fields.  Returns the updated policy or
         * null if no policy exists.
         */
        updateCancellationPolicy: async (_parent, { id, input }) => {
            const updated = await CancellationPolicyModel_1.default.findByIdAndUpdate(id, input, { new: true });
            return updated;
        },
        /**
         * Delete a cancellation policy by id.  Returns true if a policy
         * existed and was removed or false otherwise.
         */
        deleteCancellationPolicy: async (_parent, { id }) => {
            const res = await CancellationPolicyModel_1.default.findByIdAndDelete(id);
            return !!res;
        },
    },
};
//# sourceMappingURL=resolvers.js.map