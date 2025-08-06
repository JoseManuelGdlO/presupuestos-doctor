import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuración de Firebase - EJEMPLO
// Reemplaza estos valores con los de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC-tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancia de autenticación
export const auth = getAuth(app);

export default app; 