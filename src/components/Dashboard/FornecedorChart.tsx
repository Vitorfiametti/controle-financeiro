import { useMemo } from 'react';
import { ITransaction } from '@/types';

interface FornecedorChartProps {
  transactions: ITransaction[];
  type: 'gasto' | 'recebido';
}

export default function FornecedorChart({ transactions, type }: FornecedorChartProps) {
  const data = useMemo(() => {
    const transactionType = type === 'gasto' ? 'despesa' : 'receita';
    const filtered = transactions.filter(t => t.type === transactionType && t.description);
    
    if (filtered.length === 0) {
      return { suppliers: [], maxValue: 0, hasData: false };
    }

    // Agrupar por descrição (como se fosse fornecedor)
    const grouped = filtered.reduce((acc, t) => {
      const name = t.description || 'Sem Descrição';
      if (!acc[name]) {
        acc[name] = 0;
      }
      acc[name] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    const suppliers = Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    const maxValue = Math.max(...suppliers.map(s => s.value));

    return { suppliers, maxValue, hasData: true };
  }, [transactions, type]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const title = type === 'gasto' ? '📊 Maiores Despesas' : '📈 Maiores Receitas';

  if (!data.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Nenhum dado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
      
      <div className="space-y-4">
        {data.suppliers.map((supplier, index) => {
          const widthPercentage = (supplier.value / data.maxValue) * 100;
          const color = type === 'gasto' ? 'bg-red-500' : 'bg-green-500';
          
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate max-w-[60%]">
                  {supplier.name}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {formatCurrency(supplier.value)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className={`${color} h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${widthPercentage}%` }}
                >
                  <span className="text-white text-xs font-semibold">
                    {widthPercentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}