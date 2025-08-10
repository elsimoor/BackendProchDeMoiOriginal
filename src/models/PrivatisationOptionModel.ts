import mongoose, { Schema, Document } from 'mongoose';

// Interface for the document
interface PrivatisationOptionDocument extends Document {
  nom: string;
  description?: string;
  type: string;
  capaciteMaximale: number;
  dureeMaximaleHeures: number;
  menusDeGroupe: string[];
  restaurantId: mongoose.Schema.Types.ObjectId;

  /**
   * Détails des menus de groupe associés à cette option de privatisation. Chaque menu
   * est décrit par un nom, une description et un prix. Cela permet de créer des
   * menus personnalisés avec des tarifs spécifiques.
   */
  menusDetails?: {
    nom: string;
    description?: string;
    prix: number;
  }[];

  /**
   * Tarif global ou tarif de base pour la privatisation, si applicable. Il peut
   * s’agir d’un forfait pour l’ensemble de l’événement.
   */
  tarif?: number;

  /**
   * Conditions générales de réservation ou d’utilisation pour la privatisation.
   */
  conditions?: string;
}

// Schema definition
const privatisationOptionSchema = new Schema<PrivatisationOptionDocument>({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  capaciteMaximale: {
    type: Number,
    required: true
  },
  dureeMaximaleHeures: {
    type: Number,
    required: true
  },
  menusDeGroupe: {
    type: [String],
    default: []
  },
  menusDetails: [
    {
      nom: { type: String, required: true },
      description: { type: String },
      prix: { type: Number, required: true }
    }
  ],
  tarif: {
    type: Number
  },
  conditions: {
    type: String
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  }
}, {
  timestamps: true
});

// Model export
export default mongoose.model<PrivatisationOptionDocument>('PrivatisationOption', privatisationOptionSchema);
