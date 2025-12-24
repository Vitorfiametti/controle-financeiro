import { useMemo } from 'react';
import { ITransaction } from '@/types';

interface ProjecoesFinanceirasProps {
  transactions: ITransaction[];
}

export default function ProjecoesFinanceiras({ transactions }: ProjecoesFinanceirasProps) {
  const projections = useMemo(() => {
    // Calcular últimos 3 meses para média
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    const recentTransactions = transactions.filter(t => new Date(t.date) >= threeMonthsAgo);
    
    const receitas = recentTransactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const despesas = recentTransactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const mesesComDados = 3;
    const mediaReceitas = receitas / mesesComDados;
    const mediaDespesas = despesas / mesesComDados;
    const economiaMedia = mediaReceitas - mediaDespesas;
    
    return {
      mediaReceitas,
      mediaDespesas,
      economiaMedia,
      projecao6Meses: economiaMedia * 6,
      projecao1Ano: economiaMedia * 12,
    };
  }, [transactions]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
          🎯 Projeções Financeiras
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Média Mensal de Receitas */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Média Mensal de Receitas</p>
          <p className="text-2xl font-bold">{formatCurrency(projections.mediaReceitas)}</p>
        </div>

        {/* Média Mensal de Despesas */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Média Mensal de Despesas</p>
          <p className="text-2xl font-bold">{formatCurrency(projections.mediaDespesas)}</p>
        </div>

        {/* Economia Média Mensal */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Economia Média Mensal</p>
          <p className={`text-2xl font-bold ${projections.economiaMedia >= 0 ? 'text-green-300' : 'text-red-300'}`}>
            {formatCurrency(projections.economiaMedia)}
          </p>
        </div>

        {/* Projeção em 6 Meses */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Projeção em 6 Meses</p>
          <p className="text-2xl font-bold">{formatCurrency(projections.projecao6Meses)}</p>
        </div>

        {/* Projeção em 1 Ano */}
        <div className="text-center">
          <p className="text-sm opacity-90 mb-2">Projeção em 1 Ano</p>
          <p className="text-2xl font-bold">{formatCurrency(projections.projecao1Ano)}</p>
        </div>
      </div>

      <div className="mt-4 text-center text-xs opacity-75">
        * Baseado na média dos últimos 3 meses
      </div>
    </div>
  );
}