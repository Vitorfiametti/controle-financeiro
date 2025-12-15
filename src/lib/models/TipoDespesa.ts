import mongoose, { Schema, Model } from 'mongoose';

export interface ITipoDespesa {
  _id?: string;
  userId: string;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TipoDespesaSchema = new Schema<ITipoDespesa>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    nome: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TipoDespesaSchema.index({ userId: 1, nome: 1 }, { unique: true });

const TipoDespesa: Model<ITipoDespesa> = 
  mongoose.models.TipoDespesa || mongoose.model<ITipoDespesa>('TipoDespesa', TipoDespesaSchema);

export default TipoDespesa;