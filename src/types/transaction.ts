export interface Transaction {
  _id: string;
  userId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'receita' | 'despesa';
  fornecedor: string;
  formaPagamento: string;
  observacao?: string;
  tags?: Tag[];
  isInvestmentTransfer?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  name: string;
  color: string;
}

export interface TransactionFormData {
  fornecedor: string;
  date: string;
  formaPagamento: string;
  tipoLancamento: 'gasto' | 'recebido';
  tipoDespesa: string;
  amount: number;
  observacao?: string;
  tags?: Tag[];
}