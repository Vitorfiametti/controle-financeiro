import { useMemo } from 'react';
import { ITransaction } from '@/lib/models/Transaction';

interface DonutChartProps {
  transactions: ITransaction[];
  type: 'receita' | 'despesa';
  title: string;
  icon: string;
}

const COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

export default function DonutChart({ transactions, type, title, icon }: DonutChartProps) {
  const chartData = useMemo(() => {
    const filtered = transactions.filter(t => t.type === type);
    const total = filtered.reduce((acc, t) => acc + t.amount, 0);
    
    if (total === 0) {
      return { categories: [], total, hasData: false };
    }

    const grouped = filtered.reduce((acc, t) => {
      const category = t.category || 'Outros';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(grouped)
      .map(([name, value], index) => ({
        name,
        value,
        percentage: (value / total) * 100,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorias

    return { categories, total, hasData: true };
  }, [transactions, type]);

  // Calcular os segmentos do donut
  const segments = useMemo(() => {
    if (!chartData.hasData) return [];
    
    let currentAngle = -90; // Começar do topo
    return chartData.categories.map(cat => {
      const angle = (cat.percentage / 100) * 360;
      const segment = {
        ...cat,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
      };
      currentAngle += angle;
      return segment;
    });
  }, [chartData]);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const createArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  if (!chartData.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h3>
      
      <div className="flex flex-col items-center">
        {/* Donut Chart SVG */}
        <div className="relative w-64 h-64 mb-6">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Círculo de fundo */}
            <circle cx="100" cy="100" r="90" fill="#F3F4F6" />
            
            {/* Segmentos do donut */}
            {segments.map((segment, index) => (
              <g key={index}>
                <path
                  d={`
                    ${createArc(100, 100, 90, segment.startAngle, segment.endAngle)}
                    L 100 100
                    Z
                  `}
                  fill={segment.color}
                  className="transition-opacity hover:opacity-80 cursor-pointer"
                />
              </g>
            ))}
            
            {/* Círculo interno (criar efeito donut) */}
            <circle cx="100" cy="100" r="60" fill="white" />
            
            {/* Texto central */}
            <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-gray-800">
              {chartData.categories.length}
            </text>
            <text x="100" y="110" textAnchor="middle" className="text-xs fill-gray-600">
              categorias
            </text>
          </svg>
        </div>

        {/* Legenda */}
        <div className="w-full space-y-2">
          {chartData.categories.map((cat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-gray-700 truncate">{cat.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {cat.percentage.toFixed(1)}%
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  R$ {cat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}