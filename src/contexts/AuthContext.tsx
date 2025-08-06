import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { User, AuthState } from "@/types/auth";
import { 
  loginUser, 
  logoutUser, 
  onAuthStateChange, 
  getCurrentUser,
  registerUser,
  getUserData,
  getAuthErrorMessage 
} from "@/services/authService";
import { getCompanyById } from "@/services/companyService";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  company: any | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });
  const [company, setCompany] = useState<any | null>(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación de Firebase
    const unsubscribe = onAuthStateChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Usuario autenticado - obtener datos completos desde Firestore
        try {
          const userData = await getUserData(firebaseUser.uid);
          
          const user: User = {
            email: firebaseUser.email || '',
            name: userData?.name || firebaseUser.displayName || 'Usuario',
            role: userData?.role || 'user',
            uid: firebaseUser.uid,
            companyId: userData?.companyId
          };
          
          // Si el usuario tiene companyId, obtener los datos de la empresa
          if (userData?.companyId) {
            try {
              const companyData = await getCompanyById(userData.companyId);
              console.log('Company data loaded:', companyData);
              setCompany(companyData);
            } catch (error) {
              console.error('Error getting company data:', error);
            }
          } else {
            console.log('User has no company assigned');
          }
          
          setAuthState({
            isAuthenticated: true,
            user,
            loading: false,
          });
          
          // No redirigir aquí, dejar que los componentes de ruta manejen la navegación
        } catch (error: any) {
          console.error('Error getting user data:', error);
          
          // Si el usuario está eliminado o inactivo, cerrar sesión
          if (error.message === 'Usuario eliminado' || error.message === 'Usuario inactivo') {
            await logoutUser();
            setAuthState({
              isAuthenticated: false,
              user: null,
              loading: false,
            });
            setCompany(null);
            return;
          }
          
          // Para otros errores, también cerrar sesión por seguridad
          console.error('Error desconocido al obtener datos del usuario, cerrando sesión:', error);
          await logoutUser();
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
          });
          setCompany(null);
        }
      } else {
        // Usuario no autenticado
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
        });
        setCompany(null);
      }
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const firebaseUser = await loginUser(email, password);
      
      // Verificar si el usuario está eliminado
      try {
        const userData = await getUserData(firebaseUser.uid);
        
        // Si llegamos aquí, el usuario no está eliminado
        const user: User = {
          email: firebaseUser.email || '',
          name: userData?.name || firebaseUser.displayName || 'Usuario',
          role: userData?.role || 'user',
          uid: firebaseUser.uid,
          companyId: userData?.companyId
        };
        
        // Si el usuario tiene companyId, obtener los datos de la empresa
        if (userData?.companyId) {
          try {
            const companyData = await getCompanyById(userData.companyId);
            console.log('Company data loaded during login:', companyData);
            setCompany(companyData);
          } catch (error) {
            console.error('Error getting company data:', error);
          }
        } else {
          console.log('User has no company assigned during login');
        }
        
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
        
                 // No redirigir aquí, dejar que los componentes de ruta manejen la navegación
         
         return true;
             } catch (userDataError: any) {
         // Si hay error al obtener datos del usuario
         if (userDataError.message === 'Usuario eliminado') {
           // Cerrar sesión del usuario eliminado
           await logoutUser();
           throw new Error('Tu cuenta ha sido eliminada. Contacta al administrador.');
         } else if (userDataError.message === 'Usuario inactivo') {
           // Cerrar sesión del usuario inactivo
           await logoutUser();
           throw new Error('Tu cuenta ha sido deshabilitada. Contacta al administrador.');
         }
         throw userDataError;
       }
    } catch (error: any) {
      console.error("Error de login:", error);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw new Error(error.message || getAuthErrorMessage(error.code));
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      await registerUser(email, password);
      return true;
    } catch (error: any) {
      console.error("Error de registro:", error);
      throw new Error(getAuthErrorMessage(error.code));
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (error: any) {
      console.error("Error de logout:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    company,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 