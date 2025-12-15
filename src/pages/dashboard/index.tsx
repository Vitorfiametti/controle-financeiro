import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout/Layout';
import BalanceCards from '@/components/Dashboard/BalanceCards';
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
      if (!t.isInvestmentTransfer) {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dataInicio);
        const endDate = new Date(dataFim);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
      return false;
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
          <div className="spinner border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Cards de Balanço */}
        <BalanceCards
          receitas={receitas}
          despesas={despesas}
          saldo={saldo}
          patrimonio={patrimonio}
        />

        {/* Filtro de Data */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            📅 Filtro por Data
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
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              🔄 Limpar Filtros
            </button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">📊 Total de Transações</h3>
            <p className="text-4xl font-bold">{transactions.filter(t => !t.isInvestmentTransfer).length}</p>
            <p className="text-sm mt-2 opacity-90">Registradas no sistema</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-2">💼 Total de Investimentos</h3>
            <p className="text-4xl font-bold">{investments.length}</p>
            <p className="text-sm mt-2 opacity-90">Operações realizadas</p>
          </div>
        </div>

        {/* Informações sobre período filtrado */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
          <p className="text-blue-800 font-semibold">
            📅 Exibindo dados de <span className="font-bold">{new Date(dataInicio).toLocaleDateString('pt-BR')}</span> até <span className="font-bold">{new Date(dataFim).toLocaleDateString('pt-BR')}</span>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Os valores de <strong>Saldo Atual</strong> e <strong>Patrimônio Total</strong> consideram todas as movimentações
          </p>
        </div>
      </div>
    </Layout>
  );
}