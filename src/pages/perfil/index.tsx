import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout/Layout';
import Head from 'next/head';
import { toast } from 'react-hot-toast';

interface UserStats {
  totalTransactions: number;
  totalReceitas: number;
  totalDespesas: number;
  saldoMensal: number;
  maiorDespesa: { description: string; amount: number };
  categoriaMaisGasta: { name: string; total: number };
  economiaMedia: number;
  diasAtivos: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  color: string;
}

export default function Perfil() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [perfilFinanceiro, setPerfilFinanceiro] = useState('');
  const [healthScore, setHealthScore] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [metaMensal, setMetaMensal] = useState(0);

  const badges: Badge[] = [
    {
      id: '1',
      name: 'Primeiro Passo',
      description: 'Registrou sua primeira transação',
      icon: '🎯',
      unlocked: (stats?.totalTransactions || 0) >= 1,
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: '2',
      name: 'Organizador',
      description: 'Registrou 10 transações',
      icon: '📊',
      unlocked: (stats?.totalTransactions || 0) >= 10,
      color: 'from-green-500 to-green-600',
    },
    {
      id: '3',
      name: 'Econômico',
      description: 'Saldo positivo no mês',
      icon: '💰',
      unlocked: (stats?.saldoMensal || 0) > 0,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      id: '4',
      name: 'Investidor',
      description: 'Economizou mais de R$ 1.000',
      icon: '📈',
      unlocked: (stats?.saldoMensal || 0) >= 1000,
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: '5',
      name: 'Disciplinado',
      description: '30 dias ativos',
      icon: '🔥',
      unlocked: (stats?.diasAtivos || 0) >= 30,
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: '6',
      name: 'Milionário',
      description: 'Receitas acima de R$ 10.000',
      icon: '💎',
      unlocked: (stats?.totalReceitas || 0) >= 10000,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const transactions = await res.json();
        
        const receitas = transactions.filter((t: any) => t.type === 'receita');
        const despesas = transactions.filter((t: any) => t.type === 'despesa');
        
        const totalReceitas = receitas.reduce((sum: number, t: any) => sum + t.amount, 0);
        const totalDespesas = despesas.reduce((sum: number, t: any) => sum + t.amount, 0);
        const saldoMensal = totalReceitas - totalDespesas;

        const maiorDespesa = despesas.length > 0
          ? despesas.reduce((max: any, t: any) => t.amount > max.amount ? t : max)
          : { description: 'Nenhuma', amount: 0 };

        const categorias: { [key: string]: number } = {};
        despesas.forEach((t: any) => {
          categorias[t.category] = (categorias[t.category] || 0) + t.amount;
        });
        const categoriaMaisGasta = Object.entries(categorias).length > 0
          ? Object.entries(categorias).reduce((max, curr) => curr[1] > max[1] ? curr : max)
          : ['Nenhuma', 0];

        const diasAtivos = transactions.length > 0 ? Math.min(transactions.length * 2, 365) : 0;

        const userStats: UserStats = {
          totalTransactions: transactions.length,
          totalReceitas,
          totalDespesas,
          saldoMensal,
          maiorDespesa: { description: maiorDespesa.description, amount: maiorDespesa.amount },
          categoriaMaisGasta: { 
            name: String(categoriaMaisGasta[0]), 
            total: Number(categoriaMaisGasta[1]) 
        },
          economiaMedia: saldoMensal,
          diasAtivos,
        };

        setStats(userStats);
        calcularPerfil(userStats);
        calcularHealthScore(userStats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularPerfil = (stats: UserStats) => {
    const taxaEconomia = stats.totalReceitas > 0 
      ? (stats.saldoMensal / stats.totalReceitas) * 100 
      : 0;

    if (taxaEconomia >= 30) {
      setPerfilFinanceiro('Econômico 💰');
    } else if (taxaEconomia >= 10) {
      setPerfilFinanceiro('Equilibrado ⚖️');
    } else if (taxaEconomia >= 0) {
      setPerfilFinanceiro('Moderado 📊');
    } else {
      setPerfilFinanceiro('Gastador 💸');
    }
  };

  const calcularHealthScore = (stats: UserStats) => {
    let score = 50;

    if (stats.saldoMensal > 0) score += 30;
    
    const taxaEconomia = stats.totalReceitas > 0 
      ? (stats.saldoMensal / stats.totalReceitas) * 100 
      : 0;
    if (taxaEconomia >= 20) score += 20;

    if (stats.diasAtivos >= 7) score += 10;

    setHealthScore(Math.min(Math.max(score, 0), 100));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Precisa Melhorar';
  };

  const handleSaveMeta = async () => {
    toast.success('Meta salva com sucesso!');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Meu Perfil - ContaFy</title>
      </Head>

      <Layout>
        <div className="space-y-6">
          {/* Cabeçalho do Perfil */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl text-6xl">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full" />
                ) : (
                  <span>👤</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {session?.user?.name || 'Usuário'}
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  {session?.user?.email}
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
                    {perfilFinanceiro}
                  </span>
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold">
                    🔥 {stats?.diasAtivos} dias ativos
                  </span>
                </div>
              </div>

              {/* Health Score */}
              <div className="text-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(healthScore / 100) * 352} 352`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">{healthScore}</span>
                    <span className="text-xs text-white/80">Score</span>
                  </div>
                </div>
                <p className="text-white font-semibold mt-2">
                  {getScoreLabel(healthScore)}
                </p>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maior Despesa */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🏆</span>
                <h3 className="text-xl font-bold text-gray-800">Maior Despesa</h3>
              </div>
              <p className="text-gray-600 mb-2">{stats?.maiorDespesa.description}</p>
              <p className="text-3xl font-bold text-red-600">
                R$ {stats?.maiorDespesa.amount.toFixed(2)}
              </p>
            </div>

            {/* Categoria Mais Gasta */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🎯</span>
                <h3 className="text-xl font-bold text-gray-800">Categoria Top</h3>
              </div>
              <p className="text-gray-600 mb-2">{stats?.categoriaMaisGasta.name}</p>
              <p className="text-3xl font-bold text-orange-600">
                R$ {stats?.categoriaMaisGasta.total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Meta Mensal */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 shadow-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">🎯</span>
                <h3 className="text-2xl font-bold text-gray-800">Meta Mensal de Economia</h3>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {isEditing ? (
              <div className="flex gap-4">
                <input
                  type="number"
                  value={metaMensal}
                  onChange={(e) => setMetaMensal(Number(e.target.value))}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: 1000"
                />
                <button
                  onClick={handleSaveMeta}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div>
                <p className="text-4xl font-bold text-green-600 mb-2">
                  R$ {metaMensal.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  Progresso: R$ {stats?.saldoMensal.toFixed(2)} / R$ {metaMensal.toFixed(2)}
                </p>
                {metaMensal > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((stats?.saldoMensal || 0) / metaMensal * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {((stats?.saldoMensal || 0) / metaMensal * 100).toFixed(1)}% da meta
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Badges/Conquistas */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🏅</span>
              <h3 className="text-2xl font-bold text-gray-800">Conquistas</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative p-6 rounded-2xl text-center transition-all ${
                    badge.unlocked
                      ? `bg-gradient-to-br ${badge.color} shadow-lg hover:scale-105`
                      : 'bg-gray-100 opacity-50'
                  }`}
                >
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h4 className={`font-bold mb-1 ${badge.unlocked ? 'text-white' : 'text-gray-600'}`}>
                    {badge.name}
                  </h4>
                  <p className={`text-xs ${badge.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                    {badge.description}
                  </p>
                  {badge.unlocked && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <span className="text-green-600">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <p className="text-center text-gray-700">
                <span className="font-bold text-blue-600">
                  {badges.filter(b => b.unlocked).length}/{badges.length}
                </span>
                {' '}conquistas desbloqueadas! Continue assim! 🎉
              </p>
            </div>
          </div>

          {/* Dicas Personalizadas */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">💡</span>
              <h3 className="text-2xl font-bold text-gray-800">Dicas Para Você</h3>
            </div>

            <div className="space-y-3">
              {stats && stats.saldoMensal < 0 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Atenção ao Saldo Negativo</h4>
                    <p className="text-gray-600 text-sm">
                      Suas despesas estão maiores que suas receitas. Tente reduzir gastos desnecessários.
                    </p>
                  </div>
                </div>
              )}

              {stats && stats.totalTransactions < 10 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Continue Registrando</h4>
                    <p className="text-gray-600 text-sm">
                      Quanto mais você registrar suas transações, melhor será sua análise financeira!
                    </p>
                  </div>
                </div>
              )}

              {stats && stats.saldoMensal > 0 && (
                <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">Parabéns!</h4>
                    <p className="text-gray-600 text-sm">
                      Você está economizando! Continue assim e considere investir esse dinheiro.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}