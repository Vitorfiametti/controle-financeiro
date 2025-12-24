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

    // Filtrar apenas despesas
    const filtered = transactions.filter(t => t.type === 'despesa');

    if (filtered.length === 0) {
      return { categories: [], total: 0, hasData: false };
    }

    // Agrupar por categoria usando helper
    const grouped = filtered.reduce((acc, t) => {
      const categoryName = getCategoryName(t.category);
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(grouped)
      .map(([name, value], index) => {
        // Encontrar o ícone da primeira transação com essa categoria
        const transaction = filtered.find(t => getCategoryName(t.category) === name);
        
        return {
          name,
          value,
          icon: transaction ? getCategoryIcon(transaction.category) : '📊',
          color: `hsl(${index * 40}, 70%, 60%)`
        };
      })
      .sort((a, b) => b.value - a.value);

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

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
        {chartData.categories.map((cat, index) => {
          const percentage = ((cat.value / chartData.total) * 100).toFixed(1);
          
          return (
            <div key={index} className="space-y-2">
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