import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dental-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dental-pink"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es admin, redirigir al panel de administración
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default UserRoute; 