import { useState, useEffect, useCallback } from 'react';
import { TipoDespesa } from '@/types';

export function useTiposDespesa() {
  const [tiposDespesa, setTiposDespesa] = useState<TipoDespesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTiposDespesa = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tipos-despesa');
      if (!response.ok) throw new Error('Erro ao carregar tipos de despesa');
      const data = await response.json();
      setTiposDespesa(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTipoDespesa = async (nome: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tipos-despesa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar tipo de despesa');
      }
      const newTipoDespesa = await response.json();
      setTiposDespesa(prev => [...prev, newTipoDespesa].sort((a, b) => a.nome.localeCompare(b.nome)));
      return newTipoDespesa;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTipoDespesa = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tipos-despesa?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao deletar tipo de despesa');
      setTiposDespesa(prev => prev.filter(t => t._id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposDespesa();
  }, [fetchTiposDespesa]);

  return {
    tiposDespesa,
    loading,
    error,
    fetchTiposDespesa,
    createTipoDespesa,
    deleteTipoDespesa,
  };
}