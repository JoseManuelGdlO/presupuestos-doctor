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
import { Company, CompanyFormData } from '@/types/company';

// Obtener todas las empresas
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Company[];
  } catch (error) {
    console.error('Error getting companies:', error);
    throw error;
  }
};

// Obtener empresa por ID
export const getCompanyById = async (companyId: string): Promise<Company | null> => {
  try {
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      return {
        id: companyDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Company;
    }
    return null;
  } catch (error) {
    console.error('Error getting company:', error);
    throw error;
  }
};

// Crear nueva empresa
export const createCompany = async (companyData: CompanyFormData): Promise<Company> => {
  try {
    const companiesRef = collection(db, 'companies');
    const newCompany = {
      ...companyData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const docRef = await addDoc(companiesRef, newCompany);
    
    return {
      id: docRef.id,
      ...newCompany,
      createdAt: newCompany.createdAt.toDate(),
      updatedAt: newCompany.updatedAt.toDate(),
    } as Company;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

// Actualizar empresa
export const updateCompany = async (companyId: string, companyData: Partial<CompanyFormData>): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      ...companyData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Eliminar empresa
export const deleteCompany = async (companyId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'companies', companyId));
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
};

// Activar/Desactivar empresa
export const toggleCompanyStatus = async (companyId: string, isActive: boolean): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', companyId);
    await updateDoc(companyRef, {
      isActive,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error toggling company status:', error);
    throw error;
  }
}; 