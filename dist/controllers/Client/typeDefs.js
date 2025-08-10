"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
/**
 * GraphQL type definitions for the Client entity.
 *
 * A Client represents a single tenant within the application.  Each client can
 * enable one or more reservation modules (rooms, services, restaurant),
 * customise their branding (logo and colours) and store standard contact
 * information.  These definitions expose both the entity fields and the
 * inputs required to create or update a client.
 */
exports.clientTypeDefs = (0, apollo_server_express_1.gql) `
  """
  A set of flags indicating which reservation modules are active for a client.
  """
  type Modules {
    rooms: Boolean!
    services: Boolean!
    restaurant: Boolean!
  }

  """
  Visual theme customisation for a client.  Optional properties allow
  overriding the logo, primary/secondary colours and typography.  These
  variables are consumed by the front‑office to style the booking interfaces.
  """
  type Theme {
    logoUrl: String
    primaryColor: String
    secondaryColor: String
    typography: String
  }

  """
  A Client (also referred to as a Business) represents a single tenant of
  the reservation system.  Clients own reservations, rooms, services and
  tables via the clientId foreign key.  Clients can be activated or
  deactivated; deactivated clients are hidden from queries.
  """
  type Client {
    id: ID!
    name: String!
    siret: String
    address: Address
    contact: Contact
    modules: Modules!
    theme: Theme
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  input ModulesInput {
    rooms: Boolean!
    services: Boolean!
    restaurant: Boolean!
  }

  input ThemeInput {
    logoUrl: String
    primaryColor: String
    secondaryColor: String
    typography: String
  }

  input ClientInput {
    name: String!
    siret: String
    address: AddressInput
    contact: ContactInput
    modules: ModulesInput!
    theme: ThemeInput
  }

  input ClientUpdateInput {
    name: String
    siret: String
    address: AddressInput
    contact: ContactInput
    modules: ModulesInput
    theme: ThemeInput
    isActive: Boolean
  }

  extend type Query {
    """
    Return a list of all active clients.  Inactive clients are filtered
    automatically.  Clients are ordered by creation date descending.
    """
    clients: [Client!]!

    """
    Fetch a single client by its ID.  Returns null if no client exists
    with the provided identifier.
    """
    client(id: ID!): Client
  }

  extend type Mutation {
    """
    Create a new client.  The caller may specify the modules and theme; if
    omitted the modules default to all disabled and the theme is blank.  A
    newly created client is active by default.
    """
    createClient(input: ClientInput!): Client!

    """
    Update an existing client.  Only the provided fields will be modified.
    Attempting to update a non‑existent client returns null.
    """
    updateClient(id: ID!, input: ClientUpdateInput!): Client

    """
    Soft delete a client.  Rather than removing the document from the
    database this sets the isActive flag to false.  Returns true on success.
    """
    deleteClient(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=typeDefs.js.map