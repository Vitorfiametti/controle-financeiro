import { useMemo } from 'react';
import { ITransaction } from '@/types';
import { getCategoryName, getCategoryIcon } from '@/lib/type-helpers';

interface DonutChartProps {
  transactions: ITransaction[];
}

export default function DonutChart({ transactions }: DonutChartProps) {
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
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categorias

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

    return { categories, total, hasData: true };
  }, [transactions]);

  if (!chartData.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          🍩 Top 5 Categorias
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
        🍩 Top 5 Categorias de Despesas
      </h3>

      {/* Gráfico de rosca simplificado */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          {/* Círculo externo */}
          <svg className="w-full h-full transform -rotate-90">
            {chartData.categories.map((cat, index) => {
              const prevPercentage = chartData.categories
                .slice(0, index)
                .reduce((sum, c) => sum + (c.value / chartData.total) * 100, 0);
              
              const percentage = (cat.value / chartData.total) * 100;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -prevPercentage;

              return (
                <circle
                  key={index}
                  cx="96"
                  cy="96"
                  r="80"
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="32"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all"
                />
              );
            })}
          </svg>

          {/* Centro do gráfico */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {chartData.categories.length}
              </div>
              <div className="text-sm text-gray-600">Categorias</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="space-y-2">
        {chartData.categories.map((cat, index) => {
          const percentage = ((cat.value / chartData.total) * 100).toFixed(1);
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">
                  {cat.name}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(cat.value)}
                </div>
                <div className="text-xs text-gray-500">{percentage}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}