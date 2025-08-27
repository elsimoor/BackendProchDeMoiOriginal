// business.resolvers.ts
import { GraphQLError } from 'graphql';
import moment from 'moment';
import HotelModel from '../../models/HotelModel';
import RestaurantModel from '../../models/RestaurantModel';
import SalonModel from '../../models/SalonModel';
import ReservationModel from '../../models/ReservationModel';
// Import the user model so that we can activate or deactivate users
// when a business is approved or rejected.
import UserModel from '../../models/UserModel';


interface Context {
  user?: { id: string };
}

interface IdArg {
  id: string;
}

type CreateHotelInput = any;      // replace `any` with your actual input shape
type UpdateHotelInput = any;
type CreateRestaurantInput = any;
// interface UpdateRestaurantInput {
//   name?: string;
//   description?: string;
//   settings?: {
//     horaires?: { ouverture: string; fermeture: string }[];
//     capaciteTotale?: number;
//     tables?: { size2?: number; size4?: number; size6?: number; size8?: number };
//     frequenceCreneauxMinutes?: number;
//     maxReservationsParCreneau?: number;
//   };
// }
type CreateSalonInput = any;
type UpdateSalonInput = any;

interface MutationArgs<I = any> {
  input: I;
}
interface MutationUpdateArgs<I = any> {
  id: string;
  input: I;
}

export const businessResolvers = {
  Query: {
    hotels: async () => {
      return HotelModel.find({ isActive: true })
    },
    hotel: async (_parent, { id }: IdArg) => {
      return HotelModel.findById(id)
    },
    restaurants: async () => {
      return RestaurantModel.find({ isActive: true })
    },
    restaurant: async (_parent, { id }: IdArg) => {
      return RestaurantModel.findById(id)
    },
    salons: async () => {
      return SalonModel.find({ isActive: true })
    },
    salon: async (_parent, { id }: IdArg) => {
      return SalonModel.findById(id)
    },

    /**
     * Return all hotels awaiting approval.  A hotel is considered
     * pending when its isActive flag is false.  This list is used
     * by the admin approvals page.
     */
    pendingHotels: async () => {
      return HotelModel.find({ isActive: false });
    },

    /**
     * Return all restaurants awaiting approval (isActive = false).
     */
    pendingRestaurants: async () => {
      return RestaurantModel.find({ isActive: false });
    },

    /**
     * Return all salons awaiting approval (isActive = false).
     */
    pendingSalons: async () => {
      return SalonModel.find({ isActive: false });
    }
  },

  // Field resolvers for custom types
  Hotel: {
    /**
     * Resolve the featuredLandingCard field for a hotel.  Currently
     * no explicit landing card data is stored in the database, so
     * this resolver returns null for all hotels.  The front‑end
     * gracefully handles a null response by generating fallback
     * values.  To support user‑configured cards in the future, add
     * a `featuredLandingCard` or `landingCards` property to the
     * Hotel model and return the appropriate record here.
     */
    featuredLandingCard: () => {
      return null;
    },
  },

  Mutation: {
    createHotel: async (
      _parent,
      { input }: MutationArgs<CreateHotelInput>,
    ) => {
      const hotel = new HotelModel(input);
      await hotel.save();
      return hotel as any;
    },

    updateHotel: async (
      _parent,
      { id, input }: MutationUpdateArgs<UpdateHotelInput>,
      _ctx: Context
    ) => {
      // Find the existing hotel by ID.  If no document is found, throw
      // a GraphQL error instead of returning null so that the
      // non‑nullable return type is respected and clients receive a
      // descriptive error message.  If the hotel exists, merge the
      // provided input into the document and save it.  The updated
      // document is then returned to the caller.
      const hotel = await HotelModel.findById(id);
      if (!hotel) {
        throw new Error('Hotel not found');
      }
      // Merge only provided fields from the input into the existing
      // document.  We iterate over the keys of the input and assign
      // them individually to avoid inadvertently overwriting
      // unmapped subdocuments or arrays.  Mongoose will cast and
      // validate types automatically when saving.
      Object.keys(input).forEach((key) => {
        // @ts-ignore - input is a generic type; dynamic assignment
        hotel[key] = input[key];
      });
      await hotel.save();
      return hotel;
    },

    deleteHotel: async (
      _parent,
      { id }: IdArg,
      _ctx: Context
    ): Promise<boolean> => {
      await HotelModel.findByIdAndUpdate(id, { isActive: false });
      return true;
    },

    createRestaurant: async (
      _parent,
      { input }: MutationArgs<CreateRestaurantInput>,
      _ctx: Context
    ) => {
      const restaurant = new RestaurantModel(input);
      await restaurant.save();
      return restaurant as any;
    },

    updateRestaurant: async (
      _parent,
      { id, input },
      _ctx: Context
    ) => {
      // Perform input validation and calculations for settings-related fields.  We
      // fetch the current restaurant up front so that we can merge nested
      // settings objects rather than overwriting them entirely when updating.
      const restaurant = await RestaurantModel.findById(id);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      if (input.settings) {
        const {
          horaires,
          frequenceCreneauxMinutes,
          maxReservationsParCreneau,
          capaciteTotale,
          tables,
          customTables
        } = input.settings;

        // Validate horaires: ouverture < fermeture
        if (Array.isArray(horaires)) {
          for (const horaire of horaires) {
            if (horaire.ouverture && horaire.fermeture && horaire.ouverture >= horaire.fermeture) {
              throw new GraphQLError("L'heure d'ouverture doit être antérieure à l'heure de fermeture.", {
                //@ts-ignore
                extensions: { code: 'BAD_USER_INPUT', field: 'horaires' },
              });
            }
          }
        }

        // Validate frequenceCreneauxMinutes: positive and divisible by 5
        if (frequenceCreneauxMinutes !== undefined && frequenceCreneauxMinutes !== null) {
          if (frequenceCreneauxMinutes <= 0 || frequenceCreneauxMinutes % 5 !== 0) {
            throw new GraphQLError("La fréquence des créneaux doit être un nombre positif divisible par 5.", {
              //@ts-ignore
              extensions: { code: 'BAD_USER_INPUT', field: 'frequenceCreneauxMinutes' },
            });
          }
        }

        // Calculate capaciteTheorique. Take into account built-in table sizes
        // as well as any custom table sizes provided. Custom tables may allow sizes
        // other than 2,4,6,8.
        let capaciteTheorique = 0;
        if (tables) {
          capaciteTheorique +=
            (tables.size2 || 0) * 2 +
            (tables.size4 || 0) * 4 +
            (tables.size6 || 0) * 6 +
            (tables.size8 || 0) * 8;
        }
        if (customTables) {
          for (const ct of customTables) {
            if (ct && typeof ct.taille === 'number' && typeof ct.nombre === 'number') {
              capaciteTheorique += ct.taille * ct.nombre;
            }
          }
        }
        // Persist the calculated theoretical capacity on settings if any table information provided
        if (tables || customTables) {
          input.settings.capaciteTheorique = capaciteTheorique;
        }

        // Validate maxReservationsParCreneau against capaciteTotale and capaciteTheorique
        if (maxReservationsParCreneau !== undefined && maxReservationsParCreneau !== null) {
          if (capaciteTotale !== undefined && capaciteTotale !== null && maxReservationsParCreneau > capaciteTotale) {
            throw new GraphQLError("La limite par créneau ne peut pas dépasser la capacité totale.", {
              //@ts-ignore
              extensions: { code: 'BAD_USER_INPUT', field: 'maxReservationsParCreneau' },
            });
          }
          // If theoretical capacity has been computed from tables and/or custom tables, validate
          if ((tables || customTables) && maxReservationsParCreneau > capaciteTheorique) {
            throw new GraphQLError("La limite par créneau ne peut pas dépasser la capacité théorique.", {
              //@ts-ignore
              extensions: { code: 'BAD_USER_INPUT', field: 'maxReservationsParCreneau' },
            });
          }
        }
      }

      // Build the update payload.  To avoid wiping out nested objects such as
      // restaurant.settings when only a subset of fields are provided, we
      // perform a shallow merge: existing settings are spread first, then
      // overridden by any provided settings fields.  For other top-level
      // fields we rely on Mongoose's default behavior of replacing the
      // property when defined in input.
      const updateData: any = { ...input };
      if (input.settings) {
        const currentSettings = restaurant.settings ? (restaurant.settings as any).toObject ? (restaurant.settings as any).toObject() : restaurant.settings : {};
        updateData.settings = { ...currentSettings, ...input.settings };
      }
      // Do not merge businessHours here; if provided, it will replace the
      // existing array.  If not provided, the existing businessHours remains.
      return RestaurantModel.findByIdAndUpdate(id, updateData, { new: true });
    },

    deleteRestaurant: async (
      _parent,
      { id }: IdArg,
      _ctx: Context
    ): Promise<boolean> => {
      await RestaurantModel.findByIdAndUpdate(id, { isActive: false });
      return true;
    },

    createSalon: async (
      _parent,
      { input }: MutationArgs<CreateSalonInput>,
      _ctx: Context
    ) => {
      const salon = new SalonModel(input);
      await salon.save();
      return salon as any;
    },

    updateSalon: async (
      _parent,
      { id, input }: MutationUpdateArgs<UpdateSalonInput>,
      _ctx: Context
    ) => {
      return SalonModel.findByIdAndUpdate(id, input, { new: true });
    },

    deleteSalon: async (
      _parent,
      { id }: IdArg,
      _ctx: Context
    ): Promise<boolean> => {
      await SalonModel.findByIdAndUpdate(id, { isActive: false });
      return true;
    },

    /**
     * Approve a pending hotel by setting its isActive flag to true and
     * activating all users associated with the hotel.  If the hotel
     * cannot be found an error is thrown.  Returns the updated hotel.
     */
    approveHotel: async (_parent, { id }: IdArg) => {
      const hotel = await HotelModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!hotel) {
        throw new GraphQLError('Hotel not found.');
      }
      // Activate all users linked to this hotel
      await UserModel.updateMany({ businessId: id, businessType: 'hotel' }, { isActive: true });
      return hotel as any;
    },

    /**
     * Reject a pending hotel by deleting it and deactivating all
     * associated users.  The removed hotel document is returned.  If
     * no hotel is found an error is thrown.
     */
    rejectHotel: async (_parent, { id }: IdArg) => {
      const hotel = await HotelModel.findById(id);
      if (!hotel) {
        throw new GraphQLError('Hotel not found.');
      }
      await HotelModel.findByIdAndDelete(id);
      await UserModel.updateMany(
        { businessId: id, businessType: 'hotel' },
        { isActive: false, businessId: null, businessType: null }
      );
      return hotel as any;
    },

    /**
     * Approve a pending restaurant by setting isActive to true and
     * activating the associated users.
     */
    approveRestaurant: async (_parent, { id }: IdArg) => {
      const restaurant = await RestaurantModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      await UserModel.updateMany({ businessId: id, businessType: 'restaurant' }, { isActive: true });
      return restaurant as any;
    },

    /**
     * Reject a pending restaurant by deleting it and deactivating
     * associated users.
     */
    rejectRestaurant: async (_parent, { id }: IdArg) => {
      const restaurant = await RestaurantModel.findById(id);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      await RestaurantModel.findByIdAndDelete(id);
      await UserModel.updateMany(
        { businessId: id, businessType: 'restaurant' },
        { isActive: false, businessId: null, businessType: null }
      );
      return restaurant as any;
    },

    /**
     * Approve a pending salon by setting isActive to true and activating
     * the associated users.
     */
    approveSalon: async (_parent, { id }: IdArg) => {
      const salon = await SalonModel.findByIdAndUpdate(id, { isActive: true }, { new: true });
      if (!salon) {
        throw new GraphQLError('Salon not found.');
      }
      await UserModel.updateMany({ businessId: id, businessType: 'salon' }, { isActive: true });
      return salon as any;
    },

    /**
     * Reject a pending salon by deleting it and deactivating
     * associated users.
     */
    rejectSalon: async (_parent, { id }: IdArg) => {
      const salon = await SalonModel.findById(id);
      if (!salon) {
        throw new GraphQLError('Salon not found.');
      }
      await SalonModel.findByIdAndDelete(id);
      await UserModel.updateMany(
        { businessId: id, businessType: 'salon' },
        { isActive: false, businessId: null, businessType: null }
      );
      return salon as any;
    },

    createReservationV2: async (
      _parent,
      { input }
    ) => {
      const { restaurantId, ...reservationData } = input;
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      // Normalise the reservation time to HH:mm format.  Accept values with or
      // without leading zeros and ensure a consistent representation in
      // the database.  Use the provided date in ISO format when
      // parsing to avoid timezone issues.
      let normalizedTime = input.heure;
      try {
        normalizedTime = moment.utc(`${input.date}T${input.heure}`).format('HH:mm');
      } catch (err) {
        // Fall back to the original value if parsing fails
        normalizedTime = input.heure;
      }
      // Parse the date string into a Date object using UTC to avoid
      // timezone offsets.
      let parsedDate: Date;
      try {
        parsedDate = moment.utc(input.date, 'YYYY-MM-DD').toDate();
      } catch (err) {
        // Fallback: directly construct a Date from the input string
        parsedDate = new Date(input.date);
      }
      // Before creating the reservation, enforce a per‑slot capacity check.
      try {
        const startOfDay = moment.utc(parsedDate).startOf('day').toDate();
        const endOfDay = moment.utc(parsedDate).endOf('day').toDate();
        const existingCount = await ReservationModel.countDocuments({
          businessId: restaurant._id,
          businessType: 'restaurant',
          date: { $gte: startOfDay, $lt: endOfDay },
          time: normalizedTime,
          status: { $in: ['pending', 'confirmed'] },
        });
        const maxPerSlot = (restaurant.settings as any)?.maxReservationsParCreneau || 1;
        if (existingCount >= maxPerSlot) {
          throw new GraphQLError('Ce créneau est déjà complet.', {
            // @ts-ignore
            extensions: { code: 'TIME_SLOT_FULL' },
          });
        }
      } catch (err) {
        console.error('Error checking existing reservations:', err);
      }
      // Compute the number of guests from the personnes field.  Some clients may
      // pass the party size as a string; ensure that it is a number.
      const partySize = parseInt((input as any).personnes, 10) || input.personnes;
      // Build the reservation document.  Spread the remainder of the input
      // (excluding restaurantId) to preserve additional fields like
      // customerInfo, emplacement, paymentMethod and reservationFileUrl.  We
      // explicitly set the parsed date and normalized time to ensure
      // consistency.
      const reservation = new ReservationModel({
        ...reservationData,
        date: parsedDate,
        businessId: restaurant._id,
        businessType: 'restaurant',
        partySize: partySize,
        time: normalizedTime,
        status: 'pending',
        paymentStatus: 'pending',
        source: 'new-ui',
      });
      // Persist the chosen payment method and any reservation file URL
      // provided by the client.  These fields may be undefined
      // depending on whether the front-end asked for them.
      if (input.paymentMethod) {
        (reservation as any).paymentMethod = input.paymentMethod;
      }
      if (input.reservationFileUrl) {
        (reservation as any).reservationFileUrl = input.reservationFileUrl;
      }
      // Compute a basic total amount for the booking based on the number of guests.
      let pricePerGuest = 75;
      try {
        const horaires = (restaurant.settings as any)?.horaires || [];
        const toMinutes = (t: string) => {
          const [h, m] = t.split(':').map((n) => parseInt(n, 10));
          return h * 60 + m;
        };
        const reservationTimeMinutes = toMinutes(normalizedTime);
        for (const h of horaires) {
          if (h.ouverture && h.fermeture) {
            const start = toMinutes(h.ouverture);
            const end = toMinutes(h.fermeture);
            if (reservationTimeMinutes >= start && reservationTimeMinutes < end) {
              if (typeof h.prix === 'number' && h.prix > 0) {
                pricePerGuest = h.prix;
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error('Error computing price per guest', err);
      }
      const totalAmount = partySize * pricePerGuest;
      reservation.totalAmount = totalAmount;
      await reservation.save();
      return reservation;
    },

    createPrivatisationV2: async (
      _parent,
      { input }
    ) => {
      const { restaurantId, ...privatisationData } = input;
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      // Normalise time and date for privatisations.  Use UTC parsing to avoid
      // discrepancies when comparing against existing reservations.
      let normalizedTime = input.heure;
      try {
        normalizedTime = moment.utc(`${input.date}T${input.heure}`).format('HH:mm');
      } catch (err) {
        normalizedTime = input.heure;
      }
      let parsedDate: Date;
      try {
        parsedDate = moment.utc(input.date, 'YYYY-MM-DD').toDate();
      } catch (err) {
        parsedDate = new Date(input.date);
      }
      // Prevent overlapping privatisation bookings on the same slot.  Only one privatisation
      // (or reservation) can occupy a given time slot.
      try {
        const startOfDay = moment.utc(parsedDate).startOf('day').toDate();
        const endOfDay = moment.utc(parsedDate).endOf('day').toDate();
        const existingCount = await ReservationModel.countDocuments({
          businessId: restaurant._id,
          businessType: 'restaurant',
          date: { $gte: startOfDay, $lt: endOfDay },
          time: normalizedTime,
          status: { $in: ['pending', 'confirmed'] },
        });
        const maxPerSlot = (restaurant.settings as any)?.maxReservationsParCreneau || 1;
        if (existingCount >= maxPerSlot) {
          throw new GraphQLError('Ce créneau est déjà complet.', {
            // @ts-ignore
            extensions: { code: 'TIME_SLOT_FULL' },
          });
        }
      } catch (err) {
        console.error('Error checking existing reservations for privatisation:', err);
      }
      const partySize = parseInt((input as any).personnes, 10) || input.personnes;
      const reservation = new ReservationModel({
        ...privatisationData,
        date: parsedDate,
        businessId: restaurant._id,
        businessType: 'restaurant',
        partySize: partySize,
        time: normalizedTime,
        duration: input.dureeHeures,
        status: 'pending',
        paymentStatus: 'pending',
        source: 'new-ui',
        notes: `Privatisation: ${privatisationData.type} - ${privatisationData.espace}, Menu: ${privatisationData.menu}`,
        specialRequests: `Privatisation event for ${partySize} guests.`,
      });
      // Persist chosen payment method and any attached file URL
      if (input.paymentMethod) {
        (reservation as any).paymentMethod = input.paymentMethod;
      }
      if (input.reservationFileUrl) {
        (reservation as any).reservationFileUrl = input.reservationFileUrl;
      }
      // Compute a default total amount for a privatisation.  Use a higher
      // rate per guest to reflect the premium nature of privatisations.
      const totalAmount = partySize * 100;
      reservation.totalAmount = totalAmount;
      await reservation.save();
      return reservation;
    }
  }
};

