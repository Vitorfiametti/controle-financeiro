export interface Investment {
  _id: string;
  userId: string;
  tipo: 'aplicacao' | 'resgate';
  categoria: string;
  instituicao: string;
  valor: number;
  rentabilidade: number;
  data: string;
  observacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentFormData {
  tipo: 'aplicacao' | 'resgate';
  categoria: string;
  instituicao: string;
  valor: number;
  rentabilidade: number;
  data: string;
  observacao?: string;
}