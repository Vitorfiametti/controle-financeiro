import { useState, useEffect, useCallback } from 'react';
import { Fornecedor } from '@/types';

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFornecedores = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fornecedores');
      if (!response.ok) throw new Error('Erro ao carregar fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFornecedor = async (nome: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar fornecedor');
      }
      const newFornecedor = await response.json();
      setFornecedores(prev => [...prev, newFornecedor].sort((a, b) => a.nome.localeCompare(b.nome)));
      return newFornecedor;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFornecedor = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/fornecedores?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar fornecedor');
      setFornecedores(prev => prev.filter(f => f._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  return {
    fornecedores,
    loading,
    error,
    fetchFornecedores,
    createFornecedor,
    deleteFornecedor,
  };
}