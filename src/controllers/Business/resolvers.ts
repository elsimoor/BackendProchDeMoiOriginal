// business.resolvers.ts
import { GraphQLError } from 'graphql';
import HotelModel from '../../models/HotelModel';
import RestaurantModel from '../../models/RestaurantModel';
import SalonModel from '../../models/SalonModel';
import ReservationModel from '../../models/ReservationModel';


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
    }
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
      return HotelModel.findByIdAndUpdate(id, input, { new: true });
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
        if (horaires) {
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
        if (frequenceCreneauxMinutes) {
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
        if (maxReservationsParCreneau) {
          if (capaciteTotale !== undefined && maxReservationsParCreneau > capaciteTotale) {
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
      return RestaurantModel.findByIdAndUpdate(id, input, { new: true });
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

    createReservationV2: async (
      _parent,
      { input }
    ) => {
      const { restaurantId, ...reservationData } = input;
      const restaurant = await RestaurantModel.findById(restaurantId);
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.');
      }
      // Construct the reservation document.  Note that totalAmount is
      // computed on the server side rather than passed by the client.
      const partySize = input.personnes;
      const reservation = new ReservationModel({
        ...reservationData,
        businessId: restaurant._id,
        businessType: "restaurant",
        partySize: partySize,
        time: input.heure,
        status: "confirmed",
      });
      // Compute a basic total amount for the booking based on the number of guests.
      // If the restaurant has defined time-based pricing in its settings.horaires,
      // select the applicable price; otherwise default to 75 per guest.
      let pricePerGuest = 75;
      try {
        const horaires = (restaurant.settings as any)?.horaires || [];
        const toMinutes = (t: string) => {
          const [h, m] = t.split(":").map((n) => parseInt(n, 10));
          return h * 60 + m;
        };
        const reservationTimeMinutes = toMinutes(input.heure);
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
      // Automatically create an invoice for the reservation.  Each invoice
      // contains a single line item referencing the reservation ID and its
      // computed total amount.
      try {
        const items = [
          {
            description: `Reservation ${reservation._id.toString()}`,
            price: totalAmount,
            quantity: 1,
            total: totalAmount,
          },
        ];
        const invoice = new (require('../../models/InvoiceModel').default)({
          reservationId: reservation._id,
          businessId: reservation.businessId,
          items,
          total: totalAmount,
        });
        await invoice.save();
      } catch (err) {
        console.error('Failed to create invoice for restaurant reservation', err);
      }
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
      const partySize = input.personnes;
      const reservation = new ReservationModel({
        ...privatisationData,
        businessId: restaurant._id,
        businessType: "restaurant",
        partySize: partySize,
        time: input.heure,
        duration: input.dureeHeures,
        status: "confirmed",
        notes: `Privatisation: ${privatisationData.type} - ${privatisationData.espace}, Menu: ${privatisationData.menu}`,
        specialRequests: `Privatisation event for ${partySize} guests.`
      });
      // Compute a default total amount for a privatisation.  Use a higher
      // rate per guest to reflect the premium nature of privatisations.
      const totalAmount = partySize * 100; // 100 per guest for privatisations
      reservation.totalAmount = totalAmount;
      await reservation.save();
      // Create an invoice for the privatisation.
      try {
        const items = [
          {
            description: `Privatisation ${reservation._id.toString()}`,
            price: totalAmount,
            quantity: 1,
            total: totalAmount,
          },
        ];
        const invoice = new (require('../../models/InvoiceModel').default)({
          reservationId: reservation._id,
          businessId: reservation.businessId,
          items,
          total: totalAmount,
        });
        await invoice.save();
      } catch (err) {
        console.error('Failed to create invoice for privatisation', err);
      }
      return reservation;
    }
  }
};

