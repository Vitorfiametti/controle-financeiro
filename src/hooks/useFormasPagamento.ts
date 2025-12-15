import { useState, useEffect, useCallback } from 'react';
import { FormaPagamento } from '@/types';

export function useFormasPagamento() {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFormasPagamento = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/formas-pagamento');
      if (!response.ok) throw new Error('Erro ao carregar formas de pagamento');
      const data = await response.json();
      setFormasPagamento(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFormaPagamento = async (nome: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/formas-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar forma de pagamento');
      }
      const newFormaPagamento = await response.json();
      setFormasPagamento(prev => [...prev, newFormaPagamento].sort((a, b) => a.nome.localeCompare(b.nome)));
      return newFormaPagamento;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFormaPagamento = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/formas-pagamento?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar forma de pagamento');
      setFormasPagamento(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormasPagamento();
  }, [fetchFormasPagamento]);

  return {
    formasPagamento,
    loading,
    error,
    fetchFormasPagamento,
    createFormaPagamento,
    deleteFormaPagamento,
  };
}