import { gql } from 'apollo-server-express';

export const businessTypeDef = gql`

  type OpeningPeriod {
    startDate: Date!
    endDate: Date!
  }

  type Hotel {
    id: ID!
    name: String!
    description: String
    address: Address
    contact: Contact
    settings: HotelSettings
    amenities: [Amenity!]!
    services: [BusinessService!]!
    policies: [Policy!]!
    images: [String!]!
    rating: Rating
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    # Opening periods during which reservations are allowed
    openingPeriods: [OpeningPeriod!]
    # Paid room options available for purchase with a stay.  Each option is an
    # add-on such as petals, champagne boxes or other enhancements.  All
    # fields are returned so clients can display pricing information.
    roomPaidOptions: [RoomPaidOption!]!
    # View options available at this hotel.  Each view can be
    # associated with rooms so that guests can select a preferred
    # view when booking.  When no view options are configured this
    # array is empty.
    roomViewOptions: [RoomViewOption!]!
    #
    # A featured landing card configured by the hotel manager.  This
    # optional object contains promotional details used on the public
    # landing pages.  If no card has been configured, this field
    # resolves to null.  See the "LandingCard" type definition
    # below for the available fields.
    featuredLandingCard: LandingCard
  }

  #
  # Represents an optional promotional card for a hotel.  The fields
  # correspond to the values requested by the front‑end when displaying
  # featured hotels on the landing page.  All fields are nullable to
  # allow partial population or computed defaults on the client side.
  type LandingCard {
    id: ID
    title: String
    description: String
    image: String
    price: Float
    rating: Float
    location: String
    tags: [String!]
    amenities: [String!]
    specialOffer: Boolean
  }

  type Restaurant {
    id: ID!
    name: String!
    description: String
    address: Address
    contact: Contact
    settings: RestaurantSettings
    businessHours: [BusinessHours!]!
    cuisine: [String!]!
    priceRange: String
    features: [String!]!
    policies: [Policy!]!
    images: [String!]!
    rating: Rating
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    # Payment methods accepted by the restaurant.  When omitted the
    # restaurant falls back to default payment behaviour.
    paymentMethods: [PaymentMethod!]
  }

  type Salon {
    id: ID!
    name: String!
    description: String
    address: Address
    contact: Contact
    settings: SalonSettings
    businessHours: [BusinessHours!]!
    specialties: [String!]!
    policies: [Policy!]!
    images: [String!]!
    rating: Rating
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Contact {
    phone: String
    email: String
    website: String
  }

  type HotelSettings {
    checkInTime: String
    checkOutTime: String
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
  }

  type RestaurantSettings {
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
    maxPartySize: Int
    reservationWindow: Int
    cancellationHours: Int
    horaires: [Horaire!]
    capaciteTotale: Int
    tables: Tables
    frequenceCreneauxMinutes: Int
    maxReservationsParCreneau: Int
    capaciteTheorique: Int

    # Périodes de fermeture de l'établissement (congés annuels, fermetures exceptionnelles).
    fermetures: [ClosurePeriod!]
    # Jours ouverts dans la semaine (ex. ["Monday", "Tuesday"]).
    joursOuverts: [String!]
    # Tables personnalisées pour définir des tailles de table non standard.
    customTables: [TableSize!]
    # Dress code enforced by the restaurant (e.g. "casual",
    # "smart-casual", "business", "formal").  When omitted the
    # default of "smart-casual" applies.
    dressCode: String
  }

  type Horaire {
    ouverture: String
    fermeture: String
    # Optional price per person (for restaurant reservations) for this time period.
    prix: Float
  }

  # Représente une période de fermeture avec une date de début et de fin.
  type ClosurePeriod {
    debut: String
    fin: String
  }

  # Représente une taille de table personnalisée et la quantité disponible.
  type TableSize {
    taille: Int
    nombre: Int
  }

  type Tables {
    size2: Int
    size4: Int
    size6: Int
    size8: Int
  }

  input RestaurantSettingsInput {
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
    maxPartySize: Int
    reservationWindow: Int
    cancellationHours: Int
    horaires: [HoraireInput!]
    capaciteTotale: Int
    tables: TablesInput
    frequenceCreneauxMinutes: Int
    maxReservationsParCreneau: Int

    # Nouvelles propriétés pour les horaires avancés et la capacité
    fermetures: [ClosurePeriodInput!]
    joursOuverts: [String!]
    customTables: [TableSizeInput!]
    # Optional dress code.  If omitted the existing dress code will be retained.
    dressCode: String
  }

  input HoraireInput {
    ouverture: String
    fermeture: String
    prix: Float
  }

  input TablesInput {
    size2: Int
    size4: Int
    size6: Int
    size8: Int
  }

  # Input pour une période de fermeture
  input ClosurePeriodInput {
    debut: String
    fin: String
  }

  # Input pour une table personnalisée
  input TableSizeInput {
    taille: Int
    nombre: Int
  }

  type SalonSettings {
    currency: String
    timezone: String
    taxRate: Float
    serviceFee: Float
    cancellationHours: Int
  }

  type BusinessHours {
    day: String!
    isOpen: Boolean!
    openTime: String
    closeTime: String
  }

  type Amenity {
    name: String!
    description: String
    included: Boolean!
    category: String
    price: Float
  }

  type BusinessService {
    name: String!
    description: String
    price: Float!
    category: String
    available: Boolean!
  }

  type Policy {
    title: String!
    description: String!
    category: String!
  }

  # Represents a paid room option that can be added to a hotel booking.
  # Options include a name, optional description and category, and a price.
  type RoomPaidOption {
    name: String!
    description: String
    category: String
    price: Float!
  }

  type Rating {
    average: Float!
    count: Int!
  }

  # Represents a view option that can be selected when booking a room.
  # Each view option has a name and may include an optional
  # description, category and price.  When no price is specified the
  # view is assumed to be included at no extra cost.
  type RoomViewOption {
    name: String!
    description: String
    category: String
    price: Float
  }

  """
  Represents a method of payment that a restaurant can accept.  Each
  method includes a name, an enabled flag indicating whether it is
  currently accepted, an optional processing fee (in the local currency)
  and an optional ISO date when the method is exclusively enabled (for
  example, to support special payment options on New Year's Eve).
  """
  type PaymentMethod {
    name: String!
    enabled: Boolean!
    processingFee: Float
    specialDate: String
  }

  """
  Input type for specifying a payment method when creating or updating
  a restaurant.  Each payment method must include a name and enabled
  flag.  Processing fee and specialDate are optional.
  """
  input PaymentMethodInput {
    name: String!
    enabled: Boolean!
    processingFee: Float
    specialDate: String
  }

  extend type Mutation {
    #
    # The restaurant update mutation is declared in the global root schema
    # (src/controllers/All.ts) using the 'RestaurantInput' type.  We omit
    # its declaration here to avoid conflicting definitions.  The
    # CreateReservationV2 and CreatePrivatisationV2 mutations remain.
    createReservationV2(input: CreateReservationV2Input!): Reservation!
    createPrivatisationV2(input: CreatePrivatisationV2Input!): Reservation!
  }

  input UpdateRestaurantInput {
    name: String
    description: String
    address: AddressInput
    contact: ContactInput
    settings: RestaurantSettingsInput
    cuisine: [String!]
    priceRange: String
    features: [String!]
    images: [String!]
    isActive: Boolean
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  input ContactInput {
    phone: String
    email: String
    website: String
  }

  # ------------------------------------------------------------------------
  # Pending approval queries and mutations
  #
  # These queries allow administrators to retrieve businesses awaiting
  # approval.  Each list returns entities with isActive set to false.
  # The corresponding mutations allow the admin to approve (activate)
  # or reject (remove) a business.  Approval sets the isActive flag to
  # true on both the business and any associated user accounts.  Rejection
  # deletes the business and deactivates associated users.

  extend type Query {
    pendingHotels: [Hotel!]!
    pendingRestaurants: [Restaurant!]!
    pendingSalons: [Salon!]!
  }

  extend type Mutation {
    approveHotel(id: ID!): Hotel!
    rejectHotel(id: ID!): Hotel!
    approveRestaurant(id: ID!): Restaurant!
    rejectRestaurant(id: ID!): Restaurant!
    approveSalon(id: ID!): Salon!
    rejectSalon(id: ID!): Salon!
  }
`;
