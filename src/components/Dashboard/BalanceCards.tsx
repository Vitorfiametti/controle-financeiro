import { formatCurrency } from '@/lib/utils';

interface BalanceCardsProps {
  receitas: number;
  despesas: number;
  saldo: number;
  patrimonio: number;
}

export default function BalanceCards({ receitas, despesas, saldo, patrimonio }: BalanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card Receitas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition transform hover:-translate-y-1">
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
          Total de Receitas
        </h3>
        <div className="text-3xl font-bold text-green-600">
          {formatCurrency(receitas)}
        </div>
      </div>

      {/* Card Despesas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition transform hover:-translate-y-1">
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
          Total de Despesas
        </h3>
        <div className="text-3xl font-bold text-red-600">
          {formatCurrency(despesas)}
        </div>
      </div>

      {/* Card Saldo */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition transform hover:-translate-y-1">
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
          Saldo Atual
        </h3>
        <div className={`text-3xl font-bold ${saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {formatCurrency(saldo)}
        </div>
      </div>

      {/* Card Patrimônio */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition transform hover:-translate-y-1">
        <h3 className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
          Patrimônio Total
        </h3>
        <div className="text-3xl font-bold text-purple-600">
          {formatCurrency(patrimonio)}
        </div>
        <p className="text-xs text-gray-500 mt-2">Conta + Investimentos</p>
      </div>
    </div>
  );
}