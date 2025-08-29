"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancellationPolicyTypeDef = void 0;
const apollo_server_express_1 = require("apollo-server-express");
/**
 * GraphQL schema definitions for cancellation policies.  A
 * CancellationPolicy defines how far in advance a guest must cancel to
 * receive a specific refund percentage.  Policies are associated
 * with a business (client) and are ordered by daysBefore descending.
 */
exports.cancellationPolicyTypeDef = (0, apollo_server_express_1.gql) `
  type CancellationPolicy {
    id: ID!
    businessId: ID!
    daysBefore: Int!
    refundPercentage: Float!
    createdAt: Date
    updatedAt: Date
  }

  input CancellationPolicyInput {
    businessId: ID!
    daysBefore: Int!
    refundPercentage: Float!
  }

  extend type Query {
    """
    Return all cancellation policies for a given business (tenant).  The
    results are sorted by daysBefore descending so that the most generous
    policy appears first.
    """
    cancellationPolicies(businessId: ID!): [CancellationPolicy!]!
  }

  extend type Mutation {
    """
    Create a new cancellation policy for a business.  The input must
    include the business identifier and the rule parameters.  Returns
    the created policy.
    """
    createCancellationPolicy(input: CancellationPolicyInput!): CancellationPolicy!

    """
    Update an existing cancellation policy.  The policy is replaced
    with the provided input fields.  Returns the updated policy or null
    if no policy was found.
    """
    updateCancellationPolicy(id: ID!, input: CancellationPolicyInput!): CancellationPolicy!

    """
    Delete a cancellation policy by id.  Returns true when the policy
    was removed and false otherwise.
    """
    deleteCancellationPolicy(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=typeDefs.js.map