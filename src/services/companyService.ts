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
export const getCompanyById = async (id: string): Promise<Company | null> => {
  try {
    const companyDoc = await getDoc(doc(db, 'companies', id));
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
    console.error('Error getting company by ID:', error);
    throw error;
  }
};

// Obtener información del doctor desde la empresa
export const getDoctorInfo = async (companyId: string) => {
  try {
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      return {
        name: data.doctorName || 'Yomaira García Flores',
        specialty: data.doctorSpecialty || 'Especialista en Odontopediatría',
        certifications: data.doctorCertifications || [
          'Certificado por Colegio Mexicano de Odontología Pediátrica',
          'Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298',
          'Formación en psicología infantil - C.E.T.A.P Puebla'
        ],
        initials: data.doctorInitials || 'YG'
      };
    }
    // Valores por defecto si no se encuentra la empresa
    return {
      name: 'Yomaira García Flores',
      specialty: 'Especialista en Odontopediatría',
      certifications: [
        'Certificado por Colegio Mexicano de Odontología Pediátrica',
        'Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298',
        'Formación en psicología infantil - C.E.T.A.P Puebla'
      ],
      initials: 'YG'
    };
  } catch (error) {
    console.error('Error getting doctor info:', error);
    // Valores por defecto en caso de error
    return {
      name: 'Yomaira García Flores',
      specialty: 'Especialista en Odontopediatría',
      certifications: [
        'Certificado por Colegio Mexicano de Odontología Pediátrica',
        'Cédula licenciatura UAEI 9834567 - Cédula especialidad UAT 10584298',
        'Formación en psicología infantil - C.E.T.A.P Puebla'
      ],
      initials: 'YG'
    };
  }
};

// Obtener observaciones importantes desde la empresa
export const getImportantObservations = async (companyId: string) => {
  try {
    const companyDoc = await getDoc(doc(db, 'companies', companyId));
    if (companyDoc.exists()) {
      const data = companyDoc.data();
      return data.importantObservations || 'Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el presupuesto se pueden ver modificados.';
    }
    // Valor por defecto si no se encuentra la empresa
    return 'Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el presupuesto se pueden ver modificados.';
  } catch (error) {
    console.error('Error getting important observations:', error);
    // Valor por defecto en caso de error
    return 'Hay que considerar que entre más avance el tiempo el daño avanza y tanto el tratamiento como el presupuesto se pueden ver modificados.';
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
export const updateCompany = async (id: string, companyData: Partial<CompanyFormData>): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', id);
    await updateDoc(companyRef, {
      ...companyData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

// Eliminar empresa (eliminación lógica)
export const deleteCompany = async (id: string): Promise<void> => {
  try {
    const companyRef = doc(db, 'companies', id);
    await updateDoc(companyRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
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