import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

const RedirectIfAuthenticated = ({ children }: RedirectIfAuthenticatedProps) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-dental-soft flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-dental-pink" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, redirigir basado en el rol
  if (isAuthenticated && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // Si no está autenticado, mostrar el contenido (login)
  return <>{children}</>;
};

export default RedirectIfAuthenticated; 