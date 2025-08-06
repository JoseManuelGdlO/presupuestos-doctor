import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase - Reemplaza con tus credenciales
const firebaseConfig = {
    apiKey: "AIzaSyAOST7FbtjLzFtwDPCUeyE2wKE5cYihhl4",
    authDomain: "presupuestos-doc.firebaseapp.com",
    projectId: "presupuestos-doc",
    storageBucket: "presupuestos-doc.firebasestorage.app",
    messagingSenderId: "158442981964",
    appId: "1:158442981964:web:144500c9587689117c02e9",
    measurementId: "G-NETB691Q8F"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancia de autenticación
export const auth = getAuth(app);

// Obtener instancia de Firestore
export const db = getFirestore(app);

export default app; 