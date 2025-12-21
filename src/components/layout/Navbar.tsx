import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import Image from 'next/image';
import { useThemeContext } from '@/context/ThemeContext';

const menuItems = [
  { label: 'Painel', href: '/dashboard', icon: '📊' },
  { label: 'Lançamentos', href: '/lancamento', icon: '💰' },
  { label: 'Investimentos', href: '/investimentos', icon: '📈' },
  { label: 'Histórico', href: '/historico', icon: '📜' },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useThemeContext();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // ← AQUI: mudei para '/'
  };

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo ContaFy */}
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <Image 
              src="/logo-contafy.png" 
              alt="ContaFy" 
              width={240}
              height={60}
              className="h-200 w-auto"
              priority
            />
          </Link>

          {/* Menu Central - Sem fundo nos inativos */}
          <div className="flex items-center gap-3">
            {menuItems.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-900 text-white shadow-lg shadow-blue-800/30' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Direita: Botão Tema + Menu do Usuário */}
          <div className="flex items-center gap-3">
            
            {/* Botão de Tema */}
            <button
              onClick={toggleTheme}
              className="hover:bg-slate-700/50 p-2.5 rounded-xl transition-all text-xl text-slate-300"
              title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700/50 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {getUserInitials(session?.user?.name)}
                  </span>
                </div>
                <span className="text-white text-sm font-medium hidden md:block">
                  {session?.user?.name?.split(' ')[0] || 'Usuário'}
                </span>
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  
                  <div className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <p className="text-sm font-medium text-white">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    
                    <Link 
                      href="/perfil" 
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>👤</span> Meu Perfil
                    </Link>
                    
                    <Link 
                      href="/configuracoes" 
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-slate-700 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙️</span> Configurações
                    </Link>
                    
                    <div className="border-t border-slate-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                      >
                        <span>🚪</span> Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}