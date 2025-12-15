import mongoose, { Schema, Model } from 'mongoose';

export interface IFornecedor {
  _id?: string;
  userId: string;
  nome: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const FornecedorSchema = new Schema<IFornecedor>(
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

// Índice composto para garantir que não haja fornecedores duplicados por usuário
FornecedorSchema.index({ userId: 1, nome: 1 }, { unique: true });

const Fornecedor: Model<IFornecedor> = 
  mongoose.models.Fornecedor || mongoose.model<IFornecedor>('Fornecedor', FornecedorSchema);

export default Fornecedor;