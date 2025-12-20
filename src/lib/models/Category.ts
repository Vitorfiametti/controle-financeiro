import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  type: 'receita' | 'despesa';
  icon?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Tipo é obrigatório'],
      enum: ['receita', 'despesa'],
    },
    icon: {
      type: String,
      default: '💰',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ userId: 1, name: 1, type: 1 });

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);