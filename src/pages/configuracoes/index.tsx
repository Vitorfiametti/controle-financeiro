import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Layout from '@/components/Layout/Layout';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface Item {
  _id: string;
  name: string;
  type?: string;
  icon?: string;
  category?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
}

type TabType = 'perfil' | 'fornecedores' | 'pagamentos' | 'categorias';

export default function Configuracoes() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Modal de deletar conta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFinalDeleteModal, setShowFinalDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  // Dados do Perfil
  const [perfilData, setPerfilData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    metaMensal: 0,
    notificacoes: true,
  });

  // Dados do Modal
  const [formData, setFormData] = useState({
    name: '',
    type: 'despesa',
    icon: '💰',
    category: '',
    phone: '',
    email: '',
  });

  const tabs = [
    { id: 'perfil', label: 'Meu Perfil', icon: '👤' },
    { id: 'fornecedores', label: 'Fornecedores', icon: '🏢' },
    { id: 'pagamentos', label: 'Formas de Pagamento', icon: '💳' },
    { id: 'categorias', label: 'Categorias', icon: '🏷️' },
  ];

  const apiEndpoints = {
    perfil: '',
    fornecedores: '/api/fornecedores',
    pagamentos: '/api/payment-methods',
    categorias: '/api/categories',
  };

  useEffect(() => {
    if (activeTab !== 'perfil') {
      loadItems();
    }
  }, [activeTab]);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiEndpoints[activeTab]);
      if (res.ok) {
        const data = await res.json();
        console.log(`📦 ${activeTab} carregados:`, data);
        setItems(data);
      } else {
        console.error('❌ Erro na resposta:', res.status);
        toast.error('Erro ao carregar itens');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNÇÕES DO PERFIL =====
  const handleSavePerfil = async () => {
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: perfilData.name,
          email: perfilData.email,
        }),
      });

      if (res.ok) {
        toast.success('Perfil atualizado com sucesso!');
        update();
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleChangePassword = async () => {
    if (perfilData.newPassword !== perfilData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (perfilData.newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: perfilData.currentPassword,
          newPassword: perfilData.newPassword,
        }),
      });

      if (res.ok) {
        toast.success('Senha alterada com sucesso!');
        setPerfilData({ ...perfilData, currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao alterar senha');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha');
    }
  };

  // ===== FUNÇÃO DELETAR CONTA =====
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETAR MINHA CONTA') {
      toast.error('Digite exatamente: DELETAR MINHA CONTA');
      return;
    }

    try {
      const res = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Conta deletada com sucesso');
        setTimeout(() => {
          signOut({ callbackUrl: '/' });
        }, 2000);
      } else {
        const data = await res.json();
        toast.error(data.message || 'Erro ao deletar conta');
      }
    } catch (error) {
      toast.error('Erro ao deletar conta');
    }
  };

  // ===== FUNÇÕES DOS ITENS =====
  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: '', type: 'despesa', icon: '💰', category: '', phone: '', email: '' });
    setShowModal(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type || 'despesa',
      icon: item.icon || '💰',
      category: item.category || '',
      phone: item.phone || '',
      email: item.email || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem 
        ? `${apiEndpoints[activeTab]}/${editingItem._id}`
        : apiEndpoints[activeTab];

      let body: any = { name: formData.name };

      if (activeTab === 'categorias') {
        body = { name: formData.name, type: formData.type, icon: formData.icon };
      } else if (activeTab === 'fornecedores') {
        body = { 
          name: formData.name, 
          category: formData.category, 
          phone: formData.phone, 
          email: formData.email 
        };
      }

      console.log('📤 Enviando:', body); // ✅ LOG

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log('📥 Resposta:', data); // ✅ LOG

      if (res.ok) {
        toast.success(editingItem ? 'Item atualizado!' : 'Item criado!');
        setShowModal(false);
        loadItems();
      } else {
        toast.error(data.message || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) {
      return;
    }

    try {
      const res = await fetch(`${apiEndpoints[activeTab]}/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Item excluído!');
        loadItems();
      } else {
        toast.error('Erro ao excluir');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir');
    }
  };

  const getIcon = (item: Item) => {
    if (activeTab === 'fornecedores') return '🏢';
    if (activeTab === 'pagamentos') return '💳';
    if (activeTab === 'categorias') return item.icon || '💰';
    return '📦';
  };

  const getBadgeColor = (type?: string) => {
    if (type === 'receita') return 'bg-green-100 text-green-800';
    if (type === 'despesa') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTabLabel = () => {
    if (activeTab === 'fornecedores') return 'fornecedor';
    if (activeTab === 'pagamentos') return 'forma de pagamento';
    if (activeTab === 'categorias') return 'categoria';
    return 'item';
  };

  return (
    <>
      <Head>
        <title>Configurações - ContaFy</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span>⚙️</span>
              <span>Configurações</span>
            </h1>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Conteúdo da Tab Perfil */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                {/* Informações Pessoais */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>👤</span>
                    Informações Pessoais
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={perfilData.name}
                        onChange={(e) => setPerfilData({ ...perfilData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Seu nome"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={perfilData.email}
                        onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <button
                      onClick={handleSavePerfil}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>

                {/* Alterar Senha */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🔒</span>
                    Alterar Senha
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={perfilData.currentPassword}
                        onChange={(e) => setPerfilData({ ...perfilData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={perfilData.newPassword}
                        onChange={(e) => setPerfilData({ ...perfilData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={perfilData.confirmPassword}
                        onChange={(e) => setPerfilData({ ...perfilData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                      Alterar Senha
                    </button>
                  </div>
                </div>

                {/* Meta Mensal */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🎯</span>
                    Meta Mensal de Economia
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor da Meta (R$)
                      </label>
                      <input
                        type="number"
                        value={perfilData.metaMensal}
                        onChange={(e) => setPerfilData({ ...perfilData, metaMensal: Number(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: 1000"
                      />
                    </div>

                    <button
                      onClick={() => toast.success('Meta salva!')}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                    >
                      Salvar Meta
                    </button>
                  </div>
                </div>

                {/* Preferências */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🔔</span>
                    Preferências
                  </h3>

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-semibold text-gray-800">Notificações</p>
                      <p className="text-sm text-gray-600">Receber alertas sobre transações</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={perfilData.notificacoes}
                        onChange={(e) => setPerfilData({ ...perfilData, notificacoes: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* ZONA DE PERIGO - DELETAR CONTA */}
                <div className="border-2 border-red-300 bg-red-50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                    <span>⚠️</span>
                    Zona de Perigo
                  </h3>

                  <p className="text-gray-700 mb-4">
                    Deletar sua conta é uma ação <strong>permanente e irreversível</strong>. 
                    Todos os seus dados serão perdidos para sempre.
                  </p>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg"
                  >
                    🗑️ Deletar Minha Conta
                  </button>
                </div>
              </div>
            )}

            {/* Conteúdo das outras Tabs */}
            {activeTab !== 'perfil' && (
              <>
                {/* Botão Adicionar */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleCreate}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg"
                  >
                    <span className="text-xl">+</span>
                    <span>Adicionar {getTabLabel()}</span>
                  </button>
                  
                  {items.length > 0 && (
                    <span className="text-gray-600 font-semibold">
                      {items.length} {items.length === 1 ? 'item' : 'itens'} cadastrado{items.length === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                {/* Lista de Itens */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow border-2 border-gray-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-3xl">{getIcon(item)}</span>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-800">
                                {item.name || '(Sem nome)'}
                              </h3>
                              {item.type && (
                                <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold mt-1 ${getBadgeColor(item.type)}`}>
                                  {item.type === 'receita' ? '↗ Receita' : '↘ Despesa'}
                                </span>
                              )}
                              {item.category && (
                                <p className="text-sm text-gray-600 mt-1">📂 {item.category}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Info adicional para fornecedores */}
                        {activeTab === 'fornecedores' && (
                          <div className="space-y-1 mb-3">
                            {item.phone && (
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span>📞</span>
                                <span>{item.phone}</span>
                              </p>
                            )}
                            {item.email && (
                              <p className="text-sm text-gray-600 flex items-center gap-2 truncate">
                                <span>✉️</span>
                                <span>{item.email}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Botões */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-1"
                          >
                            <span>✏️</span>
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-1"
                          >
                            <span>🗑️</span>
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg">
                        <p className="text-gray-500 text-lg mb-4">
                          Nenhum(a) {getTabLabel()} cadastrado(a)
                        </p>
                        <button
                          onClick={handleCreate}
                          className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Cadastrar primeiro(a) {getTabLabel()}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de Itens */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? '✏️ Editar' : '➕ Adicionar'} {getTabLabel()}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Ex: ${
                      activeTab === 'fornecedores' ? 'Fornecedor XYZ' :
                      activeTab === 'pagamentos' ? 'Cartão de Crédito' :
                      'Alimentação'
                    }`}
                  />
                </div>

                {activeTab === 'fornecedores' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Supermercado"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@fornecedor.com"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'categorias' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            onClick={() => setFormData({ ...formData, icon })}
                            className={`text-2xl p-3 rounded-lg border-2 transition-all ${
                              formData.icon === icon
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                >
                  {editingItem ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1 - PRIMEIRO AVISO DE DELETAR CONTA */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">⚠️</span>
                </div>
                <h2 className="text-3xl font-bold text-red-600 mb-2">
                  Deletar Conta?
                </h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    <span>❌</span>
                    O que será perdido:
                  </h3>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Todas as suas transações (receitas e despesas)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Todos os seus investimentos registrados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Histórico completo de movimentações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Fornecedores, categorias e formas de pagamento</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span>Badges, conquistas e estatísticas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>•</span>
                      <span><strong>Seu perfil completo</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="text-yellow-800 font-semibold text-center">
                    ⚡ Esta ação é <strong>PERMANENTE</strong> e <strong>IRREVERSÍVEL</strong>!
                  </p>
                  <p className="text-yellow-700 text-sm text-center mt-2">
                    Não será possível recuperar seus dados depois.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  ← Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setShowFinalDeleteModal(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Continuar →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2 - CONFIRMAÇÃO FINAL */}
        {showFinalDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <span className="text-5xl">🗑️</span>
                </div>
                <h2 className="text-3xl font-bold text-red-600 mb-2">
                  Última Chance!
                </h2>
                <p className="text-gray-600">
                  Tem <strong>CERTEZA ABSOLUTA</strong> que deseja deletar sua conta?
                </p>
              </div>

              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-6 mb-6">
                <p className="text-red-800 font-bold text-center mb-4">
                  Para confirmar, digite exatamente:
                </p>
                <p className="text-center text-xl font-bold text-red-600 mb-4 bg-white py-3 rounded-lg">
                  DELETAR MINHA CONTA
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-center font-bold"
                  placeholder="Digite aqui..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowFinalDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETAR MINHA CONTA'}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                    deleteConfirmText === 'DELETAR MINHA CONTA'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🗑️ Deletar Definitivamente
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                Seus dados serão permanentemente removidos em até 24 horas
              </p>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}