import { GraphQLError } from 'graphql';
import PrivatisationOptionModel from '../../models/PrivatisationOptionModel';
import RestaurantModel from '../../models/RestaurantModel';

interface Context {
  user?: { id: string };
}

interface IdArg {
  id: string;
}

/**
 * Input type for creating a privatisation option.  Mirrors the
 * GraphQL input definition and includes all optional fields supported
 * by the model.  Additional fields such as `menusDetails`, `tarif`,
 * `conditions` and `fileUrl` are included to allow passing custom
 * group menus, a flat rate, terms and an uploaded document URL.  When
 * not provided, these fields default to undefined and are omitted
 * from the created document.
 */
interface CreatePrivatisationOptionInput {
  nom: string;
  description?: string;
  type: string;
  capaciteMaximale: number;
  dureeMaximaleHeures: number;
  menusDeGroupe?: string[];
  /**
   * Detailed group menus associated with this option.  Each menu can
   * specify a name, optional description and price.  When provided,
   * these entries are stored in the `menusDetails` field of the
   * privatisation option.  If omitted, no detailed menus are
   * recorded.
   */
  menusDetails?: {
    nom: string;
    description?: string;
    prix: number;
  }[];
  /**
   * Global or base rate for the privatisation option.  Can be used to
   * specify a forfait or per-event charge.  Optional.
   */
  tarif?: number;
  /**
   * Terms and conditions applicable to this privatisation option.  Optional.
   */
  conditions?: string;
  /**
   * Optional URL to an uploaded document (e.g. Word file) containing
   * detailed requirements or specifications for this option.
   */
  fileUrl?: string;
  restaurantId: string;
}

/**
 * Input type for updating an existing privatisation option.  All
 * fields are optional to allow partial updates.  Additional fields
 * correspond to those available on creation, enabling modifications
 * of detailed menus, tariff, conditions and associated file URL.
 */
interface UpdatePrivatisationOptionInput {
  nom?: string;
  description?: string;
  type?: string;
  capaciteMaximale?: number;
  dureeMaximaleHeures?: number;
  menusDeGroupe?: string[];
  menusDetails?: {
    nom: string;
    description?: string;
    prix: number;
  }[];
  tarif?: number;
  conditions?: string;
  fileUrl?: string;
}

interface MutationCreateArgs {
  input: CreatePrivatisationOptionInput;
}

interface MutationUpdateArgs {
  id: string;
  input: UpdatePrivatisationOptionInput;
}

export const privatisationResolvers = {
  Query: {
    privatisationOptionsByRestaurant: async (_parent, { restaurantId }) => {
      return PrivatisationOptionModel.find({ restaurantId });
    },
    privatisationOption: async (_parent, { id }: IdArg) => {
      return PrivatisationOptionModel.findById(id);
    },
  },

  Mutation: {
    createPrivatisationOption: async (
      _parent,
      { input }: MutationCreateArgs,
      _ctx: Context
    ) => {
      const { restaurantId, capaciteMaximale, dureeMaximaleHeures } = input;

      const restaurant = await RestaurantModel.findById(restaurantId).select('settings');
      if (!restaurant) {
        throw new GraphQLError('Restaurant not found.', {
          //@ts-ignore
          extensions: { code: 'BAD_USER_INPUT', field: 'restaurantId' },
        });
      }

      const { settings } = restaurant;
      const capaciteTheorique = settings?.capaciteTheorique || 0;
      const frequenceCreneauxMinutes = settings?.frequenceCreneauxMinutes || 30;

      if (capaciteMaximale > capaciteTheorique) {
        throw new GraphQLError(`La capacité maximale ne peut pas dépasser la capacité théorique du restaurant (${capaciteTheorique}).`, {
          //@ts-ignore
          extensions: { code: 'BAD_USER_INPUT', field: 'capaciteMaximale' },
        });
      }

      if ((dureeMaximaleHeures * 60) % frequenceCreneauxMinutes !== 0) {
        throw new GraphQLError(`La durée maximale doit être un multiple de la fréquence des créneaux (${frequenceCreneauxMinutes} minutes).`, {
          //@ts-ignore
          extensions: { code: 'BAD_USER_INPUT', field: 'dureeMaximaleHeures' },
        });
      }

      const newOption = new PrivatisationOptionModel(input);
      await newOption.save();
      return newOption;
    },

    updatePrivatisationOption: async (
      _parent,
      { id, input }: MutationUpdateArgs,
      _ctx: Context
    ) => {
      const option = await PrivatisationOptionModel.findById(id);
      if (!option) {
        throw new GraphQLError('Privatisation option not found.', {
          //@ts-ignore
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const restaurant = await RestaurantModel.findById(option.restaurantId).select('settings');
      if (!restaurant) {
        // This case should ideally not happen if data integrity is maintained
        throw new GraphQLError('Associated restaurant not found.', {
          //@ts-ignore
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }

      const { settings } = restaurant;
      const capaciteTheorique = settings?.capaciteTheorique || 0;
      const frequenceCreneauxMinutes = settings?.frequenceCreneauxMinutes || 30;

      const capaciteMaximale = input.capaciteMaximale ?? option.capaciteMaximale;
      const dureeMaximaleHeures = input.dureeMaximaleHeures ?? option.dureeMaximaleHeures;

      if (capaciteMaximale > capaciteTheorique) {
        throw new GraphQLError(`La capacité maximale ne peut pas dépasser la capacité théorique du restaurant (${capaciteTheorique}).`, {
          //@ts-ignore
          extensions: { code: 'BAD_USER_INPUT', field: 'capaciteMaximale' },
        });
      }

      if ((dureeMaximaleHeures * 60) % frequenceCreneauxMinutes !== 0) {
        throw new GraphQLError(`La durée maximale doit être un multiple de la fréquence des créneaux (${frequenceCreneauxMinutes} minutes).`, {
          //@ts-ignore
          extensions: { code: 'BAD_USER_INPUT', field: 'dureeMaximaleHeures' },
        });
      }

      return PrivatisationOptionModel.findByIdAndUpdate(id, input, { new: true });
    },

    deletePrivatisationOption: async (
      _parent,
      { id }: IdArg,
      _ctx: Context
    ): Promise<boolean> => {
      await PrivatisationOptionModel.findByIdAndDelete(id);
      return true;
    },
  },
};
