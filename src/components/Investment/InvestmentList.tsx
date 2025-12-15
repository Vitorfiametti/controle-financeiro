import { Investment } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvestmentListProps {
  investments: Investment[];
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export default function InvestmentList({ investments, onEdit, onDelete }: InvestmentListProps) {
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      onDelete(id);
    }
  };

  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">💼</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          Nenhum investimento registrado
        </h3>
        <p className="text-gray-500">
          Comece a registrar seus investimentos acima!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-700 to-purple-800 text-white p-6">
        <h2 className="text-2xl font-bold">📜 Histórico de Investimentos ({investments.length})</h2>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {investments.map((investment) => {
          const isAplicacao = investment.tipo === 'aplicacao';
          const tipoLabel = isAplicacao ? '📈 Aplicação' : '💵 Resgate';
          const tipoColor = isAplicacao ? 'text-green-600' : 'text-blue-600';

          return (
            <div
              key={investment._id}
              className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-200 hover:bg-gray-50 transition ${
                isAplicacao ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'
              }`}
            >
              <div className="flex-1 mb-4 md:mb-0">
                <div className="font-semibold text-lg text-gray-800 mb-2">
                  {tipoLabel} - {investment.categoria}
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                  <span>🏦 {investment.instituicao}</span>
                  {investment.rentabilidade !== 0 && (
                    <span className={investment.rentabilidade > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      📈 Rendimento: {formatCurrency(investment.rentabilidade)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  📅 {formatDate(investment.data)}
                </div>
                {investment.observacao && (
                  <div className="text-sm text-gray-500 italic mt-2">
                    💬 {investment.observacao}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${tipoColor}`}>
                  {isAplicacao ? '+' : '-'}{formatCurrency(investment.valor)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(investment)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(investment._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}