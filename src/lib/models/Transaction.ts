import mongoose, { Schema, Model } from 'mongoose';

export interface ITag {
  name: string;
  color: string;
}

export interface ITransaction {
  _id?: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  type: 'receita' | 'despesa';
  fornecedor: string;
  formaPagamento: string;
  observacao?: string;
  tags?: ITag[];
  isInvestmentTransfer?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['receita', 'despesa'],
      required: true,
    },
    fornecedor: {
      type: String,
      required: true,
    },
    formaPagamento: {
      type: String,
      required: true,
    },
    observacao: {
      type: String,
    },
    tags: [{
      name: String,
      color: String,
    }],
    isInvestmentTransfer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction: Model<ITransaction> = 
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
