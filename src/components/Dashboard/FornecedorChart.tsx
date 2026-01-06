import { useMemo } from 'react';
import { ITransaction } from '@/types';

interface FornecedorChartProps {
  transactions: ITransaction[];
  type: 'gasto' | 'recebido';
}

interface Supplier {
  name: string;
  value: number;
}

export default function FornecedorChart({ transactions, type }: FornecedorChartProps) {
  const data = useMemo(() => {
    const transactionType = type === 'gasto' ? 'despesa' : 'receita';
    
    // Filtrar e excluir transações automáticas de investimento
    const filtered = transactions.filter(t => 
      t.type === transactionType && 
      !t.isInvestmentTransfer && 
      !(t as any).observacao?.includes('[AUTO]')
    );
    
    if (filtered.length === 0) {
      return { suppliers: [] as Supplier[], maxValue: 0, totalValue: 0, hasData: false };
    }

    // Agrupar por fornecedor e somar valores
    const grouped = filtered.reduce((acc, t) => {
      let supplierName = 'Sem Fornecedor';
      
      const fornecedor = (t as any).fornecedor;
      
      if (fornecedor) {
        if (typeof fornecedor === 'object') {
          supplierName = fornecedor.name || fornecedor.nome || fornecedor.razaoSocial || 'Sem Nome';
        } else if (typeof fornecedor === 'string') {
          supplierName = `Fornecedor ${fornecedor.substring(0, 8)}`;
        }
      }
      
      const key = String(supplierName);
      
      if (!acc[key]) {
        acc[key] = {
          name: key,
          value: 0
        };
      }
      
      acc[key].value += t.amount;
      
      return acc;
    }, {} as Record<string, Supplier>);
    
    // Converter para array e ordenar
    const allSuppliers = Object.values(grouped).sort((a, b) => b.value - a.value);
    
    // Pegar apenas Top 10 para exibir
    const suppliers = allSuppliers.slice(0, 10);

    const maxValue = Math.max(...suppliers.map(s => s.value));
    
    // Total apenas dos TOP 10 (itens visíveis)
    const totalValue = suppliers.reduce((sum, s) => sum + s.value, 0);

    return { suppliers, maxValue, totalValue, hasData: true };
  }, [transactions, type]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const title = type === 'gasto' ? '📊 Maiores Despesas por Fornecedores' : '📈 Maiores Receitas por Fornecedores';
  const icon = type === 'gasto' ? '💸' : '💰';
  const barColor = type === 'gasto' ? '#ef4444' : '#22c55e'; // Vermelho para despesas, verde para receitas

  if (!data.hasData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {title}
        </h3>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 text-lg">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 flex flex-col h-full">
      <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
        {title}
      </h3>
      
      {/* Container do gráfico com flex-grow para empurrar o rodapé para baixo */}
      <div className="flex-grow">
        {/* Container do gráfico com grid de fundo */}
        <div className="relative h-full">
          {/* Grid de fundo vertical */}
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            <div className="w-px bg-gray-300 h-full"></div>
            <div className="w-px bg-gray-300 h-full"></div>
            <div className="w-px bg-gray-300 h-full"></div>
            <div className="w-px bg-gray-300 h-full"></div>
            <div className="w-px bg-gray-300 h-full"></div>
          </div>
          
          {/* Barras */}
          <div className="relative space-y-4 py-4">
            {(() => {
              // Usar o total dos itens visíveis
              const visibleTotal = data.totalValue;
              
              // Calcular porcentagens com arredondamento
              const percentages = data.suppliers.map(s => ({
                value: (s.value / visibleTotal) * 100,
                rounded: parseFloat(((s.value / visibleTotal) * 100).toFixed(1))
              }));
              
              // Calcular soma das porcentagens arredondadas
              const sumRounded = percentages.reduce((sum, p) => sum + p.rounded, 0);
              
              // Se não fecha em 100%, ajustar o maior valor
              if (Math.abs(sumRounded - 100.0) > 0.01) { // Tolerância para erros de arredondamento
                const difference = parseFloat((100.0 - sumRounded).toFixed(1));
                
                // Encontrar índice do maior valor para ajustar
                let maxIndex = 0;
                let maxValue = percentages[0].value;
                
                percentages.forEach((p, i) => {
                  if (p.value > maxValue) {
                    maxValue = p.value;
                    maxIndex = i;
                  }
                });
                
                // Ajustar o maior valor
                percentages[maxIndex].rounded = parseFloat((percentages[maxIndex].rounded + difference).toFixed(1));
              }
              
              // Debug
              console.log('📊 Porcentagens:', percentages.map(p => p.rounded));
              console.log('📊 Soma:', percentages.reduce((sum, p) => sum + p.rounded, 0));
              
              return data.suppliers.map((supplier, index) => {
                const widthPercentage = (supplier.value / data.maxValue) * 100;
                const actualPercentage = percentages[index].rounded;
                
                return (
                  <div key={`${supplier.name}-${index}`} className="flex items-center gap-4">
                    {/* Rótulo do mês/nome */}
                    <div className="w-32 text-right">
                      <span className="text-sm font-semibold text-gray-700 truncate block" title={supplier.name}>
                        {supplier.name}
                      </span>
                    </div>
                    
                    {/* Barra */}
                    <div className="flex-1 relative">
                      <div 
                        className="h-8 rounded transition-all duration-500 shadow-sm relative flex items-center justify-end pr-2"
                        style={{ 
                          width: `${widthPercentage}%`,
                          backgroundColor: barColor,
                          minWidth: '40px'
                        }}
                      >
                        {/* Porcentagem dentro da barra */}
                        <span className="text-xs font-bold text-white whitespace-nowrap">
                          {actualPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Rodapé fixo na parte inferior */}
      <div className="mt-auto pt-6 space-y-4">
        {/* Escala horizontal inferior */}
        <div className="border-t-2 border-gray-300 pt-4">
          <div className="flex items-center gap-4">
            {/* Espaço para os labels dos fornecedores */}
            <div className="w-32"></div>
            {/* Container da escala alinhado com as barras */}
            <div className="flex-1 flex justify-between items-center text-sm font-semibold text-gray-600">
              <span>0</span>
              <span>{Math.round(data.maxValue * 0.25)}</span>
              <span>{Math.round(data.maxValue * 0.5)}</span>
              <span>{Math.round(data.maxValue * 0.75)}</span>
              <span>{Math.round(data.maxValue)}</span>
            </div>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: barColor }}
            />
            <span className="text-sm font-semibold text-gray-700">
              {type === 'gasto' ? 'Despesas' : 'Receitas'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}