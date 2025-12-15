import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar transações
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) throw new Error('Erro ao carregar transações');
      const data = await response.json();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar transação
  const createTransaction = async (data: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Erro ao criar transação');
      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar transação
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar transação');
      const updated = await response.json();
      setTransactions(prev =>
        prev.map(t => (t._id === id ? updated : t))
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar transação
  const deleteTransaction = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar transação');
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}