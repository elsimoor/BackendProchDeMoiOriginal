"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reservationTypeDef = void 0;
// reservation.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.reservationTypeDef = (0, apollo_server_express_1.gql) `

  type Reservation {
    id: ID!
    # The client (tenant) that owns this reservation.  This replaces the
    # previous businessId field which returned a Hotel; now any
    # reservation is linked to a Client regardless of the module type.
    client: Client
    # Indicates the type of reservation: "hotel" (for rooms), "restaurant" or
    # "salon" (for services).  This naming remains for backwards
    # compatibility with existing models.
    businessType: String!
    customerId: User
    customerInfo: CustomerInfo!

    # Hotel specific
    roomId: Room
    checkIn: Date
    checkOut: Date
    guests: Int

    # Restaurant specific
    tableId: Table
    partySize: Int

    # Salon specific
    serviceId: Service
    staffId: Staff

    # Common fields
    date: Date!
    time: String
    duration: Int
    status: String!
    totalAmount: Float
    paymentStatus: String!
    notes: String
    specialRequests: String
    reminderSent: Boolean!
    source: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type CustomerInfo {
    name: String!
    email: String!
    phone: String!
  }

  input CreateReservationV2Input {
    date: String!
    heure: String!
    personnes: Int!
    emplacement: String
    source: String!
    restaurantId: ID!
    customerInfo: CustomerInfoInput!
  }

  input CreatePrivatisationV2Input {
    date: String!
    heure: String!
    dureeHeures: Int!
    type: String!
    menu: String!
    espace: String!
    personnes: Int!
    source: String!
    restaurantId: ID!
    customerInfo: CustomerInfoInput!
  }
`;
//# sourceMappingURL=typeDefs.js.map