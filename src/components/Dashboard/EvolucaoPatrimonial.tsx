import { useMemo, useState } from 'react';
import { ITransaction } from '@/types';

interface EvolucaoPatrimonialProps {
  transactions: ITransaction[];
  investments: any[];
}

type Period = '6meses' | '1ano' | 'tudo';

export default function EvolucaoPatrimonial({ transactions, investments }: EvolucaoPatrimonialProps) {
  const [period, setPeriod] = useState<Period>('6meses');

  const chartData = useMemo(() => {
    // Ordenar transações por data
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular evolução mês a mês
    const monthlyData = new Map<string, { saldo: number; investimentos: number; patrimonio: number }>();
    
    let saldoAcumulado = 0;
    let investimentosAcumulados = 0;

    sortedTransactions.forEach(t => {
      const monthKey = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (t.type === 'receita') {
        saldoAcumulado += t.amount;
      } else if (t.type === 'despesa') {
        saldoAcumulado -= t.amount;
      }

      if (t.isInvestmentTransfer) {
        investimentosAcumulados += t.amount;
      }

      monthlyData.set(monthKey, {
        saldo: saldoAcumulado,
        investimentos: investimentosAcumulados,
        patrimonio: saldoAcumulado + investimentosAcumulados,
      });
    });

    const dataArray = Array.from(monthlyData.entries()).map(([month, values]) => ({
      month,
      ...values,
    }));

    // Filtrar por período
    const now = new Date();
    let filtered = dataArray;
    
    if (period === '6meses') {
      filtered = dataArray.slice(-6);
    } else if (period === '1ano') {
      filtered = dataArray.slice(-12);
    }

    // Calcular valores máximo e mínimo para escala
    const allValues = filtered.flatMap(d => [d.saldo, d.investimentos, d.patrimonio]);
    const maxValue = Math.max(...allValues, 0);
    const minValue = Math.min(...allValues, 0);

    return { data: filtered, maxValue, minValue };
  }, [transactions, investments, period]);

  const getYPosition = (value: number) => {
    const { maxValue, minValue } = chartData;
    const range = maxValue - minValue || 1;
    return ((maxValue - value) / range) * 100;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          📈 Evolução Patrimonial
        </h3>
        
        {/* Botões de período */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('6meses')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              period === '6meses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setPeriod('1ano')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              period === '1ano'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1 Ano
          </button>
          <button
            onClick={() => setPeriod('tudo')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              period === 'tudo'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-500"></div>
          <span className="text-sm text-gray-600">Saldo em Conta</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-yellow-500"></div>
          <span className="text-sm text-gray-600">Investimentos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-purple-500"></div>
          <span className="text-sm text-gray-600">Patrimônio Total</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="relative h-80 border-l-2 border-b-2 border-gray-300">
        {/* Grid horizontal */}
        {[0, 25, 50, 75, 100].map((y) => (
          <div
            key={y}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: `${y}%` }}
          >
            <span className="absolute -left-16 -top-2 text-xs text-gray-500">
              R$ {((chartData.maxValue * (100 - y)) / 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
          </div>
        ))}

        {/* Área do gráfico */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
            </linearGradient>
            <linearGradient id="gradYellow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(234, 179, 8, 0.3)" />
              <stop offset="100%" stopColor="rgba(234, 179, 8, 0.05)" />
            </linearGradient>
            <linearGradient id="gradPurple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.05)" />
            </linearGradient>
          </defs>

          {/* Saldo em Conta */}
          {chartData.data.length > 0 && (
            <>
              <polygon
                points={`
                  0,100 
                  ${chartData.data.map((d, i) => 
                    `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.saldo)}`
                  ).join(' ')} 
                  100,100
                `}
                fill="url(#gradBlue)"
              />
              <polyline
                points={chartData.data.map((d, i) => 
                  `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.saldo)}`
                ).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
            </>
          )}

          {/* Investimentos */}
          {chartData.data.length > 0 && (
            <>
              <polygon
                points={`
                  0,100 
                  ${chartData.data.map((d, i) => 
                    `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.investimentos)}`
                  ).join(' ')} 
                  100,100
                `}
                fill="url(#gradYellow)"
              />
              <polyline
                points={chartData.data.map((d, i) => 
                  `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.investimentos)}`
                ).join(' ')}
                fill="none"
                stroke="#EAB308"
                strokeWidth="3"
              />
            </>
          )}

          {/* Patrimônio Total */}
          {chartData.data.length > 0 && (
            <>
              <polygon
                points={`
                  0,100 
                  ${chartData.data.map((d, i) => 
                    `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.patrimonio)}`
                  ).join(' ')} 
                  100,100
                `}
                fill="url(#gradPurple)"
              />
              <polyline
                points={chartData.data.map((d, i) => 
                  `${(i / (chartData.data.length - 1 || 1)) * 100},${getYPosition(d.patrimonio)}`
                ).join(' ')}
                fill="none"
                stroke="#A855F7"
                strokeWidth="3"
              />
              {/* Pontos no patrimônio */}
              {chartData.data.map((d, i) => (
                <circle
                  key={i}
                  cx={`${(i / (chartData.data.length - 1 || 1)) * 100}%`}
                  cy={`${getYPosition(d.patrimonio)}%`}
                  r="4"
                  fill="#A855F7"
                />
              ))}
            </>
          )}
        </svg>

        {/* Labels do eixo X */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-2">
          {chartData.data.map((d, i) => (
            <span key={i} className="text-xs text-gray-600">
              {d.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}