import Link from 'next/link';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <>
      <Head>
        <title>ContaFy - Controle Financeiro Inteligente</title>
        <meta name="description" content="Gerencie suas finanças de forma inteligente e eficiente" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Navbar */}
        <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ContaFy
                </h1>
              </div>

              {/* Botão Entrar */}
              <Link 
                href="/auth/signin"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30"
              >
                Entrar
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-6">
                <span className="text-blue-600 text-sm font-semibold">✨ #1 Plataforma de Controle Financeiro</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-gray-800 mb-6">
                Controle Suas
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Finanças com Inteligência
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                A plataforma completa para gerenciar receitas, despesas e investimentos de forma simples e eficiente
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link 
                  href="/auth/signin"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/30 text-lg"
                >
                  Começar Agora - Grátis
                </Link>
                <Link 
                  href="/auth/signin"
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border-2 border-gray-200 text-lg shadow-lg"
                >
                  Ver Demonstração
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 text-center">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 border-2 border-white shadow"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 border-2 border-white shadow"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-2 border-white shadow"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-white shadow"></div>
                  </div>
                  <span className="text-gray-700 font-semibold">10.000+ membros ativos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <span className="text-gray-700 font-semibold">4.9/5</span>
                </div>
              </div>
            </div>

            {/* Preview Card */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg">
                    <div className="text-4xl mb-2">📊</div>
                    <h3 className="text-white font-bold text-lg mb-2">Dashboard Completo</h3>
                    <p className="text-blue-100 text-sm">Visualize todas suas finanças em tempo real</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg">
                    <div className="text-4xl mb-2">📄</div>
                    <h3 className="text-white font-bold text-lg mb-2">Relatórios Detalhados</h3>
                    <p className="text-purple-100 text-sm">Análises profundas de receitas e despesas</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-2xl shadow-lg">
                    <div className="text-4xl mb-2">👥</div>
                    <h3 className="text-white font-bold text-lg mb-2">Gestão Completa</h3>
                    <p className="text-pink-100 text-sm">Organize fornecedores e categorias</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Por Que Escolher{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ContaFy
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Recursos que tornam o controle financeiro simples e poderoso
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all group hover:scale-105 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-gray-800 font-bold text-xl mb-2">Controle Total</h3>
                <p className="text-gray-600">Gerencie receitas, despesas e investimentos</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all group hover:scale-105 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-gray-800 font-bold text-xl mb-2">Segurança Total</h3>
                <p className="text-gray-600">Dados protegidos com criptografia avançada</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all group hover:scale-105 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-gray-800 font-bold text-xl mb-2">Relatórios</h3>
                <p className="text-gray-600">Análises detalhadas e gráficos interativos</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all group hover:scale-105 shadow-lg">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-gray-800 font-bold text-xl mb-2">Acesso 24/7</h3>
                <p className="text-gray-600">Disponível em qualquer dispositivo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">10,000+</div>
                <div className="text-gray-600">Membros Ativos</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">⭐</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">98%</div>
                <div className="text-gray-600">Satisfação</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">📄</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">500+</div>
                <div className="text-gray-600">Recursos</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🛡️</span>
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">24/7</div>
                <div className="text-gray-600">Suporte</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Pronto para Começar?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Junte-se a milhares de usuários que já transformaram suas finanças
              </p>
              <Link 
                href="/auth/signin"
                className="inline-block px-10 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-xl transition-all shadow-xl text-lg"
              >
                Criar Conta Grátis
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-600">
              © 2025 ContaFy. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}