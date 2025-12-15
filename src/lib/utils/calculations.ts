interface TransactionLike {
  type: 'receita' | 'despesa';
  amount: number;
  isInvestmentTransfer?: boolean;
  category?: string;
  fornecedor?: string;
}

interface InvestmentLike {
  tipo: 'aplicacao' | 'resgate';
  valor: number;
  rentabilidade?: number;
}

/**
 * Calcula total de receitas
 */
export function calculateReceitas(transactions: TransactionLike[]): number {
  return transactions
    .filter(t => t.type === 'receita' && !t.isInvestmentTransfer)
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calcula total de despesas
 */
export function calculateDespesas(transactions: TransactionLike[]): number {
  return transactions
    .filter(t => t.type === 'despesa' && !t.isInvestmentTransfer)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

/**
 * Calcula saldo atual (incluindo movimentações automáticas de investimento)
 */
export function calculateSaldoAtual(transactions: TransactionLike[]): number {
  const receitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const despesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return receitas - despesas;
}

/**
 * Calcula totais de investimentos
 */
export function calculateInvestmentTotals(investments: InvestmentLike[]) {
  const aplicacoes = investments
    .filter(i => i.tipo === 'aplicacao')
    .reduce((sum, i) => sum + i.valor, 0);
  
  const resgates = investments
    .filter(i => i.tipo === 'resgate')
    .reduce((sum, i) => sum + i.valor, 0);
  
  const rentabilidadeTotal = investments
    .reduce((sum, i) => sum + (i.rentabilidade || 0), 0);
  
  const saldoInvestido = aplicacoes - resgates;
  const patrimonioInvestido = saldoInvestido + rentabilidadeTotal;
  
  return {
    totalInvestido: saldoInvestido,
    rentabilidadeTotal,
    patrimonioInvestido,
  };
}

/**
 * Calcula patrimônio total (conta + investimentos)
 */
export function calculatePatrimonioTotal(
  transactions: TransactionLike[],
  investments: InvestmentLike[]
): number {
  const saldoConta = calculateSaldoAtual(transactions);
  const { patrimonioInvestido } = calculateInvestmentTotals(investments);
  
  return saldoConta + patrimonioInvestido;
}

/**
 * Agrupa transações por categoria
 */
export function groupByCategory(transactions: TransactionLike[]) {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += Math.abs(transaction.amount);
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Agrupa transações por fornecedor
 */
export function groupByFornecedor(transactions: TransactionLike[]) {
  return transactions.reduce((acc, transaction) => {
    const fornecedor = transaction.fornecedor || 'Sem fornecedor';
    if (!acc[fornecedor]) {
      acc[fornecedor] = 0;
    }
    acc[fornecedor] += Math.abs(transaction.amount);
    return acc;
  }, {} as Record<string, number>);
}