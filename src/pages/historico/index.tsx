import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout/Layout';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

interface Tag {
  text?: string;
  name?: string;
  color: string;
}

interface Transaction {
  _id: string;
  fornecedor: {
    _id: string;
    name?: string;
    nome?: string;
  };
  paymentMethod: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
    type: string;
    icon: string;
  };
  type: 'receita' | 'despesa';
  amount: number;
  date: string;
  description: string;
  tags?: Tag[];
  isInvestmentTransfer?: boolean;
  observacao?: string;
}

export default function Historico() {
  const router = useRouter();
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadTransactions();
  }, [session]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Transações:', data);
        setTransactions(data);
      } else {
        toast.error('❌ Erro ao carregar transações');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Obter todas as tags únicas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach(t => {
      if (t.tags && t.tags.length > 0) {
        t.tags.forEach(tag => {
          const tagText = tag.text || tag.name || '';
          if (tagText) tagSet.add(tagText.toLowerCase());
        });
      }
    });
    return Array.from(tagSet).sort();
  }, [transactions]);

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
      if (filterCategory && t.category?.name !== filterCategory) return false;

      // Filtro de tag
      if (filterTag) {
        const hasTags = t.tags && t.tags.length > 0;
        if (!hasTags) return false;
        
        const hasMatchingTag = t.tags!.some(tag => {
          const tagText = (tag.text || tag.name || '').toLowerCase();
          return tagText === filterTag.toLowerCase();
        });
        
        if (!hasMatchingTag) return false;
      }

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
  }, [transactions, dataInicio, dataFim, filterType, filterCategory, filterTag]);

  // Obter categorias únicas
  const categories = useMemo(() => {
    const cats = transactions
      .filter(t => t.category?.name)
      .map(t => t.category.name);
    return Array.from(new Set(cats)).sort();
  }, [transactions]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }

    try {
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast.success('✅ Transação excluída!');
        loadTransactions();
      } else {
        toast.error('❌ Erro ao excluir');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao excluir');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    // Redirecionar para página de lançamento com ID da transação
    router.push(`/lancamento?edit=${transaction._id}`);
  };

  const clearFilters = () => {
    setDataInicio('');
    setDataFim('');
    setFilterType('');
    setFilterCategory('');
    setFilterTag('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalReceitas = filteredTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = filteredTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldo = totalReceitas - totalDespesas;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Histórico - ContaFy</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-semibold mb-1">Total Receitas</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalReceitas)}</p>
                </div>
                <div className="text-5xl opacity-20">💰</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-semibold mb-1">Total Despesas</p>
                  <p className="text-3xl font-bold">{formatCurrency(totalDespesas)}</p>
                </div>
                <div className="text-5xl opacity-20">💸</div>
              </div>
            </div>

            <div className={`bg-gradient-to-br ${saldo >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-2xl shadow-xl p-6 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-semibold mb-1">Saldo</p>
                  <p className="text-3xl font-bold">{formatCurrency(saldo)}</p>
                </div>
                <div className="text-5xl opacity-20">{saldo >= 0 ? '✅' : '⚠️'}</div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🔍 Filtros do Histórico
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Tag:
                </label>
                <select
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
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
            {(dataInicio || dataFim || filterType || filterCategory || filterTag) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-800 text-sm">
                Exibindo {filteredTransactions.length} de {transactions.filter(t => !t.isInvestmentTransfer).length} transações
                {filterTag && ` com tag #${filterTag}`}
              </div>
            )}
          </div>

          {/* Lista de Transações */}
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                {filterType || filterCategory || filterTag || dataInicio || dataFim
                  ? 'Tente ajustar os filtros para ver mais resultados.'
                  : 'Comece criando sua primeira transação!'
                }
              </p>
              <button
                onClick={() => router.push('/lancamento')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-lg"
              >
                ➕ Nova Transação
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Informações principais */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-4xl">
                        {transaction.category?.icon || '💰'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {transaction.fornecedor?.name || transaction.fornecedor?.nome || 'Sem fornecedor'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            transaction.type === 'receita'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {transaction.type === 'receita' ? '↗ Receita' : '↘ Despesa'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                          <span>📂 {transaction.category?.name || 'Sem categoria'}</span>
                          <span>💳 {transaction.paymentMethod?.name || 'Sem pagamento'}</span>
                          <span>📅 {formatDate(transaction.date)}</span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-2">
                            💬 {transaction.description}
                          </p>
                        )}
                        {/* Tags com cores */}
                        {transaction.tags && transaction.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {transaction.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                                style={{ backgroundColor: tag.color || '#3b82f6' }}
                              >
                                #{tag.text || tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Valor e ações */}
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        transaction.type === 'receita' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'receita' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-all"
                          title="Editar transação"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(transaction._id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition-all"
                          title="Excluir transação"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}