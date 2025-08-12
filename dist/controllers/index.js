"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDefs = exports.resolvers = exports.extendedTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Business_1 = require("./Business");
const Guest_1 = require("./Guest");
const menuItem_1 = require("./menuItem");
const reservation_1 = require("./reservation");
const Room_1 = require("./Room");
const service_1 = require("./service");
const Staff_1 = require("./Staff");
const Table_1 = require("./Table");
const User_1 = require("./User");
// New client controller providing multi‑tenant support
const Client_1 = require("./Client");
const privatisation_1 = require("./privatisation");
const dashboard_1 = require("./dashboard");
// Import invoice controller
const invoice_1 = require("./invoice");
// Import landing card controller
const landingCard_1 = require("./landingCard");
const All_1 = require("./All");
const inputs_1 = require("./inputs");
exports.extendedTypeDefs = (0, apollo_server_express_1.gql) `
  scalar Date
  type Query {
    _: String!
  }
  type Mutation {
    _: String
  }
`;
const resolvers = [
    User_1.userResolvers,
    Business_1.businessResolvers,
    Guest_1.guestResolvers,
    menuItem_1.menuResolvers,
    reservation_1.reservationResolvers,
    Room_1.roomResolvers,
    service_1.serviceResolvers,
    Staff_1.staffResolvers,
    Table_1.tableResolvers,
    Client_1.clientResolvers,
    privatisation_1.privatisationResolvers,
    dashboard_1.dashboardResolvers,
    // Invoice resolvers provide queries and mutations for invoices
    invoice_1.invoiceResolvers,
    // Landing card resolvers for promotional landing page cards
    landingCard_1.landingCardResolvers,
];
exports.resolvers = resolvers;
const typeDefs = [
    User_1.userTypeDefs,
    exports.extendedTypeDefs,
    Business_1.businessTypeDef,
    Guest_1.guestTypeDef,
    menuItem_1.menuItemTypeDef,
    reservation_1.reservationTypeDef,
    Room_1.roomTypeDef,
    service_1.serviceTypeDef,
    Staff_1.staffTypeDef,
    Table_1.tableTypeDefs,
    Client_1.clientTypeDefs,
    privatisation_1.privatisationTypeDef,
    dashboard_1.dashboardTypeDef,
    // Invoice schema
    invoice_1.invoiceTypeDef,
    // Landing card type definitions
    landingCard_1.landingCardTypeDefs,
    inputs_1.inputs,
    All_1.root,
];
exports.typeDefs = typeDefs;
//# sourceMappingURL=index.js.map