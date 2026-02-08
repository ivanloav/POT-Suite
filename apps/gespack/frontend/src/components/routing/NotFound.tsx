import { useNavigate } from "react-router-dom";
import "./NotFound.css"; // si quieres estilos

export function NotFound() {
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
    <div className="notfound-container">
      <h1>404</h1>
      <p>Página no encontrada</p>
      <button onClick={handleClick} className="btn">
        Volver al inicio
      </button>
    </div>
  );
}