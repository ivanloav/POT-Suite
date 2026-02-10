import { useState } from 'react';
import { LogOut, Sun, Moon, Info } from 'lucide-react';
import { SuiteTopbar, SuiteTopbarActionButton } from '@pot/ui-kit';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { SUITE_LOGIN_URL } from '@/config';
import { useThemeStore } from '@/store/themeStore';
import AboutModal from '@/components/common/AboutModal';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    window.location.href = SUITE_LOGIN_URL;
  };

  return (
    <>
      <SuiteTopbar
        title="IT Inventory"
        logoSrc="/logo.png"
        logoAlt="IT Inventory"
        userLabel={user?.userName || user?.email}
        actions={
          <>
            <SuiteTopbarActionButton
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-yellow-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </SuiteTopbarActionButton>
            <SuiteTopbarActionButton
              title="Acerca de"
              onClick={() => setShowAboutModal(true)}
            >
              <Info className="h-4 w-4" />
            </SuiteTopbarActionButton>
          </>
        }
        menuItems={[
          {
            id: 'logout',
            label: 'Salir',
            icon: <LogOut className="h-4 w-4" />,
            onClick: handleLogout,
          },
        ]}
      />

      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)} 
      />
    </>
  );
}
