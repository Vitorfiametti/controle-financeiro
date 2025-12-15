import { useState, useEffect } from 'react';

interface InvestmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  editingInvestment?: any;
  onCancelEdit?: () => void;
}

export default function InvestmentForm({ onSubmit, editingInvestment, onCancelEdit }: InvestmentFormProps) {
  const [tipo, setTipo] = useState<'aplicacao' | 'resgate' | ''>('');
  const [categoria, setCategoria] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [valor, setValor] = useState('');
  const [rentabilidade, setRentabilidade] = useState('0');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');
  const [loading, setLoading] = useState(false);

  const categorias = [
    'Ações',
    'Tesouro Direto',
    'CDB',
    'LCI/LCA',
    'Fundos Imobiliários',
    'Fundos de Investimento',
    'Poupança',
    'Criptomoedas',
    'Previdência Privada',
    'Outro',
  ];

  useEffect(() => {
    if (editingInvestment) {
      setTipo(editingInvestment.tipo);
      setCategoria(editingInvestment.categoria);
      setInstituicao(editingInvestment.instituicao);
      setValor(editingInvestment.valor.toString());
      setRentabilidade(editingInvestment.rentabilidade.toString());
      setData(editingInvestment.data);
      setObservacao(editingInvestment.observacao || '');
    } else {
      setData(new Date().toISOString().split('T')[0]);
    }
  }, [editingInvestment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tipo || !categoria || !instituicao || !valor || !data) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        tipo,
        categoria,
        instituicao,
        valor: parseFloat(valor),
        rentabilidade: parseFloat(rentabilidade),
        data,
        observacao,
      });

      if (!editingInvestment) {
        resetForm();
      }
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar investimento');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTipo('');
    setCategoria('');
    setInstituicao('');
    setValor('');
    setRentabilidade('0');
    setData(new Date().toISOString().split('T')[0]);
    setObservacao('');
  };

  const isFormValid = tipo && categoria && instituicao && valor && data;

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-8 ${editingInvestment ? 'border-4 border-yellow-400' : ''}`}>
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {editingInvestment ? '✏️ Editar Investimento' : '💼 Nova Operação'}
      </h2>

      {editingInvestment && (
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
        {/* Tipo de Operação */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">💰 Tipo de Operação:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTipo('aplicacao')}
              className={`py-4 rounded-lg font-semibold transition border-2 ${
                tipo === 'aplicacao'
                  ? 'bg-green-500 text-white border-green-500 scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
              }`}
            >
              📈 Aplicação
            </button>
            <button
              type="button"
              onClick={() => setTipo('resgate')}
              className={`py-4 rounded-lg font-semibold transition border-2 ${
                tipo === 'resgate'
                  ? 'bg-blue-500 text-white border-blue-500 scale-105'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              💵 Resgate
            </button>
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">📊 Tipo de Investimento:</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Selecione o tipo</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Instituição */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">🏦 Instituição (Banco/Corretora):</label>
          <input
            type="text"
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: XP Investimentos, Nubank, etc"
            required
          />
        </div>

        {/* Data */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">📅 Data:</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Valor */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">💵 Valor (R$):</label>
          <input
            type="number"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0,00"
            required
          />
        </div>

        {/* Rentabilidade */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">📈 Rentabilidade (R$):</label>
          <input
            type="number"
            step="0.01"
            value={rentabilidade}
            onChange={(e) => setRentabilidade(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0,00"
          />
          <p className="text-sm text-gray-500 mt-2">
            Informe quanto este investimento rendeu (lucro ou prejuízo)
          </p>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">📝 Observações:</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Detalhes sobre o investimento (opcional)..."
            rows={3}
          />
        </div>

        {/* Botão Submit */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition ${
            editingInvestment
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900'
              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Salvando...' : editingInvestment ? '✏️ Atualizar Investimento' : '💾 Salvar Investimento'}
        </button>
      </form>
    </div>
  );
}