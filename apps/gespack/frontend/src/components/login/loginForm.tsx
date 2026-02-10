import React, { useState, useEffect } from "react"; // Importa los hooks useState de React
import { useNavigate } from "react-router-dom"; // Importa los hooks useNavigate y useLocation de React Router
//import { API_BASE_URL } from "../../config"; // Importa la URL base de la API
import { api } from "../../services/axiosConfig";
import "./loginForm.css"; // Importa los estilos del componente LoginForm
// Nota: nos apoyamos en cookie httpOnly; evitamos persistir tokens en storage.

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  //const location = useLocation();
  //const successMessage = location.state?.successMessage;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Hook de navegación

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    setTimeout(async () => {
      const form = event.target as HTMLFormElement;
      const email = form.elements.namedItem("email") as HTMLInputElement;
      const password = form.elements.namedItem("password") as HTMLInputElement;

      try {
        //const response = await fetch(`${API_BASE_URL}/auth/login`, {
        const { data } = await api.post("/auth/login", {
          email: email.value,
          password: password.value,
        });

        if (data?.success) {
          // Limpia cualquier error previo
          setError(null);

          // Redirección a selector de app
          navigate("/select-app", { replace: true });

          // Fallback por si existe un guard que intercepta y redirige al login antes de montar rutas protegidas:
          // fuerza navegación dura para respetar la cookie httpOnly ya seteada.
          setTimeout(() => {
            if (location.pathname !== "/select-app") {
              window.location.replace("/select-app");
            }
          }, 50);
        } else {
          setError(data?.message || "Credenciales incorrectas");
        }
      } catch (error) {
        setError("Error en la solicitud de inicio de sesión");
      }
      setIsLoading(false);
    }, 1000);
  }
  return (
    <div className="login-container">
      <div className="login-root">
        <div className="login-container-inner">
          {isLoading && (
            <div className="loadingOverlay">
              <div className="spinner"></div>
            </div>
          )}
          <img src="images/GesPack.png" alt="Logo" className="logo" />
          {/*{successMessage && <p style={{ color: "green" }}>{successMessage}</p>}*/}
          <form className="formLogin" onSubmit={handleLogin}>
            <div className="inputsButtonContainer">
              <h1>Iniciar sesión</h1>
              <input
                name="email"
                className="client"
                placeholder="Correo electrónico"
                type="email"
                style={{ borderColor: error ? "red" : "default" }}
                required
              />
              <input
                name="password"
                type="password"
                style={{ borderColor: error ? "red" : "default" }}
                placeholder="Password"
                required
              />
              <button type="submit">🔑&nbsp;&nbsp;&nbsp;Login</button>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
