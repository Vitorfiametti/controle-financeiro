import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import TransactionForm from '@/components/Transaction/TransactionForm';
import Alert from '@/components/Common/Alert';
import { useTransactions } from '@/hooks';

export default function Lancamento() {
  const router = useRouter();
  const { createTransaction, updateTransaction } = useTransactions();
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Verificar se há transação para editar (vinda do histórico)
  useState(() => {
    if (router.query.edit && typeof router.query.edit === 'string') {
      try {
        const transaction = JSON.parse(decodeURIComponent(router.query.edit));
        setEditingTransaction(transaction);
      } catch (error) {
        console.error('Erro ao carregar transação para edição:', error);
      }
    }
  });

  const handleSubmit = async (data: any) => {
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction._id, data);
        setAlert({ type: 'success', message: '✅ Transação atualizada com sucesso!' });
        setEditingTransaction(null);
      } else {
        await createTransaction(data);
        setAlert({ type: 'success', message: '✅ Transação salva com sucesso!' });
      }
    } catch (error: any) {
      setAlert({ type: 'error', message: `❌ ${error.message || 'Erro ao salvar transação'}` });
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    router.push('/lancamento', undefined, { shallow: true });
  };

  return (
    <Layout>
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        <TransactionForm
          onSubmit={handleSubmit}
          editingTransaction={editingTransaction}
          onCancelEdit={handleCancelEdit}
        />
      </div>
    </Layout>
  );
}