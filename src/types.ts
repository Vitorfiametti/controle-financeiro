// Tipos e interfaces do projeto

export interface ITransaction {
  _id: string;
  userId: string;
  fornecedor: {
    _id: string;
    name?: string;
    nome?: string;
  } | string;
  paymentMethod?: {
    _id: string;
    name: string;
  } | string;
  formaPagamento?: { // Alias para paymentMethod
    _id: string;
    name: string;
  } | string;
  category: {
    _id: string;
    name: string;
    type: 'receita' | 'despesa';
    icon?: string;
  } | string;
  type: 'receita' | 'despesa';
  amount: number;
  date: string;
  description?: string;
  observacao?: string;
  tags?: Tag[] | Array<{ text?: string; name?: string; color: string }>;
  isInvestmentTransfer?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IFornecedor {
  _id: string;
  name?: string;
  nome?: string;
  category?: string;
  phone?: string;
  email?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentMethod {
  _id: string;
  name: string;
  nome?: string; // Alias para compatibilidade
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  nome?: string; // Alias para compatibilidade
  type: 'receita' | 'despesa';
  icon?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Investment {
  _id: string;
  userId: string;
  name: string;
  type: string;
  tipo?: 'aplicacao' | 'resgate'; // Compatibilidade
  categoria?: string;
  instituicao?: string;
  liquidez?: string;
  amount: number;
  valor?: number; // Alias para amount
  currentValue: number;
  rentabilidade?: number;
  profitLoss: number;
  profitLossPercentage: number;
  data?: string; // Data da transação
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'cancelled';
  description?: string;
  observacao?: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  text?: string;
  name?: string;
  color: string;
}

// Aliases para compatibilidade
export type Transaction = ITransaction;
export type FormaPagamento = IPaymentMethod;
export type Fornecedor = IFornecedor;
export type Category = ICategory;
export type TipoDespesa = ICategory;