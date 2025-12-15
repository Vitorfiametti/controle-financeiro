import { useState, useEffect, useCallback } from 'react';
import { Investment } from '@/types';

export function useInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar investimentos
  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/investments');
      if (!response.ok) throw new Error('Erro ao carregar investimentos');
      const data = await response.json();
      setInvestments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar investimento
  const createInvestment = async (data: Partial<Investment>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/investments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar investimento');
      }
      const newInvestment = await response.json();
      setInvestments(prev => [newInvestment, ...prev]);
      return newInvestment;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar investimento
  const updateInvestment = async (id: string, data: Partial<Investment>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/investments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });
      if (!response.ok) throw new Error('Erro ao atualizar investimento');
      const updated = await response.json();
      setInvestments(prev =>
        prev.map(i => (i._id === id ? updated : i))
      );
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Deletar investimento
  const deleteInvestment = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/investments?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar investimento');
      setInvestments(prev => prev.filter(i => i._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  return {
    investments,
    loading,
    error,
    fetchInvestments,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  };
}