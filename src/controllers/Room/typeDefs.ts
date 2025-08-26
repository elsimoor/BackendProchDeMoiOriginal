// room.schema.ts
import { gql } from 'apollo-server-express';

export const roomTypeDef = gql`

  """
  Defines a pricing session for a room.  Each session specifies
  a continuous range of months (1–12) and a nightly rate.  When
  monthly pricing is provided on a room the booking price is
  determined by looking up the month of each night’s stay and
  matching it against these sessions.  If no session applies the
  room’s base price field is used.  See the Room.monthlyPrices
  field for details.
  """
  type RoomMonthlyPrice {
    startMonth: Int!
    endMonth: Int!
    price: Float!
  }

  """
  Defines a date-range pricing session for a room.  Each session
  specifies a start and end month/day (1–12 for the month and
  1–31 for the day) and a nightly rate.  When a booking date
  falls within this range (inclusive) the associated price
  overrides any monthly or base price.  Date ranges may cross the
  year boundary; for example startMonth=12,startDay=20,endMonth=1,
  endDay=5 covers December 20 through January 5 each year.
  """
  type RoomSpecialPrice {
    startMonth: Int!
    startDay: Int!
    endMonth: Int!
    endDay: Int!
    price: Float!
  }

  type Room {
    id: ID!
    hotelId: Hotel
    number: String!
    type: String!
    floor: Int
    capacity: Int!
    price: Float!
    size: Int
    status: String!
    amenities: [String!]!
    features: [String!]!
    condition: String!
    lastCleaned: Date
    nextMaintenance: Date
    images: [String!]!
    isActive: Boolean!
    # Newly added descriptive fields
    bedType: [String]
    numberOfBeds: Int
    numberOfBathrooms: Int
    description: String

    # List of paid options selected for this room.  Each option
    # corresponds to a purchasable add-on defined on the parent
    # hotel.  When no options are selected this array is empty.
    paidOptions: [RoomPaidOption!]!

    # List of view options available for this room.  Each view option
    # corresponds to a view defined by the parent hotel.  When no
    # view options are assigned this array is empty.
    viewOptions: [RoomViewOption!]!
    # Array of monthly pricing sessions.  Each entry defines a range
    # of months and a nightly price that overrides the base price for
    # those months.  When empty the base price applies to all
    # months.
    monthlyPrices: [RoomMonthlyPrice!]!

    # Array of special pricing periods defined by month and day
    # ranges.  When a booking night falls within any of these
    # periods the corresponding price overrides the base price and
    # any monthly pricing.  If multiple special periods overlap the
    # first defined in the array takes precedence.
    specialPrices: [RoomSpecialPrice!]!
    createdAt: Date!
    updatedAt: Date!
  }

  extend type Query {
    """
    Return a list of rooms that are available for the given hotel and date
    range.  A room is considered available if it is active, has status
    "available" and there is no existing hotel reservation with
    overlapping check‑in/check‑out dates for that room.  Both
    parameters are required and should be ISO formatted dates.
    """
    availableRooms(hotelId: ID!, checkIn: Date!, checkOut: Date!, adults: Int!, children: Int!): [Room!]!
    availableRoomsCount(hotelId: ID!, checkIn: Date!, checkOut: Date!, adults: Int!, children: Int!): Int!
  }
`;
