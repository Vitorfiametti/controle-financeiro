import mongoose, { models } from 'mongoose';

const FornecedorSchema = new mongoose.Schema({
  // Campo principal
  name: { 
    type: String,
    trim: true,
    required: false // Não obrigatório aqui, validação na API
  },
  // Campo alternativo (compatibilidade)
  nome: {
    type: String,
    trim: true,
    required: false
  },
  category: { 
    type: String,
    trim: true,
    default: ''
  },
  phone: { 
    type: String,
    trim: true,
    default: ''
  },
  email: { 
    type: String,
    trim: true,
    default: ''
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, {
  timestamps: true
});

export default mongoose.models.Fornecedor || mongoose.model('Fornecedor', FornecedorSchema);
