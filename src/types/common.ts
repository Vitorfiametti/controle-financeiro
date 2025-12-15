export interface Fornecedor {
  _id: string;
  userId: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormaPagamento {
  _id: string;
  userId: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface TipoDespesa {
  _id: string;
  userId: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}