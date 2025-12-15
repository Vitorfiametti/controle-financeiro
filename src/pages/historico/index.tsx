import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import TransactionList from '@/components/Transaction/TransactionList';
import Alert from '@/components/Common/Alert';
import { useTransactions } from '@/hooks';

export default function Historico() {
  const router = useRouter();
  const { transactions, deleteTransaction, loading } = useTransactions();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Excluir transações automáticas de investimento
      if (t.isInvestmentTransfer || (t.observacao && t.observacao.includes('[AUTO]'))) {
        return false;
      }

      // Filtro de tipo
      if (filterType && t.type !== filterType) return false;

      // Filtro de categoria
      if (filterCategory && t.category !== filterCategory) return false;

      // Filtro de data
      if (dataInicio || dataFim) {
        const transactionDate = new Date(t.date);
        const startDate = dataInicio ? new Date(dataInicio) : null;
        const endDate = dataFim ? new Date(dataFim) : null;

        if (startDate && endDate) {
          return transactionDate >= startDate && transactionDate <= endDate;
        } else if (startDate) {
          return transactionDate >= startDate;
        } else if (endDate) {
          return transactionDate <= endDate;
        }
      }

      return true;
    });
  }, [transactions, dataInicio, dataFim, filterType, filterCategory]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    return Array.from(new Set(transactions.map(t => t.category))).sort();
  }, [transactions]);

  const handleEdit = (transaction: any) => {
    router.push({
      pathname: '/lancamento',
      query: { edit: encodeURIComponent(JSON.stringify(transaction)) },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      setAlert({ type: 'success', message: '✅ Transação excluída com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: `❌ ${error.message || 'Erro ao excluir transação'}` });
    }
  };

  const clearFilters = () => {
    setDataInicio('');
    setDataFim('');
    setFilterType('');
    setFilterCategory('');
  };

  if (loading) {
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
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🔍 Filtros do Histórico
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Início:
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo:
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os tipos</option>
                <option value="receita">Apenas Receitas</option>
                <option value="despesa">Apenas Despesas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoria:
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                🔄 Limpar
              </button>
            </div>
          </div>

          {/* Info sobre filtros ativos */}
          {(dataInicio || dataFim || filterType || filterCategory) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-800 text-sm">
              Exibindo {filteredTransactions.length} de {transactions.filter(t => !t.isInvestmentTransfer).length} transações
            </div>
          )}
        </div>

        {/* Lista de Transações */}
        <TransactionList
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
}