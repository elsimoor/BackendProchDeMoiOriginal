import { gql } from "apollo-server-express";
import { businessResolvers, businessTypeDef } from "./Business";
import { guestResolvers, guestTypeDef } from "./Guest";
import { menuResolvers, menuItemTypeDef } from "./menuItem";
import { reservationResolvers, reservationTypeDef } from "./reservation";
import { roomResolvers, roomTypeDef } from "./Room";
import { serviceResolvers, serviceTypeDef } from "./service";
import { staffResolvers, staffTypeDef } from "./Staff";
import { shiftResolvers, shiftTypeDef } from "./Shift";
import { tableResolvers, tableTypeDefs } from "./Table";
import { userResolvers, userTypeDefs } from "./User";

// Import the room type controller
import { roomTypeResolvers, roomTypeTypeDef } from "./RoomType";

// New client controller providing multi‑tenant support
import { clientResolvers, clientTypeDefs } from "./Client";
import { privatisationResolvers, privatisationTypeDef } from "./privatisation";
import { dashboardResolvers, dashboardTypeDef } from "./dashboard";
// Import invoice controller
import { invoiceResolvers, invoiceTypeDef } from "./invoice";

// Payment controller handles checkout sessions and payment records
import { paymentResolvers, paymentTypeDef } from "./payment";




import { root } from "./All";
import { inputs } from "./inputs";

export const extendedTypeDefs = gql`
  scalar Date
  type Query {
    _: String!
  }
  type Mutation {
    _: String
  }
`;


const resolvers = [
  userResolvers,
  businessResolvers,
  guestResolvers,
  menuResolvers,
  reservationResolvers,
  roomResolvers,
  serviceResolvers,
  staffResolvers,
  shiftResolvers,
  tableResolvers,
  clientResolvers,
  privatisationResolvers,
  dashboardResolvers,

  // Invoice resolvers provide queries and mutations for invoices
  invoiceResolvers,

  // RoomType resolvers allow management of custom room categories
  roomTypeResolvers,

  // Payment resolvers provide queries and mutations for payments
  paymentResolvers,


];
const typeDefs = [
  userTypeDefs,
  extendedTypeDefs,
  businessTypeDef,
  guestTypeDef,
  menuItemTypeDef,
  reservationTypeDef,
  roomTypeDef,
  serviceTypeDef,
  staffTypeDef,
  shiftTypeDef,
  tableTypeDefs,
  clientTypeDefs,
  privatisationTypeDef,
  dashboardTypeDef,

  // Invoice schema
  invoiceTypeDef,
  inputs,
  root,

  // RoomType typedefs must be registered after base scalars
  roomTypeTypeDef,

  // Payment typedefs define payment queries/mutations and types
  paymentTypeDef,
];
export { resolvers, typeDefs };
