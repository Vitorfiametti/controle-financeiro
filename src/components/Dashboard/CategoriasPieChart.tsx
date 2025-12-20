import { useMemo } from 'react';
import { ITransaction } from '@/lib/models/Transaction';

interface CategoriasPieChartProps {
  transactions: ITransaction[];
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export default function CategoriasPieChart({ transactions }: CategoriasPieChartProps) {
  const categoryData = useMemo(() => {
    const despesas = transactions.filter(t => t.type === 'despesa');
    const total = despesas.reduce((acc, t) => acc + t.amount, 0);
    
    const groupedByCategory = despesas.reduce((acc, t) => {
      const category = t.category || 'Outros';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    const data: CategoryData[] = Object.entries(groupedByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: COLORS[index % COLORS.length],
        percentage: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 categorias

    return { data, total };
  }, [transactions]);

  if (categoryData.data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🎯 Despesas por Categoria
        </h3>
        <p className="text-center text-gray-500 py-8">
          Nenhuma despesa registrada no período
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎯 Despesas por Categoria
      </h3>
      
      {/* Lista de Categorias com Barras */}
      <div className="space-y-4">
        {categoryData.data.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm font-semibold text-gray-700">
                  {category.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-800">
                R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color 
                }}
              />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">
                {category.percentage.toFixed(1)}% do total
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">Total de Despesas:</span>
          <span className="text-lg font-bold text-red-600">
            R$ {categoryData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}