import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import InvestmentForm from '@/components/Investment/InvestmentForm';
import InvestmentList from '@/components/Investment/InvestmentList';
import Alert from '@/components/Common/Alert';
import { useInvestments } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

export default function Investimentos() {
  const router = useRouter();
  const { investments, createInvestment, updateInvestment, deleteInvestment, loading } = useInvestments();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<any>(null);

  // Calcular totais
  const totals = useMemo(() => {
    const aplicacoes = investments
      .filter(i => i.tipo === 'aplicacao')
      .reduce((sum, i) => sum + i.valor, 0);
    
    const resgates = investments
      .filter(i => i.tipo === 'resgate')
      .reduce((sum, i) => sum + i.valor, 0);
    
    const rentabilidadeTotal = investments
      .reduce((sum, i) => sum + (i.rentabilidade || 0), 0);
    
    const totalInvestido = aplicacoes - resgates;
    const patrimonioInvestido = totalInvestido + rentabilidadeTotal;
    
    return {
      totalInvestido,
      rentabilidadeTotal,
      patrimonioInvestido,
    };
  }, [investments]);

  const handleSubmit = async (data: any) => {
    try {
      if (editingInvestment) {
        await updateInvestment(editingInvestment._id, data);
        setAlert({ type: 'success', message: '✅ Investimento atualizado com sucesso!' });
        setEditingInvestment(null);
      } else {
        await createInvestment(data);
        setAlert({ type: 'success', message: '✅ Investimento salvo com sucesso!' });
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: `❌ ${error.message || 'Erro ao salvar investimento'}` });
      throw error;
    }
  };

  const handleEdit = (investment: any) => {
    setEditingInvestment(investment);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestment(id);
      setAlert({ type: 'success', message: '✅ Investimento excluído com sucesso!' });
    } catch (error: any) {
      setAlert({ type: 'error', message: `❌ ${error.message || 'Erro ao excluir investimento'}` });
    }
  };

  const handleCancelEdit = () => {
    setEditingInvestment(null);
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

      <div className="space-y-8">
        {/* Cards de Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition transform hover:-translate-y-1">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Total Investido
            </h3>
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(totals.totalInvestido)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl transition transform hover:-translate-y-1">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Rentabilidade Total
            </h3>
            <div className={`text-3xl font-bold ${totals.rentabilidadeTotal >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>
              {formatCurrency(totals.rentabilidadeTotal)}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition transform hover:-translate-y-1">
            <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
              Patrimônio Investido
            </h3>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(totals.patrimonioInvestido)}
            </div>
          </div>
        </div>

        {/* Formulário */}
        <InvestmentForm
          onSubmit={handleSubmit}
          editingInvestment={editingInvestment}
          onCancelEdit={handleCancelEdit}
        />

        {/* Lista de Investimentos */}
        <InvestmentList
          investments={investments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </Layout>
  );
}