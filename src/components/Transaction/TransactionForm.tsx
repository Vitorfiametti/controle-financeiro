import { useState, useEffect } from 'react';
import { useFornecedores, useFormasPagamento, useTiposDespesa } from '@/hooks';
import { Tag } from '@/types';
import Modal from '../Common/Modal';

interface TransactionFormProps {
  onSubmit: (data: any) => Promise<void>;
  editingTransaction?: any;
  onCancelEdit?: () => void;
}

export default function TransactionForm({ onSubmit, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const { fornecedores, createFornecedor } = useFornecedores();
  const { formasPagamento, createFormaPagamento } = useFormasPagamento();
  const { tiposDespesa, createTipoDespesa } = useTiposDespesa();

  const [fornecedor, setFornecedor] = useState('');
  const [date, setDate] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('');
  const [tipoLancamento, setTipoLancamento] = useState<'gasto' | 'recebido' | ''>('');
  const [tipoDespesa, setTipoDespesa] = useState('');
  const [amount, setAmount] = useState('');
  const [observacao, setObservacao] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState('#007bff');
  const [loading, setLoading] = useState(false);

  // Modais
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showFormaPagamentoModal, setShowFormaPagamentoModal] = useState(false);
  const [showTipoDespesaModal, setShowTipoDespesaModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  // Carregar dados de edição
  useEffect(() => {
    if (editingTransaction) {
      setFornecedor(editingTransaction.fornecedor);
      setDate(editingTransaction.date);
      setFormaPagamento(editingTransaction.formaPagamento);
      setTipoLancamento(editingTransaction.type === 'receita' ? 'recebido' : 'gasto');
      setTipoDespesa(editingTransaction.category);
      setAmount(Math.abs(editingTransaction.amount).toString());
      setObservacao(editingTransaction.observacao || '');
      setTags(editingTransaction.tags || []);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingTransaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fornecedor || !date || !formaPagamento || !tipoLancamento || !tipoDespesa || !amount) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);
    try {
      const transactionType = tipoLancamento === 'gasto' ? 'despesa' : 'receita';
      const transactionAmount = transactionType === 'receita' ? parseFloat(amount) : -parseFloat(amount);

      await onSubmit({
        description: `${tipoDespesa} - ${fornecedor}`,
        amount: transactionAmount,
        category: tipoDespesa,
        date,
        type: transactionType,
        fornecedor,
        formaPagamento,
        observacao,
        tags: tags.length > 0 ? tags : undefined,
      });

      // Limpar formulário se não estiver editando
      if (!editingTransaction) {
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFornecedor('');
    setDate(new Date().toISOString().split('T')[0]);
    setFormaPagamento('');
    setTipoLancamento('');
    setTipoDespesa('');
    setAmount('');
    setObservacao('');
    setTags([]);
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    if (tags.some(t => t.name.toLowerCase() === tagInput.toLowerCase())) {
      alert('Esta tag já foi adicionada!');
      return;
    }
    setTags([...tags, { name: tagInput.trim(), color: tagColor }]);
    setTagInput('');
    setTagColor('#007bff');
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleAddFornecedor = async () => {
    if (!newItemName.trim()) {
      alert('Digite um nome!');
      return;
    }
    try {
      await createFornecedor(newItemName.trim());
      setFornecedor(newItemName.trim());
      setNewItemName('');
      setShowFornecedorModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddFormaPagamento = async () => {
    if (!newItemName.trim()) {
      alert('Digite um nome!');
      return;
    }
    try {
      await createFormaPagamento(newItemName.trim());
      setFormaPagamento(newItemName.trim());
      setNewItemName('');
      setShowFormaPagamentoModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddTipoDespesa = async () => {
    if (!newItemName.trim()) {
      alert('Digite um nome!');
      return;
    }
    try {
      await createTipoDespesa(newItemName.trim());
      setTipoDespesa(newItemName.trim());
      setNewItemName('');
      setShowTipoDespesaModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const isFormValid = fornecedor && date && formaPagamento && tipoLancamento && tipoDespesa && amount;

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto ${editingTransaction ? 'border-4 border-yellow-400' : ''}`}>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {editingTransaction ? '✏️ Editar Transação' : '📝 Nova Transação'}
        </h2>

        {editingTransaction && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-6 flex justify-between items-center">
            <span className="text-yellow-800 font-semibold">🔔 Modo de Edição Ativo</span>
            <button
              onClick={onCancelEdit}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              ✖ Cancelar
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fornecedor */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🏪 Fornecedor/Cliente:</label>
            <div className="flex gap-3">
              <select
                value={fornecedor}
                onChange={(e) => setFornecedor(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map((f) => (
                  <option key={f._id} value={f.nome}>{f.nome}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowFornecedorModal(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-bold text-xl"
                title="Adicionar novo fornecedor"
              >
                +
              </button>
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📅 Data:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Forma de Pagamento */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">💳 Forma de Pagamento:</label>
            <div className="flex gap-3">
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione a forma de pagamento</option>
                {formasPagamento.map((f) => (
                  <option key={f._id} value={f.nome}>{f.nome}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowFormaPagamentoModal(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-bold text-xl"
                title="Adicionar nova forma de pagamento"
              >
                +
              </button>
            </div>
          </div>

          {/* Tipo de Lançamento */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">💰 Tipo de Lançamento:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTipoLancamento('gasto')}
                className={`py-4 rounded-lg font-semibold transition border-2 ${
                  tipoLancamento === 'gasto'
                    ? 'bg-red-500 text-white border-red-500 scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-500'
                }`}
              >
                💸 Gasto
              </button>
              <button
                type="button"
                onClick={() => setTipoLancamento('recebido')}
                className={`py-4 rounded-lg font-semibold transition border-2 ${
                  tipoLancamento === 'recebido'
                    ? 'bg-green-500 text-white border-green-500 scale-105'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                }`}
              >
                💰 Recebido
              </button>
            </div>
          </div>

          {/* Tipo de Despesa/Receita */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🏷️ Tipo de Despesa/Receita:</label>
            <div className="flex gap-3">
              <select
                value={tipoDespesa}
                onChange={(e) => setTipoDespesa(e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Selecione o tipo</option>
                {tiposDespesa.map((t) => (
                  <option key={t._id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowTipoDespesaModal(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition font-bold text-xl"
                title="Adicionar novo tipo"
              >
                +
              </button>
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">💵 Valor (R$):</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0,00"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">📝 Observações:</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite observações adicionais (opcional)..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">🏷️ Tags:</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.length === 0 ? (
                <span className="text-gray-500 text-sm">Nenhuma tag adicionada</span>
              ) : (
                tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:bg-black hover:bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite uma tag (ex: Viagem, Saúde)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <input
                type="color"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-16 h-11 border-2 border-gray-300 rounded-lg cursor-pointer"
                title="Escolher cor"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
              >
                + Tag
              </button>
            </div>
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition ${
              editingTransaction
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Salvando...' : editingTransaction ? '✏️ Atualizar Transação' : '💾 Salvar Transação'}
          </button>
        </form>
      </div>

      {/* Modais */}
      <Modal isOpen={showFornecedorModal} onClose={() => setShowFornecedorModal(false)} title="➕ Novo Fornecedor">
        <div className="space-y-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do fornecedor/cliente"
            onKeyPress={(e) => e.key === 'Enter' && handleAddFornecedor()}
            autoFocus
          />
          <button
            onClick={handleAddFornecedor}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Adicionar
          </button>
        </div>
      </Modal>

      <Modal isOpen={showFormaPagamentoModal} onClose={() => setShowFormaPagamentoModal(false)} title="➕ Nova Forma de Pagamento">
        <div className="space-y-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da forma de pagamento"
            onKeyPress={(e) => e.key === 'Enter' && handleAddFormaPagamento()}
            autoFocus
          />
          <button
            onClick={handleAddFormaPagamento}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Adicionar
          </button>
        </div>
      </Modal>

      <Modal isOpen={showTipoDespesaModal} onClose={() => setShowTipoDespesaModal(false)} title="➕ Novo Tipo de Despesa/Receita">
        <div className="space-y-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nome do tipo"
            onKeyPress={(e) => e.key === 'Enter' && handleAddTipoDespesa()}
            autoFocus
          />
          <button
            onClick={handleAddTipoDespesa}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Adicionar
          </button>
        </div>
      </Modal>
    </>
  );
}