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
  }

  input RestaurantInput {
    clientId: ID!
    name: String!
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
