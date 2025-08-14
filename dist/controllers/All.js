"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = void 0;
// index.schema.ts
const apollo_server_express_1 = require("apollo-server-express");
exports.root = (0, apollo_server_express_1.gql) `

  extend type Query {
    # Auth

    # Users
    users(businessType: String, role: String): [User!]!
    user(id: ID!): User

    # Businesses
    hotels: [Hotel!]!
    hotel(id: ID!): Hotel
    restaurants: [Restaurant!]!
    restaurant(id: ID!): Restaurant
    salons: [Salon!]!
    salon(id: ID!): Salon

    # Reservations
    reservations(
      businessId: ID!
      businessType: String!
      status: String
      date: Date
    ): [Reservation!]!
    reservation(id: ID!): Reservation

    # Rooms
    rooms(hotelId: ID!, status: String): [Room!]!
    room(id: ID!): Room

    # Tables
    tables(restaurantId: ID!, status: String): [Table!]!
    table(id: ID!): Table

    # Services
    services(
      businessId: ID!
      businessType: String!
      category: String
    ): [Service!]!
    service(id: ID!): Service

    # Staff
    staff(
      businessId: ID!
      businessType: String!
      role: String
    ): [Staff!]!
    staffMember(id: ID!): Staff

    # Menu Items
    menuItems(restaurantId: ID!, category: String): [MenuItem!]!
    menuItem(id: ID!): MenuItem

    # Guests
    guests(
      businessId: ID!
      businessType: String!
      status: String
    ): [Guest!]!
    guest(id: ID!): Guest
  }

  extend type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Users
    # Assign a business or update role on a user
    updateUser(id: ID!, input: UserUpdateInput!): User!

    # Businesses
    createHotel(input: HotelInput!): Hotel!
    updateHotel(id: ID!, input: HotelInput!): Hotel!
    deleteHotel(id: ID!): Boolean!

    createRestaurant(input: RestaurantInput!): Restaurant!
    updateRestaurant(id: ID!, input: RestaurantInput!): Restaurant!
    deleteRestaurant(id: ID!): Boolean!

    createSalon(input: SalonInput!): Salon!
    updateSalon(id: ID!, input: SalonInput!): Salon!
    deleteSalon(id: ID!): Boolean!

    # Reservations
    createReservation(input: ReservationInput!): Reservation!
    updateReservation(id: ID!, input: ReservationInput!): Reservation!
    deleteReservation(id: ID!): Boolean!

    # Rooms
    createRoom(input: RoomInput!): Room!
    updateRoom(id: ID!, input: RoomInput!): Room!
    deleteRoom(id: ID!): Boolean!

    # Tables
    createTable(input: TableInput!): Table!
    updateTable(id: ID!, input: TableInput!): Table!
    deleteTable(id: ID!): Boolean!

    # Services
    createService(input: ServiceInput!): Service!
    updateService(id: ID!, input: ServiceInput!): Service!
    deleteService(id: ID!): Boolean!

    # Staff
    createStaff(input: StaffInput!): Staff!
    updateStaff(id: ID!, input: StaffInput!): Staff!
    deleteStaff(id: ID!): Boolean!

    # Menu Items
    createMenuItem(input: MenuItemInput!): MenuItem!
    updateMenuItem(id: ID!, input: MenuItemInput!): MenuItem!
    deleteMenuItem(id: ID!): Boolean!

    # Guests
    createGuest(input: GuestInput!): Guest!
    updateGuest(id: ID!, input: GuestInput!): Guest!
    deleteGuest(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=All.js.map