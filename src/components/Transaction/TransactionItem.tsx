import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction } from '@/types';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isReceita = transaction.type === 'receita';

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      onDelete(transaction._id);
    }
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-200 hover:bg-gray-50 transition">
      <div className="flex-1 mb-4 md:mb-0">
        <div className="font-semibold text-lg text-gray-800 mb-2">
          {transaction.description}
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
          <span>📦 {transaction.category}</span>
          <span>🏪 {transaction.fornecedor}</span>
          <span>💳 {transaction.formaPagamento}</span>
        </div>
        <div className="text-sm text-gray-500">
          📅 {formatDate(transaction.date)}
        </div>
        {transaction.observacao && (
          <div className="text-sm text-gray-500 italic mt-2">
            💬 {transaction.observacao}
          </div>
        )}
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {transaction.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full text-white text-xs font-semibold"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className={`text-2xl font-bold ${isReceita ? 'text-green-600' : 'text-red-600'}`}>
          {isReceita ? '+' : ''}{formatCurrency(transaction.amount)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(transaction)}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  );
}