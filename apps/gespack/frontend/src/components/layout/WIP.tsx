
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import "./WIP.css";

export const WIP: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        navigate('/user/dashboard');
      } else {
        navigate('/');
      }
    } catch {
      navigate('/');
    }
  };

  return (
    <div className="wip-container">
      <AlertTriangle className="wip-icon" />
      <h2 className="wip-title">🚧 Página en desarrollo</h2>
      <p className="wip-text">
        Esta sección está en construcción. Pronto estará disponible con todas sus funcionalidades.
      </p>
      <button onClick={handleClick} className="wip-btn">
        Volver al inicio
      </button>
    </div>
  );
};

