import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LogoutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      
      // Redirigir al login
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Cerrar Sesión
    </Button>
  );
};

export default LogoutButton; 