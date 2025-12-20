import { useState, useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import BalanceCards from '@/components/Dashboard/BalanceCards';
import EvolucaoPatrimonial from '@/components/Dashboard/EvolucaoPatrimonial';
import ProjecoesFinanceiras from '@/components/Dashboard/ProjecoesFinanceiras';
import DonutChart from '@/components/Dashboard/DonutChart';
import ReceitasDespesasChart from '@/components/Dashboard/ReceitasDespesasChart';
import FornecedorChart from '@/components/Dashboard/FornecedorChart';
import { useTransactions, useInvestments } from '@/hooks';
import {
  calculateReceitas,
  calculateDespesas,
  calculateSaldoAtual,
  calculatePatrimonioTotal,
  getFirstDayOfMonth,
  getLastDayOfMonth,
} from '@/lib/utils';
import { ITransaction } from '@/lib/models/Transaction';

export default function Dashboard() {
  const { transactions, loading: loadingTransactions } = useTransactions();
  const { investments, loading: loadingInvestments } = useInvestments();
  
  const [dataInicio, setDataInicio] = useState(getFirstDayOfMonth());
  const [dataFim, setDataFim] = useState(getLastDayOfMonth());

  // Converter para ITransaction[]
  const iTransactions = useMemo(() => {
    return transactions.map(t => ({
      ...t,
      date: new Date(t.date),
    })) as unknown as ITransaction[];
  }, [transactions]);

  const iInvestments = useMemo(() => {
    return investments.map(i => ({
      ...i,
      data: new Date(i.data),
    }));
  }, [investments]);

  // Filtrar transações por data
  const filteredTransactions = useMemo(() => {
    return iTransactions.filter(t => {
      if (t.isInvestmentTransfer) return false;
      
      const transactionDate = new Date(t.date);
      const startDate = new Date(dataInicio);
      const endDate = new Date(dataFim);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [iTransactions, dataInicio, dataFim]);

  // Calcular valores
  const receitas = useMemo(() => calculateReceitas(filteredTransactions), [filteredTransactions]);
  const despesas = useMemo(() => calculateDespesas(filteredTransactions), [filteredTransactions]);
  const saldo = useMemo(() => calculateSaldoAtual(iTransactions), [iTransactions]);
  const patrimonio = useMemo(() => calculatePatrimonioTotal(iTransactions, iInvestments as any), [iTransactions, iInvestments]);

  const clearFilters = () => {
    setDataInicio(getFirstDayOfMonth());
    setDataFim(getLastDayOfMonth());
  };

  if (loadingTransactions || loadingInvestments) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cards de Balanço */}
        <BalanceCards
          receitas={receitas}
          despesas={despesas}
          saldo={saldo}
          patrimonio={patrimonio}
        />

        {/* Filtro de Data */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <span>📅</span>
            <span>Filtro por Data</span>
          </h3>
          <div className="flex flex-wrap gap-4 justify-center items-end">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Início:
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Fim:
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={clearFilters}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-semibold flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Limpar Filtros</span>
            </button>
          </div>
        </div>

        {/* Evolução Patrimonial */}
        <EvolucaoPatrimonial 
          transactions={iTransactions} 
          investments={iInvestments}
        />

        {/* Projeções Financeiras */}
        <ProjecoesFinanceiras transactions={iTransactions} />

        {/* Gráficos de Pizza - Receitas e Despesas por Categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DonutChart 
            transactions={filteredTransactions}
            type="receita"
            title="Receitas por Categoria"
            icon="💰"
          />
          <DonutChart 
            transactions={filteredTransactions}
            type="despesa"
            title="Despesas por Categoria"
            icon="💸"
          />
          <ReceitasDespesasChart transactions={filteredTransactions} />
        </div>

        {/* Gráficos de Maiores Transações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FornecedorChart transactions={filteredTransactions} type="gasto" />
          <FornecedorChart transactions={filteredTransactions} type="recebido" />
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span>📊</span>
              <span>Total de Transações</span>
            </h3>
            <p className="text-4xl font-bold">{transactions.filter(t => !t.isInvestmentTransfer).length}</p>
            <p className="text-sm mt-2 opacity-90">Registradas no sistema</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <span>💼</span>
              <span>Total de Investimentos</span>
            </h3>
            <p className="text-4xl font-bold">{investments.length}</p>
            <p className="text-sm mt-2 opacity-90">Operações realizadas</p>
          </div>
        </div>

        {/* Informações sobre período filtrado */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-semibold flex items-center justify-center gap-2 flex-wrap">
            <span>📅</span>
            <span>Exibindo dados de</span>
            <span className="font-bold">{new Date(dataInicio).toLocaleDateString('pt-BR')}</span>
            <span>até</span>
            <span className="font-bold">{new Date(dataFim).toLocaleDateString('pt-BR')}</span>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Os valores de <strong>Saldo Atual</strong> e <strong>Patrimônio Total</strong> consideram todas as movimentações
          </p>
        </div>
      </div>
    </Layout>
  );
}