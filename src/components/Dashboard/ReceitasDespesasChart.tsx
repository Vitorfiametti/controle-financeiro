import { useMemo } from 'react';
import { ITransaction } from '@/lib/models/Transaction';

interface ReceitasDespesasChartProps {
  transactions: ITransaction[];
}

export default function ReceitasDespesasChart({ transactions }: ReceitasDespesasChartProps) {
  const data = useMemo(() => {
    const receitas = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const despesas = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const total = receitas + despesas;
    
    return {
      receitas,
      despesas,
      receitasPercent: total > 0 ? (receitas / total) * 100 : 0,
      despesasPercent: total > 0 ? (despesas / total) * 100 : 0,
    };
  }, [transactions]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📊 Receitas vs Despesas
      </h3>
      
      {/* Gráfico de Barras Horizontal */}
      <div className="space-y-6">
        {/* Receitas */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">💰 Receitas</span>
            <span className="text-sm font-bold text-green-600">
              R$ {data.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
              style={{ width: `${data.receitasPercent}%` }}
            >
              <span className="text-white text-xs font-bold">
                {data.receitasPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Despesas */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">💸 Despesas</span>
            <span className="text-sm font-bold text-red-600">
              R$ {data.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-400 to-red-600 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
              style={{ width: `${data.despesasPercent}%` }}
            >
              <span className="text-white text-xs font-bold">
                {data.despesasPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xs text-gray-600 mb-1">Saldo</p>
            <p className={`text-lg font-bold ${data.receitas - data.despesas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {(data.receitas - data.despesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}