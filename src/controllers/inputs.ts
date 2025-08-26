// inputs.schema.ts
import { gql } from 'apollo-server-express';

export const inputs = gql`
  input HotelInput {
    # Name is optional in updates; still required when creating a hotel
    name: String
    description: String
    address: AddressInput
    contact: ContactInput
    settings: HotelSettingsInput
    amenities: [AmenityInput!]
    services: [BusinessServiceInput!]
    policies: [PolicyInput!]
    images: [String!]
    # Array of opening periods during which the hotel accepts reservations.
    # If omitted the hotel is considered always open.
    openingPeriods: [OpeningPeriodInput!]
    # Array of paid room options.  Each option defines a purchasable add-on
    # such as petals, champagne boxes or other enhancements.  Options
    # consist of a name, optional description and category, and a price.
    roomPaidOptions: [RoomPaidOptionInput!]
    # Array of view options available at the hotel.  Each option
    # defines a type of view (e.g. "City View") that can be attached
    # to rooms and selected by guests when booking.  When omitted
    # existing view options remain unchanged.
    roomViewOptions: [RoomViewOptionInput!]
  }

  #
  # Input used when creating or updating a restaurant.  The 'clientId' field
  # represents the owner/client associated with the restaurant.  It must be
  # provided when creating a restaurant but is optional when updating.  The
  # GraphQL schema does not distinguish between create and update inputs, so
  # we mark 'clientId' as optional here to allow partial updates.  Similarly
  # the 'name' is required when creating a new restaurant but optional when
  # updating existing records.  Other fields are optional and may be omitted
  # entirely during updates; only provided fields will be modified.
  input RestaurantInput {
    clientId: ID
    name: String
    description: String
    address: AddressInput
    contact: ContactInput
    settings: RestaurantSettingsInput
    businessHours: [BusinessHoursInput!]
    cuisine: [String!]
    priceRange: String
    features: [String!]
    policies: [PolicyInput!]
    images: [String!]
    # Payment methods accepted by the restaurant.  When omitted the existing
    # payment methods remain unchanged.  Each entry defines a name, enabled
    # flag, optional processing fee and an optional special activation date.
    paymentMethods: [PaymentMethodInput!]
  }

  input SalonInput {
    name: String!
    description: String
    address: AddressInput
    contact: ContactInput
    settings: SalonSettingsInput
    businessHours: [BusinessHoursInput!]
    specialties: [String!]
    policies: [PolicyInput!]
    images: [String!]
  }

 

  
  input HotelSettingsInput {
    checkInTime: String
    checkOutTime: String
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
  }



  input SalonSettingsInput {
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
    cancellationHours: Int
  }

  input BusinessHoursInput {
    day: String!
    isOpen: Boolean!
    openTime: String
    closeTime: String
  }

  input AmenityInput {
    name: String!
    description: String
    included: Boolean!
    category: String
    price: Float

  }

  input BusinessServiceInput {
    name: String!
    description: String
    price: Float!
    category: String
    available: Boolean!
  }


  input PolicyInput {
    title: String!
    description: String!
    category: String!
  }

  """
  Input type for specifying a paid room option when creating or updating
  a hotel.  Each option is an add-on that can be purchased in addition
  to a room booking.  The price field is required.
  """
  input RoomPaidOptionInput {
    name: String!
    description: String
    category: String
    price: Float!
  }

  # Input type for specifying a view option when creating or updating
  # a hotel or room.  Each view option has a name and may include a
  # description and an optional price.  When no price is provided
  # the view is considered free of charge.
  input RoomViewOptionInput {
    name: String!
    description: String
    category: String
    price: Float
  }

  # Input type for defining a monthly pricing session for a room.
  # Each session specifies a start and end month (1–12) and a
  # nightly price.  The hotel manager can provide multiple
  # sessions to implement seasonal pricing.  When omitted or when
  # the array is empty the room's base price applies for all
  # months.  Example: to charge 200 dh per night from January to
  # May and 600 dh from June to December, pass two objects:
  # { startMonth: 1, endMonth: 5, price: 200 }, { startMonth: 6,
  # endMonth: 12, price: 600 }.
  input RoomMonthlyPriceInput {
    startMonth: Int!
    endMonth: Int!
    price: Float!
  }

  # Input type for defining a special date-range pricing session for a room.
  # Each session specifies a start and end month/day (1–12 for the month
  # and 1–31 for the day) and a nightly price.  Date ranges may span
  # across the year boundary.  When omitted or when the array is empty
  # the room's base price (and monthly pricing if defined) applies for
  # all days.
  input RoomSpecialPriceInput {
    startMonth: Int!
    startDay: Int!
    endMonth: Int!
    endDay: Int!
    price: Float!
  }

  """
  OpeningPeriodInput represents a date range (inclusive) when a hotel is open.
  """
  input OpeningPeriodInput {
    startDate: Date!
    endDate: Date!
  }

  input RoomInput {
    hotelId: ID!
    number: String!
    type: String!
    floor: Int
    capacity: Int!
    price: Float!
    size: Int
    status: String
    amenities: [String!]
    features: [String!]
    condition: String
    lastCleaned: Date
    nextMaintenance: Date
    images: [String!]

    # Additional descriptive fields for a room
    bedType: [String]
    numberOfBeds: Int
    numberOfBathrooms: Int
    description: String

    # List of paid options to associate with this room.  Each entry must
    # correspond to a paid room option available on the hotel.  This
    # allows room-specific add-ons such as petals or champagne boxes to
    # be pre-configured.  Omit this field or provide an empty array
    # when no paid options should be attached to the room.
    paidOptions: [RoomPaidOptionInput!]

    # List of view options to associate with this room.  Each entry
    # corresponds to a view option defined on the hotel.  This allows
    # specific rooms to offer particular views such as "City View" or
    # "Garden View".  If omitted the room will have no view options.
    viewOptions: [RoomViewOptionInput!]

    # Optional array of monthly pricing sessions for this room.  Each
    # entry defines a continuous range of months and the nightly
    # rate to apply during that period.  When provided this
    # overrides the base price for the specified months.  When
    # omitted or when the array is empty the base price applies
    # year‑round.
    monthlyPrices: [RoomMonthlyPriceInput!]

    # Array of special date-range pricing sessions.  Each object
    # defines a start month/day and end month/day along with a
    # nightly price to apply during that period.  When omitted or
    # empty the base price (and monthlyPrices) applies to all days.
    specialPrices: [RoomSpecialPriceInput!]
  }

  input TableInput {
    restaurantId: ID!
    number: Int!
    capacity: Int!
    location: String!
    status: String
    features: [String!]
    position: PositionInput
    images: [String!]
  }

  input PositionInput {
    x: Float
    y: Float
  }

  input ServiceInput {
    businessId: ID!
    businessType: String!
    name: String!
    description: String
    category: String
    duration: Int
    price: Float!
    available: Boolean
    popular: Boolean
    staffRequired: [String!]
    requirements: [String!]
    images: [String!]
    # New salon-specific fields
    defaultEmployee: ID
    defaultRoom: ID
    allowClientChoose: Boolean
    options: [ServiceOptionInput!]
  }

  """
  Input type for specifying service options when creating or updating a
  service.  Each option can independently modify the price and
  duration of the service.  All fields are optional; omitting a field
  will leave the corresponding value unchanged.
  """
  input ServiceOptionInput {
    name: String!
    price: Float
    durationImpact: Int
  }

  input StaffInput {
    businessId: ID!
    businessType: String!
    userId: ID
    name: String!
    role: String!
    email: String
    phone: String
    hireDate: Date
    schedule: String
    hourlyRate: Float
    status: String
    specialties: [String!]
    availability: [AvailabilityInput!]
    avatar: String
    notes: String
  }

  input AvailabilityInput {
    day: String!
    startTime: String!
    endTime: String!
    available: Boolean!
  }

  input ReservationInput {
    businessId: ID!
    businessType: String!
    customerId: ID
    customerInfo: CustomerInfoInput!

    # Hotel specific
    roomId: ID
    checkIn: Date
    checkOut: Date
    guests: Int

    # Restaurant specific
    tableId: ID
    partySize: Int

    # Salon specific
    serviceId: ID
    staffId: ID

    # Common fields
    date: Date!
    time: String
    duration: Int
    status: String
    totalAmount: Float
    paymentStatus: String
    notes: String
    specialRequests: String
    source: String
    # Optional URL to a file (e.g. Word document) containing detailed
    # requirements for the reservation.  When omitted the reservation
    # has no associated file.
    reservationFileUrl: String
  }

  input CustomerInfoInput {
    name: String!
    email: String!
    phone: String!
  }

  input MenuItemInput {
    restaurantId: ID!
    name: String!
    description: String
    category: String!
    price: Float!
    prepTime: Int
    available: Boolean
    popular: Boolean
    allergens: [String!]
    dietaryInfo: [String!]
    spiceLevel: String
    ingredients: [String!]
    nutritionalInfo: NutritionalInfoInput
    images: [String!]
  }

  input NutritionalInfoInput {
    calories: Int
    protein: Float
    fat: Float
    carbs: Float
  }

  input GuestInput {
    businessId: ID!
    businessType: String!
    userId: ID
    name: String!
    email: String!
    phone: String
    address: AddressInput
    membershipLevel: String
    preferences: GuestPreferencesInput
    notes: String
    status: String
    communicationPreferences: CommunicationPreferencesInput
  }

  input GuestPreferencesInput {
    roomType: String
    bedType: String
    floor: String
    seatingPreference: String
    cuisinePreferences: [String!]
    dietaryRestrictions: [String!]
    preferredStylist: String
    favoriteServices: [String!]
    allergies: [String!]
  }

  input CommunicationPreferencesInput {
    email: Boolean
    sms: Boolean
    phone: Boolean
  }
`;
