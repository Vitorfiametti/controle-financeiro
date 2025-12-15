import Link from 'next/link';
import { useRouter } from 'next/router';

const menuItems = [
  { label: '📊 Dashboard', href: '/dashboard' },
  { label: '📝 Lançamento', href: '/lancamento' },
  { label: '📋 Histórico', href: '/historico' },
  { label: '💰 Investimentos', href: '/investimentos' },
];

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="bg-gradient-to-r from-gray-700 to-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-center">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-8 py-4 text-white font-semibold transition-all
                hover:bg-white hover:bg-opacity-10 hover:translate-y-[-2px]
                ${isActive ? 'bg-white bg-opacity-15 border-b-4 border-blue-400' : ''}
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}