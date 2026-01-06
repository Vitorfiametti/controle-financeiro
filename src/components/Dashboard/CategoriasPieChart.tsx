import { useMemo } from 'react';
import { ITransaction } from '@/types';
import { getCategoryName, getCategoryIcon } from '@/lib/type-helpers';

interface CategoriasPieChartProps {
  transactions: ITransaction[];
}

export default function CategoriasPieChart({ transactions }: CategoriasPieChartProps) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { categories: [], total: 0, hasData: false };
    }

    // Filtrar apenas despesas E excluir transações automáticas de investimento
    const filtered = transactions.filter(t => 
      t.type === 'despesa' && 
      !t.isInvestmentTransfer && 
      !(t as any).observacao?.includes('[AUTO]')
    );

    if (filtered.length === 0) {
      return { categories: [], total: 0, hasData: false };
    }

    // Agrupar por categoria usando helper (normalizar nome)
    const grouped = filtered.reduce((acc, t) => {
      const categoryName = getCategoryName(t.category).trim().toLowerCase(); // Normalizar
      if (!acc[categoryName]) {
        acc[categoryName] = {
          displayName: getCategoryName(t.category), // Nome original para display
          value: 0,
          icon: getCategoryIcon(t.category)
        };
      }
      acc[categoryName].value += t.amount;
      return acc;
    }, {} as Record<string, { displayName: string; value: number; icon: string }>);

    const categories = Object.entries(grouped)
      .map(([key, data], index) => ({
        name: data.displayName,
        value: data.value,
        icon: data.icon,
        color: `hsl(${index * 45}, 70%, 55%)` // Melhor distribuição de cores
      }))
      .sort((a, b) => b.value - a.value);

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

    console.log('📊 Categorias agrupadas:', categories); // Debug

    return { categories, total, hasData: true };
  }, [transactions]);

  if (!chartData.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📊 Despesas por Categoria
        </h3>
        <div className="text-center text-gray-500 py-8">
          Nenhuma despesa registrada
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        📊 Despesas por Categoria
      </h3>
      
      <div className="space-y-3">
        {chartData.categories.map((cat) => {
          const percentage = ((cat.value / chartData.total) * 100).toFixed(1);
          
          return (
            <div key={cat.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="font-semibold text-gray-700">{cat.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-800">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(cat.value)}
                  </div>
                  <div className="text-sm text-gray-500">{percentage}%</div>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: cat.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-800">Total:</span>
          <span className="font-bold text-xl text-red-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(chartData.total)}
          </span>
        </div>
      </div>
    </div>
  );
}