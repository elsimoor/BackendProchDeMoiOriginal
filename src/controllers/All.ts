// index.schema.ts
import { gql } from 'apollo-server-express';


export const root = gql`

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

    # Shifts
    # Retrieve all shifts for a business.  Optionally filter by staff
    # member and/or a date range.  Returns an empty array when no
    # shifts are found.  The startDate and endDate parameters are
    # inclusive.
    # shifts(
    #   businessId: ID!
    #   businessType: String!
    #   staffId: ID
    #   startDate: Date
    #   endDate: Date
    # ): [Shift!]!
    # # Fetch a single shift by ID.  Returns null if the ID is invalid
    # # or no shift exists with that ID.
    # shift(id: ID!): Shift

  }

  extend type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Users
    # Assign a business or update role on a user
    updateUser(id: ID!, input: UserUpdateInput!): User!

    # Permanently remove a user from the system.  Returns true when the
    # user was found and deleted and false otherwise.
    deleteUser(id: ID!): Boolean!

    # Append a new service to an existing user.  This mutation
    # enables a manager account to manage additional businesses
    # (hotel, restaurant or salon) without overwriting their
    # primary businessId/businessType.  Provide the userId to
    # update along with the businessId and businessType of the
    # newly created service.  Returns the updated user.
    appendUserService(input: AppendUserServiceInput!): User!

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

    # Shift management
    # Create a new shift with the provided details.  The caller must
    # supply a businessId, businessType and staffId to correctly
    # associate the shift.  Returns the newly created shift.
    # createShift(input: ShiftInput!): Shift!
    # # Update an existing shift.  Only the fields present in the input
    # # will be modified.  Returns the updated shift or null if the
    # # provided ID is invalid.
    # updateShift(id: ID!, input: ShiftInput!): Shift!
    # # Delete a shift by ID.  Returns true if the deletion was
    # # successful or false if the ID was invalid.
    # deleteShift(id: ID!): Boolean!




    removeAdminRoleFromServices: Boolean!



  }
`;

