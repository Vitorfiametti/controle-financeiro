import { Transaction } from '@/types';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">
          Nenhuma transação encontrada
        </h3>
        <p className="text-gray-500">
          Use os filtros acima ou adicione uma nova transação na página de Lançamento
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold">📊 Transações ({transactions.length})</h2>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction._id}
            transaction={transaction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}