import LandingCardModel from '../../models/LandingCardModel';

interface QueryArgs {
  businessType?: string;
  businessId?: string;
  isFeatured?: boolean;
}

interface MutationCreateArgs {
  input: any;
}

interface MutationUpdateArgs {
  id: string;
  input: any;
}

interface MutationDeleteArgs {
  id: string;
}

export const landingCardResolvers = {
  Query: {
    landingCards: async (_parent: any, { businessType, businessId, isFeatured }: QueryArgs) => {
      const filter: any = {};
      if (businessType) filter.businessType = businessType;
      if (businessId) filter.businessId = businessId;
      // If the client requests only featured cards, filter accordingly.
      if (typeof isFeatured === 'boolean') {
        filter.isFeatured = isFeatured;
      }
      return LandingCardModel.find(filter);
    },

    /**
     * Return the single featured landing card for a business.  This resolver
     * finds the card with isFeatured = true matching the provided
     * businessType and businessId.  Returns null if no such card
     * exists.
     */
    featuredLandingCard: async (_parent: any, { businessType, businessId }) => {
      return LandingCardModel.findOne({ businessType, businessId, isFeatured: true });
    }
  },
  Mutation: {
    createLandingCard: async (_parent: any, { input }: MutationCreateArgs) => {
      const card = new LandingCardModel(input);
      await card.save();
      return card;
    },
    updateLandingCard: async (_parent: any, { id, input }: MutationUpdateArgs) => {
      const card = await LandingCardModel.findByIdAndUpdate(id, input, { new: true });
      return card;
    },
    deleteLandingCard: async (_parent: any, { id }: MutationDeleteArgs) => {
      await LandingCardModel.findByIdAndDelete(id);
      return true;
    },

    /**
     * Set the featured landing card for a business.  This mutation first
     * unsets the isFeatured flag on all other landing cards belonging to
     * the specified business.  Then it sets isFeatured on the selected
     * card and returns the updated card.  If the provided card does not
     * belong to the specified business an error will be thrown.
     */
    setFeaturedLandingCard: async (_parent: any, { id, businessId, businessType }) => {
      // Unset any currently featured cards for this business
      await LandingCardModel.updateMany({ businessId, businessType }, { isFeatured: false });
      // Set the selected card as featured
      const card = await LandingCardModel.findByIdAndUpdate(id, { isFeatured: true }, { new: true });
      return card;
    }
  }
};