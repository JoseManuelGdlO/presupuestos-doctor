import { useState, useEffect } from 'react';
import { Treatment, TreatmentFormData } from '@/types/treatment';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useTreatments = (companyId?: string) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar tratamientos desde Firestore por empresa
  useEffect(() => {
    const loadTreatments = async () => {
      if (!companyId) {
        setLoading(false);
        return;
      }

      try {
        const treatmentsRef = collection(db, 'treatments');
        const q = query(
          treatmentsRef, 
          where('companyId', '==', companyId)
        );
        const querySnapshot = await getDocs(q);
        
        const loadedTreatments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        })) as Treatment[];

        // Ordenar por nombre en el cliente
        const sortedTreatments = loadedTreatments.sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setTreatments(sortedTreatments);
      } catch (error) {
        console.error('Error loading treatments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTreatments();
  }, [companyId]);

  // Agregar tratamiento
  const addTreatment = async (treatmentData: TreatmentFormData) => {
    if (!companyId) throw new Error('Company ID is required');

    try {
      const treatmentsRef = collection(db, 'treatments');
      const newTreatment = {
        ...treatmentData,
        companyId,
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(treatmentsRef, newTreatment);
      
      const createdTreatment: Treatment = {
        id: docRef.id,
        ...newTreatment,
        createdAt: newTreatment.createdAt.toDate(),
        updatedAt: newTreatment.updatedAt.toDate(),
      };

      setTreatments(prev => [...prev, createdTreatment]);
      return createdTreatment;
    } catch (error) {
      console.error('Error adding treatment:', error);
      throw error;
    }
  };

  // Actualizar tratamiento
  const updateTreatment = async (id: string, treatmentData: Partial<TreatmentFormData>) => {
    try {
      const treatmentRef = doc(db, 'treatments', id);
      await updateDoc(treatmentRef, {
        ...treatmentData,
        updatedAt: Timestamp.now(),
      });

      setTreatments(prev => prev.map(treatment =>
        treatment.id === id
          ? { ...treatment, ...treatmentData, updatedAt: new Date() }
          : treatment
      ));
    } catch (error) {
      console.error('Error updating treatment:', error);
      throw error;
    }
  };

  // Eliminar tratamiento
  const deleteTreatment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'treatments', id));
      setTreatments(prev => prev.filter(treatment => treatment.id !== id));
    } catch (error) {
      console.error('Error deleting treatment:', error);
      throw error;
    }
  };

  // Cambiar estado activo/inactivo
  const toggleTreatmentStatus = async (id: string) => {
    try {
      const treatment = treatments.find(t => t.id === id);
      if (!treatment) throw new Error('Treatment not found');

      const treatmentRef = doc(db, 'treatments', id);
      await updateDoc(treatmentRef, {
        isActive: !treatment.isActive,
        updatedAt: Timestamp.now(),
      });

      setTreatments(prev => prev.map(t =>
        t.id === id ? { ...t, isActive: !t.isActive, updatedAt: new Date() } : t
      ));
    } catch (error) {
      console.error('Error toggling treatment status:', error);
      throw error;
    }
  };

  // Obtener tratamientos activos
  const getActiveTreatments = () => {
    return treatments.filter(treatment => treatment.isActive);
  };

  // Obtener tratamiento por nombre
  const getTreatmentByName = (name: string) => {
    return treatments.find(treatment => treatment.name === name);
  };

  // Obtener costo de tratamiento por nombre
  const getTreatmentCost = (name: string) => {
    const treatment = getTreatmentByName(name);
    return treatment ? treatment.cost : 0;
  };

  return {
    treatments,
    loading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    toggleTreatmentStatus,
    getActiveTreatments,
    getTreatmentByName,
    getTreatmentCost,
  };
}; 