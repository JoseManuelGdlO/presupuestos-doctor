import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface AuthErrorWithCode extends AuthError {
  code: string;
}

// Registrar nuevo usuario
export const registerUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error as AuthErrorWithCode;
  }
};

// Iniciar sesión
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error as AuthErrorWithCode;
  }
};

// Cerrar sesión
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error as AuthErrorWithCode;
  }
};

// Escuchar cambios en el estado de autenticación
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Obtener información completa del usuario desde Firestore
export const getUserData = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      console.log('User data retrieved:', { 
        uid, 
        isDeleted: userData.isDeleted, 
        isActive: userData.isActive,
        email: userData.email 
      });
      
      // Verificar si el usuario está eliminado lógicamente
      if (userData.isDeleted === true) {
        console.log('User is logically deleted, access denied');
        throw new Error('Usuario eliminado');
      }
      
      // Verificar si el usuario está activo
      if (userData.isActive === false) {
        console.log('User is inactive, access denied');
        throw new Error('Usuario inactivo');
      }
      
      return userData;
    }
    console.log('User document does not exist:', uid);
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Crear o actualizar documento de usuario en Firestore
export const createUserDocument = async (uid: string, userData: any) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      isActive: true, // Por defecto, los usuarios nuevos están activos
      isDeleted: false, // Por defecto, los usuarios nuevos no están eliminados
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Filtrar usuarios eliminados lógicamente
      if (data.isDeleted === true) {
        return null;
      }
      
      return {
        uid: doc.id,
        email: data.email || '',
        name: data.name || '',
        role: data.role || 'user',
        companyId: data.companyId || null,
        isActive: data.isActive !== false, // Por defecto true si no está definido
        isDeleted: data.isDeleted === true, // Por defecto false si no está definido
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      };
    }).filter(user => user !== null); // Filtrar usuarios null
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Función para obtener mensaje de error en español
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No existe una cuenta con este email';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con este email';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Intenta más tarde';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu internet';
    default:
      return 'Error de autenticación. Intenta de nuevo';
  }
};

// Eliminar usuario de Firestore
export const deleteUserDocument = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    console.error('Error deleting user document:', error);
    throw error;
  }
};

// Eliminación lógica del usuario (solo marcar como eliminado)
export const deleteUserCompletely = async (uid: string) => {
  try {
    console.log('Performing logical deletion for user:', uid);
    
    // Solo marcar el usuario como eliminado (eliminación lógica)
    await setDoc(doc(db, 'users', uid), {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('User logically deleted successfully:', uid);
    return true;
  } catch (error) {
    console.error('Error performing logical deletion:', error);
    throw error;
  }
};

// Deshabilitar usuario (más seguro que eliminar)
export const disableUser = async (uid: string) => {
  try {
    console.log('Disabling user:', uid);
    
    await setDoc(doc(db, 'users', uid), {
      isActive: false,
      disabledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('User disabled successfully:', uid);
    return true;
  } catch (error) {
    console.error('Error disabling user:', error);
    throw error;
  }
};

// Habilitar usuario
export const enableUser = async (uid: string) => {
  try {
    console.log('Enabling user:', uid);
    
    await setDoc(doc(db, 'users', uid), {
      isActive: true,
      enabledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('User enabled successfully:', uid);
    return true;
  } catch (error) {
    console.error('Error enabling user:', error);
    throw error;
  }
};

// Función de debug para verificar el estado de un usuario
export const debugUserStatus = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('Debug - User status:', {
        uid,
        exists: true,
        isDeleted: userData.isDeleted,
        isActive: userData.isActive,
        email: userData.email,
        role: userData.role,
        fullData: userData
      });
      return userData;
    } else {
      console.log('Debug - User does not exist:', uid);
      return null;
    }
  } catch (error) {
    console.error('Debug - Error checking user status:', error);
    throw error;
  }
};