import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Nome é obrigatório'],
    trim: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.models.PaymentMethod || mongoose.model('PaymentMethod', PaymentMethodSchema);