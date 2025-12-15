import mongoose, { Schema, Model } from 'mongoose';

export interface IFormaPagamento {
  _id?: string;
  userId: string;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FormaPagamentoSchema = new Schema<IFormaPagamento>(
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

FormaPagamentoSchema.index({ userId: 1, nome: 1 }, { unique: true });

const FormaPagamento: Model<IFormaPagamento> = 
  mongoose.models.FormaPagamento || mongoose.model<IFormaPagamento>('FormaPagamento', FormaPagamentoSchema);

export default FormaPagamento;