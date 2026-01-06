import { useMemo } from 'react';
import { ITransaction } from '@/types';
import { getCategoryName, getCategoryIcon } from '@/lib/type-helpers';

interface DonutChartProps {
  transactions: ITransaction[];
  type: 'receita' | 'despesa';
  title: string;
  icon: string;
}

export default function DonutChart({ transactions, type, title, icon }: DonutChartProps) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { categories: [], total: 0, hasData: false };
    }

    // Filtrar por tipo (receita ou despesa)
    const filtered = transactions.filter(t => t.type === type);

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
        
        // Cores baseadas no tipo de transação
        let color;
        if (type === 'receita') {
          // Tons de verde mais escuros e vibrantes para receitas
          const hue = 140 - (index * 20); // De verde-água a verde-escuro
          const saturation = 70 + (index * 5); // Mais saturado
          const lightness = 35 + (index * 8); // Mais escuro
          color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        } else {
          // Tons mais contrastantes de vermelho/laranja/rosa para despesas
          const hues = [0, 15, 30, 350, 20]; // Vermelho, laranja-avermelhado, laranja, rosa-avermelhado, laranja-claro
          const hue = hues[index % hues.length];
          const saturation = 75 - (index * 5);
          const lightness = 55 + (index * 3);
          color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        return {
          name,
          value,
          icon: transaction ? getCategoryIcon(transaction.category) : '📊',
          color
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categorias

    const total = categories.reduce((sum, cat) => sum + cat.value, 0);

    return { categories, total, hasData: true };
  }, [transactions, type]);

  if (!chartData.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
        </h3>
        <div className="text-center text-gray-500 py-8">
          {type === 'receita' ? 'Nenhuma receita registrada' : 'Nenhuma despesa registrada'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>{icon}</span>
        <span>Top 5 Categorias de {type === 'receita' ? 'Receitas' : 'Despesas'}</span>
      </h3>

      {/* Gráfico de rosca com visual aprimorado */}
      <div className="flex justify-center mb-6">
        <div className="relative w-56 h-56">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* Definir gradientes e sombras */}
            <defs>
              {chartData.categories.map((cat, index) => (
                <radialGradient key={`gradient-${index}`} id={`gradient-${index}-${type}`}>
                  <stop offset="0%" stopColor={cat.color} stopOpacity="1" />
                  <stop offset="100%" stopColor={cat.color} stopOpacity="0.7" />
                </radialGradient>
              ))}
              <filter id={`shadow-${type}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Desenhar fatias do gráfico */}
            <g transform="translate(100, 100)" filter={`url(#shadow-${type})`}>
              {chartData.categories.length === 1 ? (
                // Caso especial: 100% (círculo completo)
                <>
                  <circle
                    cx="0"
                    cy="0"
                    r="85"
                    fill={`url(#gradient-0-${type})`}
                    stroke="white"
                    strokeWidth="2"
                    className="transition-all hover:opacity-80"
                  />
                  <circle cx="0" cy="0" r="45" fill="white" />
                </>
              ) : (
                // Múltiplas categorias
                chartData.categories.map((cat, index) => {
                  const prevPercentage = chartData.categories
                    .slice(0, index)
                    .reduce((sum, c) => sum + (c.value / chartData.total) * 100, 0);
                  
                  const percentage = (cat.value / chartData.total) * 100;
                  
                  // Calcular ângulos
                  const startAngle = (prevPercentage / 100) * 2 * Math.PI - Math.PI / 2;
                  const endAngle = ((prevPercentage + percentage) / 100) * 2 * Math.PI - Math.PI / 2;
                  
                  // Raios interno e externo
                  const outerRadius = 85;
                  const innerRadius = 45;
                  
                  // Calcular coordenadas das fatias
                  const x1 = Math.cos(startAngle) * outerRadius;
                  const y1 = Math.sin(startAngle) * outerRadius;
                  const x2 = Math.cos(endAngle) * outerRadius;
                  const y2 = Math.sin(endAngle) * outerRadius;
                  const x3 = Math.cos(endAngle) * innerRadius;
                  const y3 = Math.sin(endAngle) * innerRadius;
                  const x4 = Math.cos(startAngle) * innerRadius;
                  const y4 = Math.sin(startAngle) * innerRadius;
                  
                  const largeArcFlag = percentage > 50 ? 1 : 0;
                  
                  const pathData = [
                    `M ${x1} ${y1}`,
                    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `L ${x3} ${y3}`,
                    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                    'Z'
                  ].join(' ');

                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={`url(#gradient-${index}-${type})`}
                      stroke="white"
                      strokeWidth="2"
                      className="transition-all hover:opacity-80"
                    />
                  );
                })
              )}
            </g>

            {/* Círculo branco no centro (só para múltiplas categorias) */}
            {chartData.categories.length > 1 && (
              <circle cx="100" cy="100" r="45" fill="white" />
            )}
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