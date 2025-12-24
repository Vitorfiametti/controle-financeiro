import { formatCurrency, formatDate } from '@/lib/utils';
import { Transaction } from '@/types';
import { 
  getFornecedorName, 
  getCategoryName, 
  getPaymentMethodName,
  getTagText,
  getTagColor 
} from '@/lib/type-helpers';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export default function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const isReceita = transaction.type === 'receita';
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Informações principais */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-800">
              {getFornecedorName(transaction.fornecedor)}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isReceita ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isReceita ? '↗ Receita' : '↘ Despesa'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
            <span>📦 {getCategoryName(transaction.category)}</span>
            <span>💳 {getPaymentMethodName(transaction)}</span>
            <span>📅 {formatDate(transaction.date)}</span>
          </div>
          
          {transaction.description && (
            <p className="text-sm text-gray-500 italic mt-2">
              💬 {transaction.description}
            </p>
          )}
          
          {/* Tags */}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {transaction.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  #{getTagText(tag)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Valor e ações */}
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-bold ${
            isReceita ? 'text-green-600' : 'text-red-600'
          }`}>
            {isReceita ? '+' : '-'} {formatCurrency(transaction.amount)}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(transaction)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(transaction._id)}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition-all"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}