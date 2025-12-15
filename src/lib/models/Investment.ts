import mongoose, { Schema, Model } from 'mongoose';

export interface IInvestment {
  _id?: string;
  userId: string;
  tipo: 'aplicacao' | 'resgate';
  categoria: string;
  instituicao: string;
  valor: number;
  rentabilidade: number;
  data: Date;
  observacao?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    tipo: {
      type: String,
      enum: ['aplicacao', 'resgate'],
      required: true,
    },
    categoria: {
      type: String,
      required: true,
    },
    instituicao: {
      type: String,
      required: true,
    },
    valor: {
      type: Number,
      required: true,
    },
    rentabilidade: {
      type: Number,
      default: 0,
    },
    data: {
      type: Date,
      required: true,
    },
    observacao: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Investment: Model<IInvestment> = 
  mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;
