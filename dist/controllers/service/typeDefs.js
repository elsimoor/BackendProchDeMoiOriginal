"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceTypeDef = void 0;
// service.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.serviceTypeDef = (0, apollo_server_express_1.gql) `

  """
  Represents an optional add‑on for a salon service.  Service options
  allow salons to offer customisations that adjust the base price and
  duration of a service.  For example, a massage service might have an
  option to add aromatherapy for an additional fee and time.
  """
  type ServiceOption {
    name: String!
    price: Float
    durationImpact: Int
  }

  type Service {
    id: ID!
    businessId: ID!
    businessType: String!
    name: String!
    description: String
    category: String
    duration: Int
    price: Float!
    available: Boolean!
    popular: Boolean!
    staffRequired: [String!]!
    requirements: [String!]!
    images: [String!]!
    isActive: Boolean!
    # New fields specific to salon services
    defaultEmployee: ID
    defaultRoom: ID
    allowClientChoose: Boolean
    options: [ServiceOption!]!
    createdAt: Date!
    updatedAt: Date!
  }
`;
//# sourceMappingURL=typeDefs.js.map