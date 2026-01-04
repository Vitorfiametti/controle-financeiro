import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout/Layout';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Fornecedor {
  _id: string;
  name: string;
}

interface PaymentMethod {
  _id: string;
  name: string;
}

interface Category {
  _id: string;
  name: string;
  type: 'receita' | 'despesa';
  icon?: string;
}

export default function Lancamento() {
  const { data: session } = useSession();
  const router = useRouter();
  const { edit } = router.query; // Pegar ID da transação para editar
  const hasLoadedTransaction = useRef(false); // Ref para controlar carregamento único

  // Dados dos dropdowns
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Modais
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Estado de edição
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Dados da transação
  const [fornecedorId, setFornecedorId] = useState('');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [tipoLancamento, setTipoLancamento] = useState<'receita' | 'despesa'>('despesa');
  const [categoryId, setCategoryId] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [tags, setTags] = useState<Array<{ text: string; color: string }>>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagColor, setTagColor] = useState('#3b82f6'); // Azul padrão

  // Dados dos novos itens
  const [newFornecedor, setNewFornecedor] = useState({ name: '' });
  const [newPaymentMethod, setNewPaymentMethod] = useState({ name: '' });
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'despesa' as 'receita' | 'despesa',
    icon: '💰'
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    loadAllData();
  }, [session]);

  // Carregar transação para editar
  useEffect(() => {
    if (edit && typeof edit === 'string' && !hasLoadedTransaction.current && fornecedores.length > 0) {
      loadTransactionToEdit(edit);
      hasLoadedTransaction.current = true; // Marca como carregado
    }
  }, [edit, fornecedores.length]);

  const loadTransactionToEdit = async (id: string) => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const transactions = await res.json();
        const transaction = transactions.find((t: any) => t._id === id);
        
        if (transaction) {
          setIsEditing(true);
          setEditingId(id);
          setFornecedorId(transaction.fornecedor?._id || '');
          setPaymentMethodId(transaction.paymentMethod?._id || '');
          setTipoLancamento(transaction.type);
          setCategoryId(transaction.category?._id || '');
          setValor(transaction.amount.toString());
          
          // Formatar data para input (YYYY-MM-DD)
          const dateObj = new Date(transaction.date);
          const formattedDate = dateObj.toISOString().split('T')[0];
          setData(formattedDate);
          
          setObservacoes(transaction.description || '');
          setTags(transaction.tags || []);
          
          toast.success('✏️ Modo de edição ativado!');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar transação:', error);
      toast.error('❌ Erro ao carregar transação');
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadFornecedores(),
      loadPaymentMethods(),
      loadCategories()
    ]);
  };

  const loadFornecedores = async () => {
    try {
      const res = await fetch('/api/fornecedores');
      if (res.ok) {
        const data = await res.json();
        console.log('📦 Fornecedores:', data);
        setFornecedores(data);
      }
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await fetch('/api/payment-methods');
      if (res.ok) {
        const data = await res.json();
        console.log('💳 Formas de pagamento:', data);
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        console.log('🏷️ Categorias:', data);
        setCategories(data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  // ========== CRIAR FORNECEDOR ==========
  const handleCreateFornecedor = async () => {
    // Validação segura
    if (!newFornecedor.name || !newFornecedor.name.trim()) {
      toast.error('❌ Nome é obrigatório!');
      return;
    }

    try {
      console.log('📤 Criando fornecedor:', newFornecedor);

      const res = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFornecedor.name.trim() })
      });

      const data = await res.json();
      console.log('📥 Resposta:', data);

      if (res.ok) {
        toast.success('✅ Fornecedor criado!');
        setShowFornecedorModal(false);
        setNewFornecedor({ name: '' });
        await loadFornecedores();
        setFornecedorId(data._id);
      } else {
        toast.error(data.message || '❌ Erro ao criar');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao criar fornecedor');
    }
  };

  // ========== CRIAR FORMA DE PAGAMENTO ==========
  const handleCreatePaymentMethod = async () => {
    // Validação segura
    if (!newPaymentMethod.name || !newPaymentMethod.name.trim()) {
      toast.error('❌ Nome é obrigatório!');
      return;
    }

    try {
      console.log('📤 Criando forma de pagamento:', newPaymentMethod);

      const res = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPaymentMethod.name.trim() })
      });

      const data = await res.json();
      console.log('📥 Resposta:', data);

      if (res.ok) {
        toast.success('✅ Forma de pagamento criada!');
        setShowPaymentModal(false);
        setNewPaymentMethod({ name: '' });
        await loadPaymentMethods();
        setPaymentMethodId(data._id);
      } else {
        toast.error(data.message || '❌ Erro ao criar');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao criar forma de pagamento');
    }
  };

  // ========== CRIAR CATEGORIA ==========
  const handleCreateCategory = async () => {
    // Validação segura
    if (!newCategory.name || !newCategory.name.trim()) {
      toast.error('❌ Nome é obrigatório!');
      return;
    }

    try {
      console.log('📤 Criando categoria:', newCategory);

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name.trim(),
          type: newCategory.type,
          icon: newCategory.icon
        })
      });

      const data = await res.json();
      console.log('📥 Resposta:', data);

      if (res.ok) {
        toast.success('✅ Categoria criada!');
        setShowCategoryModal(false);
        setNewCategory({ name: '', type: 'despesa', icon: '💰' });
        await loadCategories();
        setCategoryId(data._id);
      } else {
        toast.error(data.message || '❌ Erro ao criar');
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error('❌ Erro ao criar categoria');
    }
  };

  // ========== GERENCIAR TAGS ==========
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim(); // Mantém maiúsculas/minúsculas
    
    // Não adicionar duplicatas (case insensitive)
    if (tags.some(tag => tag.text.toLowerCase() === newTag.toLowerCase())) {
      toast.error('❌ Tag já adicionada!');
      return;
    }
    
    // Máximo 5 tags
    if (tags.length >= 5) {
      toast.error('❌ Máximo de 5 tags por transação!');
      return;
    }
    
    setTags([...tags, { text: newTag, color: tagColor }]);
    setTagInput('');
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Cores predefinidas para seleção rápida
  const tagColors = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Laranja
    '#ef4444', // Vermelho
    '#8b5cf6', // Roxo
    '#ec4899', // Rosa
    '#14b8a6', // Teal
    '#f97316', // Orange
  ];

  // ========== CRIAR/EDITAR TRANSAÇÃO ==========
  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fornecedorId || !paymentMethodId || !categoryId || !valor || !data) {
      toast.error('❌ Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const transactionData = {
        fornecedor: fornecedorId,
        paymentMethod: paymentMethodId,
        type: tipoLancamento,
        category: categoryId,
        amount: parseFloat(valor),
        date: data,
        description: observacoes,
        tags: tags
      };

      // Se estiver editando, fazer PUT
      if (isEditing && editingId) {
        const res = await fetch(`/api/transactions?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });

        if (res.ok) {
          toast.success('✅ Transação atualizada com sucesso!');
          router.push('/historico');
        } else {
          const error = await res.json();
          toast.error(error.message || '❌ Erro ao atualizar transação');
        }
      } else {
        // Se não estiver editando, fazer POST (criar nova)
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });

        if (res.ok) {
          toast.success('✅ Transação criada com sucesso!');
          // Limpar formulário
          setFornecedorId('');
          setPaymentMethodId('');
          setCategoryId('');
          setValor('');
          setData('');
          setObservacoes('');
          setTags([]);
          setTagInput('');
        } else {
          const error = await res.json();
          toast.error(error.message || '❌ Erro ao criar transação');
        }
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast.error(isEditing ? '❌ Erro ao atualizar transação' : '❌ Erro ao criar transação');
    }
  };

  // Filtrar categorias por tipo
  const categoriasFiltradas = categories.filter(c => c.type === tipoLancamento);

  return (
    <>
      <Head>
        <title>Nova Transação - ContaFy</title>
      </Head>

      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
              <span>{isEditing ? '✏️' : '📝'}</span>
              <span>{isEditing ? 'Editar Transação' : 'Nova Transação'}</span>
            </h1>

            {isEditing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  ✏️ <strong>Modo de edição:</strong> Altere os campos abaixo e clique em "Atualizar Transação"
                </p>
              </div>
            )}

            <form onSubmit={handleCreateTransaction} className="space-y-6">
              
              {/* Fornecedor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Fornecedor/Cliente:
                </label>
                <div className="flex gap-2">
                  <select
                    value={fornecedorId}
                    onChange={(e) => setFornecedorId(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um fornecedor</option>
                    {fornecedores.map(f => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowFornecedorModal(true)}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Data:
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💳 Forma de Pagamento:
                </label>
                <div className="flex gap-2">
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    {paymentMethods.map(pm => (
                      <option key={pm._id} value={pm._id}>{pm.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(true)}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tipo de Lançamento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💰 Tipo de Lançamento:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoLancamento('despesa');
                      setCategoryId('');
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      tipoLancamento === 'despesa'
                        ? 'bg-red-100 text-red-700 border-2 border-red-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                    }`}
                  >
                    💸 Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoLancamento('receita');
                      setCategoryId('');
                    }}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      tipoLancamento === 'receita'
                        ? 'bg-green-100 text-green-700 border-2 border-green-500'
                        : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                    }`}
                  >
                    💰 Receita
                  </button>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Tipo de {tipoLancamento === 'receita' ? 'Receita' : 'Despesa'}:
                </label>
                <div className="flex gap-2">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione o tipo</option>
                    {categoriasFiltradas.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setNewCategory({ ...newCategory, type: tipoLancamento });
                      setShowCategoryModal(true);
                    }}
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xl transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  💵 Valor (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ Tags:
                </label>
                <div className="space-y-3">
                  {/* Input para adicionar tags */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagInputKeyPress}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite uma tag e pressione Enter"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                    >
                      + Add
                    </button>
                  </div>
                  
                  {/* Seletor de cor */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Escolha a cor da tag:
                    </label>
                    <div className="flex gap-2 items-center">
                      {/* Cores predefinidas */}
                      {tagColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setTagColor(color)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            tagColor === color 
                              ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' 
                              : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      
                      {/* Seletor de cor customizado */}
                      <div className="relative">
                        <input
                          type="color"
                          value={tagColor}
                          onChange={(e) => setTagColor(e.target.value)}
                          className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                          title="Escolher cor customizada"
                        />
                      </div>
                      
                      {/* Preview da cor selecionada */}
                      <span className="text-xs text-gray-600 ml-2">
                        {tagColor}
                      </span>
                    </div>
                  </div>
                  
                  {/* Lista de tags adicionadas */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-white shadow-md"
                          style={{ backgroundColor: tag.color }}
                        >
                          #{tag.text}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(index)}
                            className="hover:bg-white hover:bg-opacity-20 rounded-full w-5 h-5 flex items-center justify-center transition-all"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {tags.length}/5 tags • Pressione Enter ou clique em "+ Add" para adicionar
                  </p>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Observações:
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Digite observações adicionais (opcional)..."
                />
              </div>

              {/* Botão Salvar */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl text-lg"
              >
                {isEditing ? '✏️ Atualizar Transação' : '💾 Salvar Transação'}
              </button>
            </form>
          </div>
        </div>

        {/* MODAL: CRIAR FORNECEDOR */}
        {showFornecedorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ➕ Novo Fornecedor
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newFornecedor.name}
                  onChange={(e) => setNewFornecedor({ name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Posto Shell"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowFornecedorModal(false);
                    setNewFornecedor({ name: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateFornecedor}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CRIAR FORMA DE PAGAMENTO */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ➕ Nova Forma de Pagamento
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newPaymentMethod.name}
                  onChange={(e) => setNewPaymentMethod({ name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: PIX"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setNewPaymentMethod({ name: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePaymentMethod}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CRIAR CATEGORIA */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                ➕ Nova Categoria
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Alimentação"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={newCategory.type}
                    onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'receita' | 'despesa' })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="despesa">↘ Despesa</option>
                    <option value="receita">↗ Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ícone
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {['💰', '🍔', '🚗', '🏠', '💊', '🎓', '🎮', '✈️', '👕', '📱', '🛒', '⚡'].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                        className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                          newCategory.icon === icon
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategory({ name: '', type: 'despesa', icon: '💰' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}