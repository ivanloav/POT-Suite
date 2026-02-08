
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { LogOut, User, Sun, Moon, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import { useState } from 'react';
import AboutModal from '@/components/common/AboutModal';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="IT Inventory Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              IT Inventory
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-800 dark:text-gray-200" />
              <span className="text-sm text-gray-700 dark:text-white">
                {user?.userName || user?.email}
              </span>
              <button
                onClick={toggleTheme}
                className="ml-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-gray-700" />}
              </button>
              <button
                onClick={() => setShowAboutModal(true)}
                className="ml-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Acerca de"
              >
                <Info className="h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
    </>
  );
}
