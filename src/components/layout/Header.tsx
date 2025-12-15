import { useSession, signOut } from 'next-auth/react';
import { useThemeContext } from '@/context/ThemeContext';

export default function Header() {
  const { data: session } = useSession();
  const { isDarkMode, toggleTheme } = useThemeContext();

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
              💰 Controle Financeiro
            </h1>
            <p className="text-gray-300">Gerencie suas finanças de forma inteligente</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition text-2xl"
              title="Alternar tema"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="text-right">
              <p className="font-semibold">{session?.user?.name}</p>
              <p className="text-sm text-gray-300">{session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-semibold transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}